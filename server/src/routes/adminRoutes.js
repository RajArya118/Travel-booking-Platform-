const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminUsers } = require('../controllers/statsController');
const {
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const {
  createHotel,
  updateHotel,
  deleteHotel,
  addRoomType,
  deleteRoomType,
} = require('../controllers/hotelController');
const {
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const {
  getAllAdminBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorizeAdmin);

// Dashboard overview & user stats
router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);

// Destination CRUD
router.post('/destinations', createDestination);
router.patch('/destinations/:id', updateDestination);
router.delete('/destinations/:id', deleteDestination);

// Hotel CRUD
router.post('/hotels', createHotel);
router.patch('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);
router.post('/hotels/:hotelId/rooms', addRoomType);
router.delete('/hotels/rooms/:id', deleteRoomType);

// Package CRUD
router.post('/packages', createPackage);
router.patch('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

// Bookings management
router.get('/bookings', getAllAdminBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

module.exports = router;
