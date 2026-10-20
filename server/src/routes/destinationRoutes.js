const express = require('express');
const router = express.Router();
const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

// Admin endpoints
router.post('/', authenticate, authorizeAdmin, createDestination);
router.patch('/:id', authenticate, authorizeAdmin, updateDestination);
router.delete('/:id', authenticate, authorizeAdmin, deleteDestination);

module.exports = router;
