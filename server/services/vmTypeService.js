
const { query } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

/**
 * VM Type Database Service for handling VM Type operations
 */
class VMTypeService {
  /**
   * Get all VM types
   * @returns {Promise<Array>} - List of VM types
   */
  async getAllVMTypes() {
    try {
      const result = await query('SELECT * FROM vm_types ORDER BY name ASC', []);
      return result.rows;
    } catch (error) {
      console.error('Error getting VM types from database:', error);
      throw new Error(`Failed to get VM types: ${error.message}`);
    }
  }

  /**
   * Get VM type by ID
   * @param {string} id - ID of the VM type
   * @returns {Promise<Object>} - VM type details
   */
  async getVMTypeById(id) {
    try {
      const result = await query('SELECT * FROM vm_types WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting VM type ${id} from database:`, error);
      throw new Error(`Failed to get VM type: ${error.message}`);
    }
  }

  /**
   * Create a new VM type
   * @param {Object} vmTypeData - VM type data
   * @returns {Promise<Object>} - Created VM type
   */
  async createVMType(vmTypeData) {
    const { name, os_type, iso_path, description } = vmTypeData;
    
    try {
      const result = await query(
        `INSERT INTO vm_types 
          (id, name, os_type, iso_path, description) 
         VALUES 
          ($1, $2, $3, $4, $5)
         RETURNING *`,
        [uuidv4(), name, os_type, iso_path, description]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating VM type in database:', error);
      throw new Error(`Failed to create VM type: ${error.message}`);
    }
  }

  /**
   * Update a VM type
   * @param {string} id - ID of the VM type to update
   * @param {Object} vmTypeData - VM type data to update
   * @returns {Promise<Object>} - Updated VM type
   */
  async updateVMType(id, vmTypeData) {
    const { name, os_type, iso_path, description } = vmTypeData;
    
    try {
      const result = await query(
        `UPDATE vm_types 
         SET name = $1, 
             os_type = $2, 
             iso_path = $3, 
             description = $4,
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [name, os_type, iso_path, description, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`VM type with ID ${id} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating VM type ${id} in database:`, error);
      throw new Error(`Failed to update VM type: ${error.message}`);
    }
  }

  /**
   * Delete a VM type
   * @param {string} id - ID of the VM type to delete
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async deleteVMType(id) {
    try {
      // Check if the VM type is in use
      const usedInVMs = await query(
        'SELECT COUNT(*) FROM vms WHERE vm_type_id = $1',
        [id]
      );
      
      const usedInRequests = await query(
        'SELECT COUNT(*) FROM vm_requests WHERE vm_type_id = $1',
        [id]
      );
      
      if (parseInt(usedInVMs.rows[0].count) > 0 || parseInt(usedInRequests.rows[0].count) > 0) {
        throw new Error('Cannot delete VM type that is in use');
      }
      
      const result = await query('DELETE FROM vm_types WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting VM type ${id} from database:`, error);
      throw new Error(`Failed to delete VM type: ${error.message}`);
    }
  }
}

module.exports = new VMTypeService();
