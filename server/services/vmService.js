const { exec } = require("child_process");
const path = require("path");
const vmDbService = require("./vmDbService");
const { query } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

function runCommand(cmd, allowSudoFallback = false) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (!err) return resolve(stdout.trim());

      const permissionDenied = stderr.includes("Permission denied");

      if (permissionDenied && allowSudoFallback && !cmd.startsWith("sudo")) {
        const sudoCmd = `sudo ${cmd}`;
        console.warn(`[Permission denied] Retrying with sudo: ${sudoCmd}`);
        return exec(sudoCmd, (sudoErr, sudoOut, sudoErrOut) => {
          if (sudoErr) return reject(new Error(sudoErrOut || sudoErr.message));
          return resolve(sudoOut.trim());
        });
      }

      return reject(new Error(stderr || err.message));
    });
  });
}

class VMService {
  async createVM(vmData) {
    const {
      name,
      memory,
      vcpus,
      storage,
      os_type,
      iso_path,
      vm_type_id,
      user_id,
      description,
      ip_address,
    } = vmData;

    const vmTypeResult = await query("SELECT * FROM vm_types WHERE id = $1", [
      vm_type_id,
    ]);
    const vmType = vmTypeResult.rows[0];

    if (!vmType)
      throw new Error("Invalid VM Type selected. No matching type found.");
    if (vmType.os_type !== os_type || vmType.iso_path !== iso_path) {
      throw new Error(
        "VM type mismatch: OS type or ISO path does not match the selected VM type."
      );
    }

    const uuid = uuidv4();
    const sanitizedName = name.replace(/\s+/g, "-");
    const libvirtName = `${sanitizedName}-${uuid}`;
    const diskPath = `/var/lib/libvirt/images/vms/${libvirtName}.qcow2`;
    const isoFullPath = path.resolve(iso_path);

    const createDiskCmd = `qemu-img create -f qcow2 \"${diskPath}\" ${parseInt(
      storage
    )}G`;
    await runCommand(createDiskCmd, true);

    const installCmd = `virt-install \
      --name \"${libvirtName}\" \
      --ram ${memory} \
      --vcpus ${vcpus} \
      --disk path=\"${diskPath}\",format=qcow2 \
      --os-variant generic \
      --network network=default \
      --graphics none \
      --cdrom \"${isoFullPath}\" \
      --noautoconsole \
      --quiet`;

    await runCommand(installCmd);

    const createdVM = await vmDbService.createVM({
      name,
      memory,
      vcpus,
      storage,
      os_type,
      disk_path: diskPath,
      iso_path,
      user_id,
      description,
      ip_address,
      vm_type_id,
      state: "running",
      libvirt_name: libvirtName,
      uuid,
    });

    return {
      success: true,
      message: `VM ${name} created successfully`,
      vm: createdVM,
    };
  }

  async startVM(libvirtName) {
    await runCommand(`virsh start ${libvirtName}`);
    const updated = await vmDbService.updateVMState(libvirtName, "running");
    return { success: true, message: `VM ${libvirtName} started`, vm: updated };
  }

  async stopVM(libvirtName) {
    await runCommand(`virsh destroy ${libvirtName}`);
    const updated = await vmDbService.updateVMState(libvirtName, "stopped");
    return { success: true, message: `VM ${libvirtName} stopped`, vm: updated };
  }

  async shutdownVM(libvirtName) {
    await runCommand(`virsh shutdown ${libvirtName}`);
    const updated = await vmDbService.updateVMState(
      libvirtName,
      "shutting-down"
    );
    return {
      success: true,
      message: `VM ${libvirtName} is shutting down`,
      vm: updated,
    };
  }

  async restartVM(libvirtName) {
    await runCommand(`virsh reboot ${libvirtName}`);
    return { success: true, message: `VM ${libvirtName} restarted` };
  }

  async suspendVM(libvirtName) {
    await runCommand(`virsh suspend ${libvirtName}`);
    const updated = await vmDbService.updateVMState(libvirtName, "suspended");
    return {
      success: true,
      message: `VM ${libvirtName} suspended`,
      vm: updated,
    };
  }

  async resumeVM(libvirtName) {
    await runCommand(`virsh resume ${libvirtName}`);
    const updated = await vmDbService.updateVMState(libvirtName, "running");
    return { success: true, message: `VM ${libvirtName} resumed`, vm: updated };
  }

  async deleteVM(libvirtName, removeStorage = false) {
    const vm = await vmDbService.getVMByName(libvirtName);
    await runCommand(`virsh destroy ${libvirtName}`).catch(() => {});
    await runCommand(`virsh undefine ${libvirtName}`);

    if (removeStorage) {
      await runCommand(`rm -f \"${vm.disk_path}\"`);
    }

    const deleted = await vmDbService.deleteVM(libvirtName);
    return { success: true, message: `VM ${libvirtName} deleted`, deleted };
  }

  async getVMInfo(libvirtName) {
    const result = await runCommand(`virsh dominfo ${libvirtName}`);
    return { name: libvirtName, info: result };
  }

  async listVMs(onlyRunning = false) {
    const flag = onlyRunning ? "" : "--all";
    const virshOutput = await runCommand(`virsh list ${flag}`);

    const activeVMs = virshOutput
      .split("\n")
      .slice(2)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s{2,}/);
        return {
          id: parts[0],
          name: parts[1],
          state: parts[2] || "unknown",
        };
      });

    const allVMsFromDb = await vmDbService.getAllVMs();

    const merged = allVMsFromDb.map((vm) => {
      const match = activeVMs.find((v) => v.name === vm.libvirt_name);
      return {
        ...vm,
        real_state: match ? match.state : "shut off",
        virsh_id: match ? match.id : null,
      };
    });

    return merged;
  }

  async cleanUnusedDisks() {
    const fs = require("fs/promises");
    const diskDir = "/var/lib/libvirt/images/vms";
    const allFiles = await fs.readdir(diskDir);
    const qcowFiles = allFiles.filter((file) => file.endsWith(".qcow2"));
    const allVMs = await vmDbService.getAllVMs();
    const usedPaths = allVMs.map((vm) => vm.disk_path);

    const unused = qcowFiles.filter((filename) => {
      const fullPath = `${diskDir}/${filename}`;
      return !usedPaths.includes(fullPath);
    });

    for (const filename of unused) {
      const fullPath = `${diskDir}/${filename}`;
      await runCommand(`rm -f \"${fullPath}\"`, true);
      console.log(`[cleaned] Deleted unused disk: ${fullPath}`);
    }

    return {
      success: true,
      deleted: unused,
      count: unused.length,
    };
  }
}

module.exports = new VMService();
