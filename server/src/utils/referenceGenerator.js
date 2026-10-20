const crypto = require('crypto');

/**
 * Generates a human-friendly unique booking reference e.g., TRV-2026-9A3F2C
 */
const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
  return `TRV-${year}-${randomChars}`;
};

module.exports = {
  generateBookingReference,
};
