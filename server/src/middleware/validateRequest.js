/**
 * Lightweight and robust input validation helpers
 */
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  next();
};

const validateBooking = (req, res, next) => {
  const { bookingType, checkInDate, checkOutDate, travelerCount } = req.body;
  const errors = [];

  if (!['HOTEL', 'PACKAGE'].includes(bookingType)) {
    errors.push({ field: 'bookingType', message: 'bookingType must be either HOTEL or PACKAGE.' });
  }

  if (bookingType === 'HOTEL' && !req.body.hotelId) {
    errors.push({ field: 'hotelId', message: 'hotelId is required for hotel bookings.' });
  }

  if (bookingType === 'PACKAGE' && !req.body.packageId) {
    errors.push({ field: 'packageId', message: 'packageId is required for package bookings.' });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime())) {
    errors.push({ field: 'checkInDate', message: 'Valid checkInDate is required.' });
  }

  if (isNaN(checkOut.getTime())) {
    errors.push({ field: 'checkOutDate', message: 'Valid checkOutDate is required.' });
  }

  if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut <= checkIn) {
    errors.push({ field: 'checkOutDate', message: 'checkOutDate must be after checkInDate.' });
  }

  const count = parseInt(travelerCount, 10);
  if (isNaN(count) || count < 1) {
    errors.push({ field: 'travelerCount', message: 'travelerCount must be at least 1.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Booking validation failed.',
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateBooking,
};
