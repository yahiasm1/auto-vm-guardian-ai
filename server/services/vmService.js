
const { exec, spawn } = require('child_process');
const util = require('util');
const vmDbService = require('./vmDbService');

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
      // Get live VM state from libvirt
      const command = onlyRunning ? 'virsh list' : 'virsh list --all';
      const { stdout } = await execPromise(command);
      
      // Parse the output to extract VM information
      const lines = stdout.trim().split('\n').slice(2); // Skip header lines
      const virshVms = lines.map(line => {
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
      
      // Get VMs from database
      const dbVms = await vmDbService.getAllVMs(
        onlyRunning ? { state: 'running' } : {}
      );
      
      // Merge virsh data with database data
      const mergedVms = virshVms.map(virshVm => {
        const dbVm = dbVms.find(vm => vm.name === virshVm.name);
        if (dbVm) {
          // Update database with current state if different
          if (dbVm.state !== this._mapStateToDbState(virshVm.state)) {
            vmDbService.updateVMState(virshVm.name, this._mapStateToDbState(virshVm.state))
              .catch(err => console.error(`Error updating VM state in DB: ${err.message}`));
          }
          
          return {
            ...dbVm,
            id: virshVm.id,
            state: virshVm.state,
          };
        }
        
        // If VM is in virsh but not in DB, create a basic record
        this._createBasicVMRecord(virshVm)
          .catch(err => console.error(`Error creating basic VM record: ${err.message}`));
        
        return virshVm;
      });
      
      return mergedVms;
    } catch (error) {
      console.error('Error listing VMs:', error);
      
      // If libvirt fails, try to return data from database
      try {
        const dbVms = await vmDbService.getAllVMs();
        return dbVms;
      } catch (dbError) {
        console.error('Error getting VMs from database:', dbError);
        throw new Error(`Failed to list VMs: ${error.message}`);
      }
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'running');
      
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'stopped');
      
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'shutting down');
      
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
      
      // Delete VM from database
      await vmDbService.deleteVM(vmName);
      
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'restarting');
      
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
      
      // Get VM from database for additional info
      let vmFromDb;
      try {
        vmFromDb = await vmDbService.getVMByName(vmName);
      } catch (dbError) {
        console.error(`Warning: Could not get VM from database: ${dbError.message}`);
      }
      
      const vmInfo = {
        ...info,
        memory_stats: memStats,
        name: vmName
      };
      
      // If VM exists in database, merge with additional info
      if (vmFromDb) {
        // Update database with current state if different
        if (vmFromDb.state !== this._mapStateToDbState(info.state)) {
          await vmDbService.updateVMState(vmName, this._mapStateToDbState(info.state));
        }
        
        // Add additional info from database
        vmInfo.description = vmFromDb.description;
        vmInfo.ip_address = vmFromDb.ip_address;
        vmInfo.user_id = vmFromDb.user_id;
        vmInfo.created_at = vmFromDb.created_at;
        vmInfo.updated_at = vmFromDb.updated_at;
      } else {
        // Create basic VM record if it doesn't exist
        await this._createBasicVMRecord({
          name: vmName,
          state: info.state,
          uuid: info.uuid
        });
      }
      
      return vmInfo;
    } catch (error) {
      console.error(`Error getting info for VM ${vmName}:`, error);
      
      // Try to get VM info from database if libvirt fails
      try {
        const vmFromDb = await vmDbService.getVMByName(vmName);
        if (vmFromDb) {
          return vmFromDb;
        }
      } catch (dbError) {
        console.error(`Error getting VM from database: ${dbError.message}`);
      }
      
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'suspended');
      
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
      
      // Update VM state in database
      await vmDbService.updateVMState(vmName, 'running');
      
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
  
  /**
   * Create a new VM record in the database
   * @param {Object} vmData - Basic VM data
   * @private
   */
  async _createBasicVMRecord(vmData) {
    try {
      // Extract basic info from libvirt data
      const { name, state, uuid } = vmData;
      
      // Create VM record in database
      await vmDbService.createVM({
        name,
        state: this._mapStateToDbState(state),
        uuid,
      });
      
      console.log(`Created basic VM record for ${name} in database`);
    } catch (error) {
      console.error(`Error creating basic VM record for ${vmData.name}:`, error);
      // Don't throw, this is a background operation
    }
  }
  
  /**
   * Map libvirt state to database state
   * @param {string} virshState - Virsh state string
   * @returns {string} - Database state
   * @private
   */
  _mapStateToDbState(virshState) {
    if (!virshState) return 'unknown';
    
    const state = virshState.toLowerCase();
    if (state.includes('running')) return 'running';
    if (state.includes('shut off') || state.includes('shutoff')) return 'stopped';
    if (state.includes('paused')) return 'paused';
    if (state.includes('suspended')) return 'suspended';
    if (state.includes('crashed')) return 'crashed';
    if (state.includes('in shutdown')) return 'shutting down';
    if (state.includes('pmsuspended')) return 'hibernated';
    
    return 'unknown';
  }
}

module.exports = new VMService();
