
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
    const { name, state = 'stopped', uuid, os_type, memory, vcpus, storage, user_id, description, ip_address } = vmData;
    
    try {
      const result = await query(
        `INSERT INTO vms 
          (id, name, state, uuid, os_type, memory, vcpus, storage, user_id, description, ip_address) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          uuidv4(), 
          name, 
          state, 
          uuid, 
          os_type, 
          memory, 
          vcpus, 
          storage, 
          user_id, 
          description, 
          ip_address
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating VM in database:', error);
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
      let queryText = 'SELECT * FROM vms';
      const queryParams = [];
      
      // Add filters if provided
      const filterConditions = [];
      
      if (filters.state) {
        filterConditions.push(`state = $${queryParams.length + 1}`);
        queryParams.push(filters.state);
      }
      
      if (filters.user_id) {
        filterConditions.push(`user_id = $${queryParams.length + 1}`);
        queryParams.push(filters.user_id);
      }
      
      if (filterConditions.length > 0) {
        queryText += ' WHERE ' + filterConditions.join(' AND ');
      }
      
      queryText += ' ORDER BY created_at DESC';
      
      const result = await query(queryText, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error getting VMs from database:', error);
      throw new Error(`Failed to get VMs from database: ${error.message}`);
    }
  }

  /**
   * Get VM by name
   * @param {string} vmName - Name of the VM
   * @returns {Promise<Object>} - VM details
   */
  async getVMByName(vmName) {
    try {
      const result = await query('SELECT * FROM vms WHERE name = $1', [vmName]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting VM ${vmName} from database:`, error);
      throw new Error(`Failed to get VM ${vmName} from database: ${error.message}`);
    }
  }

  /**
   * Update VM state in database
   * @param {string} vmName - Name of the VM
   * @param {string} state - New state
   * @returns {Promise<Object>} - Updated VM
   */
  async updateVMState(vmName, state) {
    try {
      const result = await query(
        'UPDATE vms SET state = $1, updated_at = NOW() WHERE name = $2 RETURNING *',
        [state, vmName]
      );
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating VM ${vmName} state in database:`, error);
      throw new Error(`Failed to update VM ${vmName} state in database: ${error.message}`);
    }
  }

  /**
   * Delete VM from database
   * @param {string} vmName - Name of the VM
   * @returns {Promise<Boolean>} - Success
   */
  async deleteVM(vmName) {
    try {
      const result = await query('DELETE FROM vms WHERE name = $1 RETURNING *', [vmName]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting VM ${vmName} from database:`, error);
      throw new Error(`Failed to delete VM ${vmName} from database: ${error.message}`);
    }
  }

  /**
   * Update VM details in database
   * @param {string} vmName - Name of the VM
   * @param {Object} vmData - VM data to update
   * @returns {Promise<Object>} - Updated VM
   */
  async updateVM(vmName, vmData) {
    try {
      const fieldsToUpdate = Object.keys(vmData).filter(key => 
        key !== 'id' && key !== 'name' && key !== 'created_at'
      );
      
      if (fieldsToUpdate.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      const setClause = fieldsToUpdate.map((field, i) => `${field} = $${i + 2}`).join(', ');
      const values = fieldsToUpdate.map(field => vmData[field]);
      
      const query_text = `
        UPDATE vms 
        SET ${setClause}, updated_at = NOW()
        WHERE name = $1
        RETURNING *
      `;
      
      const result = await query(query_text, [vmName, ...values]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating VM ${vmName} in database:`, error);
      throw new Error(`Failed to update VM ${vmName} in database: ${error.message}`);
    }
  }
}

module.exports = new VMDbService();
