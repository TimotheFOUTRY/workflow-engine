const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All form routes require authentication
router.use(authenticate);

// Form operations
router.post('/', formController.createForm.bind(formController));
router.get('/', formController.getAllForms.bind(formController));
router.get('/:id', formController.getForm.bind(formController));
router.put('/:id', formController.updateForm.bind(formController));
router.delete('/:id', formController.deleteForm.bind(formController));
router.post('/:id/validate', formController.validateFormData.bind(formController));
router.get('/:id/render', formController.renderForm.bind(formController));

module.exports = router;
