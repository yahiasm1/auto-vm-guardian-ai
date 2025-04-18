const { query } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

/**
 * VM Database Service for handling VM database operations
 */
class VMDbService {
  /**
   * Create a new VM in the database
   * @param {Object} vmData - VM data
   * @returns {Promise<Object>} - Created VM
   */
  async createVM(vmData) {
    const {
      name,
      state = "stopped",
      uuid,
      os_type,
      disk_path,
      memory,
      vcpus,
      storage,
      user_id,
      description,
      ip_address,
      vm_type_id,
      libvirt_name,
    } = vmData;

    try {
      const result = await query(
        `INSERT INTO vms 
        (id, name, libvirt_name, state, uuid, os_type, disk_path, memory, vcpus, storage, user_id, description, ip_address, vm_type_id) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
        [
          uuidv4(),
          name,
          libvirt_name,
          state,
          uuid,
          os_type,
          disk_path,
          memory,
          vcpus,
          storage,
          user_id,
          description,
          ip_address,
          vm_type_id,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating VM in database:", error);
      throw new Error(`Failed to create VM in database: ${error.message}`);
    }
  }

  /**
   * Get all VMs from database
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - List of VMs
   */

  async getAllVMs(filters = {}) {
    try {
      let queryText = `
      SELECT 
        vms.*, 
        users.name AS user_name, 
        users.email AS user_email, 
        users.role AS user_role 
      FROM vms 
      LEFT JOIN users ON vms.user_id = users.id
    `;

      const queryParams = [];
      const filterConditions = [];

      if (filters.state) {
        filterConditions.push(`vms.state = $${queryParams.length + 1}`);
        queryParams.push(filters.state);
      }

      if (filters.user_id) {
        filterConditions.push(`vms.user_id = $${queryParams.length + 1}`);
        queryParams.push(filters.user_id);
      }

      if (filterConditions.length > 0) {
        queryText += " WHERE " + filterConditions.join(" AND ");
      }

      queryText += " ORDER BY vms.created_at DESC";

      const result = await query(queryText, queryParams);
      return result.rows;
    } catch (error) {
      console.error("Error getting VMs from database:", error);
      throw new Error(`Failed to get VMs from database: ${error.message}`);
    }
  }

  /**
   * Get VM by libvirt name
   * @param {string} libvirtName - Libvirt name of the VM
   * @returns {Promise<Object>} - VM details
   */
  async getVMByName(libvirtName) {
    try {
      const result = await query("SELECT * FROM vms WHERE libvirt_name = $1", [
        libvirtName,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting VM ${libvirtName} from database:`, error);
      throw new Error(
        `Failed to get VM ${libvirtName} from database: ${error.message}`
      );
    }
  }

  /**
   * Update VM state in database
   * @param {string} libvirtName - Libvirt name of the VM
   * @param {string} state - New state
   * @returns {Promise<Object>} - Updated VM
   */
  async updateVMState(libvirtName, state) {
    try {
      const result = await query(
        "UPDATE vms SET state = $1, updated_at = NOW() WHERE libvirt_name = $2 RETURNING *",
        [state, libvirtName]
      );
      return result.rows[0];
    } catch (error) {
      console.error(
        `Error updating VM ${libvirtName} state in database:`,
        error
      );
      throw new Error(
        `Failed to update VM ${libvirtName} state in database: ${error.message}`
      );
    }
  }

  /**
   * Delete VM from database
   * @param {string} libvirtName - Libvirt name of the VM
   * @returns {Promise<Boolean>} - Success
   */
  async deleteVM(libvirtName) {
    try {
      const result = await query(
        "DELETE FROM vms WHERE libvirt_name = $1 RETURNING *",
        [libvirtName]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting VM ${libvirtName} from database:`, error);
      throw new Error(
        `Failed to delete VM ${libvirtName} from database: ${error.message}`
      );
    }
  }

  /**
   * Update VM details in database
   * @param {string} libvirtName - Libvirt name of the VM
   * @param {Object} vmData - VM data to update
   * @returns {Promise<Object>} - Updated VM
   */
  async updateVM(libvirtName, vmData) {
    try {
      const fieldsToUpdate = Object.keys(vmData).filter(
        (key) => key !== "id" && key !== "name" && key !== "created_at"
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields to update");
      }

      const setClause = fieldsToUpdate
        .map((field, i) => `${field} = $${i + 2}`)
        .join(", ");
      const values = fieldsToUpdate.map((field) => vmData[field]);

      const query_text = `
        UPDATE vms 
        SET ${setClause}, updated_at = NOW()
        WHERE libvirt_name = $1
        RETURNING *
      `;

      const result = await query(query_text, [libvirtName, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating VM ${libvirtName} in database:`, error);
      throw new Error(
        `Failed to update VM ${libvirtName} in database: ${error.message}`
      );
    }
  }
}

module.exports = new VMDbService();
