const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getAllPackages);
router.get('/:id', getPackageById);

// Admin endpoints
router.post('/', authenticate, authorizeAdmin, createPackage);
router.patch('/:id', authenticate, authorizeAdmin, updatePackage);
router.delete('/:id', authenticate, authorizeAdmin, deletePackage);

module.exports = router;
