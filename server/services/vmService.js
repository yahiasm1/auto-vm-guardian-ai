
const { exec, spawn } = require('child_process');
const util = require('util');

// Convert exec to Promise-based
const execPromise = util.promisify(exec);

/**
 * VM Management Service using libvirt commands
 */
class VMService {
  /**
   * List all VMs
   * @param {boolean} onlyRunning - If true, list only running VMs
   * @returns {Promise<Array>} - List of VMs
   */
  async listVMs(onlyRunning = false) {
    try {
      const command = onlyRunning ? 'virsh list' : 'virsh list --all';
      const { stdout } = await execPromise(command);
      
      // Parse the output to extract VM information
      const lines = stdout.trim().split('\n').slice(2); // Skip header lines
      const vms = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const id = parts[0];
          // Join the name parts if the name contains spaces
          const name = parts.slice(1, -1).join(' ');
          const state = parts[parts.length - 1];
          return { id: id !== '-' ? id : null, name, state };
        }
        return null;
      }).filter(Boolean);
      
      return vms;
    } catch (error) {
      console.error('Error listing VMs:', error);
      throw new Error(`Failed to list VMs: ${error.message}`);
    }
  }

  /**
   * Start a VM
   * @param {string} vmName - Name of the VM to start
   * @returns {Promise<Object>} - Result of the operation
   */
  async startVM(vmName) {
    try {
      const { stdout, stderr } = await execPromise(`virsh start "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} started successfully`,
        vmName
      };
    } catch (error) {
      console.error(`Error starting VM ${vmName}:`, error);
      throw new Error(`Failed to start VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Stop a VM (forcefully)
   * @param {string} vmName - Name of the VM to stop
   * @returns {Promise<Object>} - Result of the operation
   */
  async stopVM(vmName) {
    try {
      const { stdout, stderr } = await execPromise(`virsh destroy "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} stopped successfully`,
        vmName
      };
    } catch (error) {
      console.error(`Error stopping VM ${vmName}:`, error);
      throw new Error(`Failed to stop VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Shutdown a VM (gracefully)
   * @param {string} vmName - Name of the VM to shutdown
   * @returns {Promise<Object>} - Result of the operation
   */
  async shutdownVM(vmName) {
    try {
      const { stdout, stderr } = await execPromise(`virsh shutdown "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} is shutting down`,
        vmName
      };
    } catch (error) {
      console.error(`Error shutting down VM ${vmName}:`, error);
      throw new Error(`Failed to shutdown VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Delete/Undefine a VM
   * @param {string} vmName - Name of the VM to delete
   * @param {boolean} removeStorage - Whether to remove associated storage as well
   * @returns {Promise<Object>} - Result of the operation
   */
  async deleteVM(vmName, removeStorage = false) {
    try {
      let command = `virsh undefine "${vmName}"`;
      if (removeStorage) {
        command += ' --remove-all-storage';
      }
      
      const { stdout, stderr } = await execPromise(command);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} deleted successfully`,
        vmName
      };
    } catch (error) {
      console.error(`Error deleting VM ${vmName}:`, error);
      throw new Error(`Failed to delete VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Restart a VM
   * @param {string} vmName - Name of the VM to restart
   * @returns {Promise<Object>} - Result of the operation
   */
  async restartVM(vmName) {
    try {
      const { stdout, stderr } = await execPromise(`virsh reboot "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} is restarting`,
        vmName
      };
    } catch (error) {
      console.error(`Error restarting VM ${vmName}:`, error);
      throw new Error(`Failed to restart VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Get detailed info about a VM
   * @param {string} vmName - Name of the VM
   * @returns {Promise<Object>} - VM details
   */
  async getVMInfo(vmName) {
    try {
      // Get basic dominfo
      const { stdout: basicInfo } = await execPromise(`virsh dominfo "${vmName}"`);
      
      // Parse the basic info
      const info = {};
      basicInfo.split('\n').forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          info[key.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      });
      
      // Get CPU and memory stats
      const { stdout: statsOut } = await execPromise(`virsh dommemstat "${vmName}"`);
      const memStats = {};
      statsOut.split('\n').forEach(line => {
        const [key, value] = line.split(/\s+/).map(s => s.trim());
        if (key && value) {
          memStats[key] = value;
        }
      });
      
      return {
        ...info,
        memory_stats: memStats,
        name: vmName
      };
    } catch (error) {
      console.error(`Error getting info for VM ${vmName}:`, error);
      throw new Error(`Failed to get VM info for ${vmName}: ${error.message}`);
    }
  }

  /**
   * Suspend a VM
   * @param {string} vmName - Name of the VM to suspend
   * @returns {Promise<Object>} - Result of the operation
   */
  async suspendVM(vmName) {
    try {
      const { stdout } = await execPromise(`virsh suspend "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} suspended successfully`,
        vmName
      };
    } catch (error) {
      console.error(`Error suspending VM ${vmName}:`, error);
      throw new Error(`Failed to suspend VM ${vmName}: ${error.message}`);
    }
  }

  /**
   * Resume a suspended VM
   * @param {string} vmName - Name of the VM to resume
   * @returns {Promise<Object>} - Result of the operation
   */
  async resumeVM(vmName) {
    try {
      const { stdout } = await execPromise(`virsh resume "${vmName}"`);
      return {
        success: true,
        message: stdout.trim() || `VM ${vmName} resumed successfully`,
        vmName
      };
    } catch (error) {
      console.error(`Error resuming VM ${vmName}:`, error);
      throw new Error(`Failed to resume VM ${vmName}: ${error.message}`);
    }
  }
}

module.exports = new VMService();
