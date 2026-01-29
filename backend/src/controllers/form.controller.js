const winston = require('winston');
const formService = require('../services/formService');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class FormController {
  /**
   * Create form
   */
  async createForm(req, res) {
    try {
      const formData = req.body;
      const form = await formService.createForm(formData);

      res.status(201).json({
        success: true,
        data: form
      });
    } catch (error) {
      logger.error('Error creating form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all forms
   */
  async getAllForms(req, res) {
    try {
      const { isActive } = req.query;
      const forms = await formService.getAllForms({
        isActive: isActive === 'true'
      });

      res.json({
        success: true,
        data: forms
      });
    } catch (error) {
      logger.error('Error getting forms:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get form by ID
   */
  async getForm(req, res) {
    try {
      const { id } = req.params;
      const form = await formService.getForm(id);

      if (!form) {
        return res.status(404).json({
          success: false,
          error: 'Form not found'
        });
      }

      res.json({
        success: true,
        data: form
      });
    } catch (error) {
      logger.error('Error getting form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update form
   */
  async updateForm(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const form = await formService.updateForm(id, updates);

      res.json({
        success: true,
        data: form
      });
    } catch (error) {
      logger.error('Error updating form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete form
   */
  async deleteForm(req, res) {
    try {
      const { id } = req.params;
      await formService.deleteForm(id);

      res.json({
        success: true,
        message: 'Form deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validate form data
   */
  async validateFormData(req, res) {
    try {
      const { id } = req.params;
      const { data } = req.body;
      
      const result = await formService.validateFormData(id, data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error validating form data:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Render form
   */
  async renderForm(req, res) {
    try {
      const { id } = req.params;
      const form = await formService.renderForm(id);

      res.json({
        success: true,
        data: form
      });
    } catch (error) {
      logger.error('Error rendering form:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new FormController();
