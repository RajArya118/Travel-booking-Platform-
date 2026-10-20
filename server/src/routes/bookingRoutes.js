const express = require('express');
const router = express.Router();
const {
  calculateBookingPrice,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllAdminBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { validateBooking } = require('../middleware/validateRequest');

// Price preview calculation (can be previewed prior to auth or while authed)
router.post('/calculate', calculateBookingPrice);

// User booking endpoints (Protected)
router.post('/', authenticate, validateBooking, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBooking);

// Admin booking endpoints (Protected)
router.get('/admin/all', authenticate, authorizeAdmin, getAllAdminBookings);
router.patch('/admin/:id/status', authenticate, authorizeAdmin, updateBookingStatus);

module.exports = router;
