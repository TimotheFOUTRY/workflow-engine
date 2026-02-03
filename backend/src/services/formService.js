const winston = require('winston');
const { Form } = require('../models');
const Joi = require('joi');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class FormService {
  /**
   * Create a new form
   */
  async createForm(formData) {
    try {
      const form = await Form.create(formData);
      logger.info(`Form ${form.id} created: ${form.name}`);
      return form;
    } catch (error) {
      logger.error('Error creating form:', error);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getForm(formId) {
    try {
      const form = await Form.findByPk(formId);
      return form;
    } catch (error) {
      logger.error('Error getting form:', error);
      throw error;
    }
  }

  /**
   * Get all forms
   */
  async getAllForms(filters = {}) {
    try {
      const where = {};
      
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const forms = await Form.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      return forms;
    } catch (error) {
      logger.error('Error getting forms:', error);
      throw error;
    }
  }

  /**
   * Update form
   */
  async updateForm(formId, updates) {
    try {
      const form = await Form.findByPk(formId);
      
      if (!form) {
        throw new Error(`Form ${formId} not found`);
      }

      await form.update(updates);
      logger.info(`Form ${formId} updated`);
      return form;
    } catch (error) {
      logger.error('Error updating form:', error);
      throw error;
    }
  }

  /**
   * Delete form
   */
  async deleteForm(formId) {
    try {
      const form = await Form.findByPk(formId);
      
      if (!form) {
        throw new Error(`Form ${formId} not found`);
      }

      await form.destroy();
      logger.info(`Form ${formId} deleted`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting form:', error);
      throw error;
    }
  }

  /**
   * Validate form data against schema
   */
  async validateFormData(formId, data) {
    try {
      const form = await this.getForm(formId);
      
      if (!form) {
        throw new Error(`Form ${formId} not found`);
      }

      // Build Joi schema from form schema
      const joiSchema = this.buildJoiSchema(form.schema);
      
      const { error, value } = joiSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return {
          valid: false,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        };
      }

      return {
        valid: true,
        data: value
      };
    } catch (error) {
      logger.error('Error validating form data:', error);
      throw error;
    }
  }

  /**
   * Build Joi schema from JSON schema
   */
  buildJoiSchema(jsonSchema) {
    const schemaObj = {};

    if (jsonSchema.properties) {
      Object.keys(jsonSchema.properties).forEach(key => {
        const prop = jsonSchema.properties[key];
        let field;

        switch (prop.type) {
          case 'string':
            field = Joi.string();
            if (prop.format === 'email') field = Joi.string().email();
            if (prop.minLength) field = field.min(prop.minLength);
            if (prop.maxLength) field = field.max(prop.maxLength);
            if (prop.pattern) field = field.pattern(new RegExp(prop.pattern));
            break;
          case 'number':
          case 'integer':
            field = Joi.number();
            if (prop.minimum !== undefined) field = field.min(prop.minimum);
            if (prop.maximum !== undefined) field = field.max(prop.maximum);
            if (prop.type === 'integer') field = field.integer();
            break;
          case 'boolean':
            field = Joi.boolean();
            break;
          case 'array':
            field = Joi.array();
            if (prop.items) {
              // Simplified array handling
              field = field.items(Joi.any());
            }
            break;
          case 'object':
            field = Joi.object();
            break;
          default:
            field = Joi.any();
        }

        // Handle required fields
        if (jsonSchema.required && jsonSchema.required.includes(key)) {
          field = field.required();
        } else {
          field = field.optional();
        }

        schemaObj[key] = field;
      });
    }

    return Joi.object(schemaObj);
  }

  /**
   * Render form for display
   */
  async renderForm(formId) {
    try {
      const form = await this.getForm(formId);
      
      if (!form) {
        throw new Error(`Form ${formId} not found`);
      }

      return {
        id: form.id,
        name: form.name,
        description: form.description,
        schema: form.schema,
        uiSchema: form.uiSchema
      };
    } catch (error) {
      logger.error('Error rendering form:', error);
      throw error;
    }
  }
}

module.exports = new FormService();
