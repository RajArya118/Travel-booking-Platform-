const express = require('express');
const router = express.Router();
const {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  addRoomType,
  deleteRoomType,
} = require('../controllers/hotelController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Admin endpoints
router.post('/', authenticate, authorizeAdmin, createHotel);
router.patch('/:id', authenticate, authorizeAdmin, updateHotel);
router.delete('/:id', authenticate, authorizeAdmin, deleteHotel);
router.post('/:hotelId/rooms', authenticate, authorizeAdmin, addRoomType);
router.delete('/rooms/:id', authenticate, authorizeAdmin, deleteRoomType);

module.exports = router;
