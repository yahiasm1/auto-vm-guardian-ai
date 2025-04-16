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

      // Try with sudo fallback if allowed and this is a permission issue
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

    // 1. Validate VM type against DB
    const vmTypeResult = await query(`SELECT * FROM vm_types WHERE id = $1`, [
      vm_type_id,
    ]);
    const vmType = vmTypeResult.rows[0];

    if (!vmType) {
      throw new Error("Invalid VM Type selected. No matching type found.");
    }

    if (vmType.os_type !== os_type || vmType.iso_path !== iso_path) {
      throw new Error(
        "VM type mismatch: OS type or ISO path does not match the selected VM type."
      );
    }

    // 2. Prepare paths and VM disk
    const vmDiskId = uuidv4();
    const sanitizedName = name.replace(/\s+/g, "-");
    const diskPath = `/var/lib/libvirt/images/vms/${sanitizedName}-${vmDiskId}.qcow2`;
    const isoFullPath = path.resolve(iso_path);

    const createDiskCmd = `qemu-img create -f qcow2 "${diskPath}" ${parseInt(
      storage
    )}G`;
    await runCommand(createDiskCmd, true);

    // 3. Run virt-install
    const installCmd = `virt-install \
      --name "${name}" \
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

    // 4. Save metadata to DB
    const createdVM = await vmDbService.createVM({
      name,
      memory,
      vcpus,
      storage: `${storage}G`,
      os_type,
      disk_path: diskPath,
      iso_path,
      user_id,
      description,
      ip_address,
      vm_type_id,
      state: "running",
    });

    return {
      success: true,
      message: `VM ${name} created successfully`,
      vm: createdVM,
    };
  }

  async startVM(name) {
    await runCommand(`virsh start ${name}`);
    const updated = await vmDbService.updateVMState(name, "running");
    return { success: true, message: `VM ${name} started`, vm: updated };
  }

  async stopVM(name) {
    await runCommand(`virsh destroy ${name}`);
    const updated = await vmDbService.updateVMState(name, "stopped");
    return { success: true, message: `VM ${name} stopped`, vm: updated };
  }

  async shutdownVM(name) {
    await runCommand(`virsh shutdown ${name}`);
    const updated = await vmDbService.updateVMState(name, "shutting-down");
    return {
      success: true,
      message: `VM ${name} is shutting down`,
      vm: updated,
    };
  }

  async restartVM(name) {
    await runCommand(`virsh reboot ${name}`);
    return { success: true, message: `VM ${name} restarted` };
  }

  async suspendVM(name) {
    await runCommand(`virsh suspend ${name}`);
    const updated = await vmDbService.updateVMState(name, "suspended");
    return { success: true, message: `VM ${name} suspended`, vm: updated };
  }

  async resumeVM(name) {
    await runCommand(`virsh resume ${name}`);
    const updated = await vmDbService.updateVMState(name, "running");
    return { success: true, message: `VM ${name} resumed`, vm: updated };
  }

  async deleteVM(name, removeStorage = false) {
    const vm = await vmDbService.getVMByName(name);
    await runCommand(`virsh destroy ${name}`).catch(() => {});
    await runCommand(`virsh undefine ${name}`);

    if (removeStorage) {
      await runCommand(`rm -f "${vm.disk_path}"`);
    }

    const deleted = await vmDbService.deleteVM(name);
    return { success: true, message: `VM ${name} deleted`, deleted };
  }

  async getVMInfo(name) {
    const result = await runCommand(`virsh dominfo ${name}`);
    return { name, info: result };
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

    const merged = allVMsFromDb
      .filter((vm) => activeVMs.find((v) => v.name === vm.name) !== undefined)
      .map((vm) => {
        const match = activeVMs.find((v) => v.name === vm.name);
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

    // 1. Read all .qcow2 files in the directory
    const allFiles = await fs.readdir(diskDir);
    const qcowFiles = allFiles.filter((file) => file.endsWith(".qcow2"));

    // 2. Get all disk paths from the DB
    const allVMs = await vmDbService.getAllVMs();
    const usedPaths = allVMs.map((vm) => vm.disk_path);

    // 3. Determine unused files
    const unused = qcowFiles.filter((filename) => {
      const fullPath = `${diskDir}/${filename}`;
      return !usedPaths.includes(fullPath);
    });

    // 4. Delete unused files
    for (const filename of unused) {
      const fullPath = `${diskDir}/${filename}`;
      await runCommand(`rm -f "${fullPath}"`, true);
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
