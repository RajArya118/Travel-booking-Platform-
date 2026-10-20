const prisma = require('../utils/prisma');
const { generateBookingReference } = require('../utils/referenceGenerator');

/**
 * Helper to compute price breakdown securely on server
 */
const calculatePricing = ({ unitPrice, nightsOrDays, travelerCount }) => {
  const count = Math.max(1, parseInt(travelerCount, 10) || 1);
  const multiplier = Math.max(1, parseInt(nightsOrDays, 10) || 1);
  const subtotal = unitPrice * multiplier * count;
  const taxAmount = Math.round(subtotal * 0.10 * 100) / 100; // 10% tax
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% platform fee
  const totalAmount = Math.round((subtotal + taxAmount + serviceFee) * 100) / 100;

  return {
    unitPriceSnapshot: unitPrice,
    subtotal,
    taxAmount,
    serviceFee,
    totalAmount,
  };
};

/**
 * Preview / Calculate Booking Price without creating record
 */
const calculateBookingPrice = async (req, res, next) => {
  try {
    const { bookingType, hotelId, roomTypeId, packageId, checkInDate, checkOutDate, travelerCount } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel dates provided.',
      });
    }

    const diffDays = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    let unitPrice = 0;
    let title = '';

    if (bookingType === 'HOTEL') {
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: { roomTypes: true },
      });

      if (!hotel) {
        return res.status(404).json({ success: false, message: 'Hotel not found.' });
      }

      if (roomTypeId) {
        const room = hotel.roomTypes.find((r) => r.id === roomTypeId);
        if (!room) {
          return res.status(404).json({ success: false, message: 'Selected room type not found.' });
        }
        unitPrice = parseFloat(room.pricePerNight);
        title = `${hotel.name} - ${room.name}`;
      } else {
        unitPrice = parseFloat(hotel.pricePerNight);
        title = hotel.name;
      }

      const pricing = calculatePricing({
        unitPrice,
        nightsOrDays: diffDays,
        travelerCount: 1, // room booked per night
      });

      return res.json({
        success: true,
        data: {
          ...pricing,
          durationDays: diffDays,
          itemTitle: title,
        },
      });
    } else if (bookingType === 'PACKAGE') {
      const pkg = await prisma.travelPackage.findUnique({
        where: { id: packageId },
      });

      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Travel package not found.' });
      }

      unitPrice = parseFloat(pkg.pricePerPerson);
      title = pkg.title;

      const pricing = calculatePricing({
        unitPrice,
        nightsOrDays: 1, // Package price is already for entire duration per person
        travelerCount: parseInt(travelerCount, 10) || 1,
      });

      return res.json({
        success: true,
        data: {
          ...pricing,
          durationDays: pkg.durationDays,
          itemTitle: title,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bookingType.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new booking with server-side pricing validation and capacity checks
 */
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      bookingType,
      hotelId,
      roomTypeId,
      packageId,
      checkInDate,
      checkOutDate,
      travelerCount = 1,
      guestsDetails = [],
      specialRequests,
      paymentMethod = 'Demo Credit Card',
    } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Invalid travel dates provided.',
      });
    }

    const diffDays = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const travelers = Math.max(1, parseInt(travelerCount, 10) || 1);

    let unitPrice = 0;
    let calculatedPricing;
    let targetHotelId = null;
    let targetRoomTypeId = null;
    let targetPackageId = null;

    if (bookingType === 'HOTEL') {
      if (!hotelId) {
        return res.status(400).json({ success: false, message: 'hotelId is required.' });
      }

      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: { roomTypes: true },
      });

      if (!hotel) {
        return res.status(404).json({ success: false, message: 'Hotel not found.' });
      }

      targetHotelId = hotel.id;

      if (roomTypeId) {
        const room = hotel.roomTypes.find((r) => r.id === roomTypeId);
        if (!room) {
          return res.status(404).json({ success: false, message: 'Selected room type not found.' });
        }
        if (travelers > room.capacity) {
          return res.status(400).json({
            success: false,
            message: `Selected room has a maximum capacity of ${room.capacity} guests.`,
          });
        }
        unitPrice = parseFloat(room.pricePerNight);
        targetRoomTypeId = room.id;
      } else {
        unitPrice = parseFloat(hotel.pricePerNight);
      }

      // Calculate server pricing
      calculatedPricing = calculatePricing({
        unitPrice,
        nightsOrDays: diffDays,
        travelerCount: 1, // hotel room booked per night
      });
    } else if (bookingType === 'PACKAGE') {
      if (!packageId) {
        return res.status(400).json({ success: false, message: 'packageId is required.' });
      }

      const pkg = await prisma.travelPackage.findUnique({
        where: { id: packageId },
      });

      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Travel package not found.' });
      }

      // Check remaining capacity
      const remainingCapacity = pkg.maxCapacity - pkg.bookedCount;
      if (travelers > remainingCapacity) {
        return res.status(400).json({
          success: false,
          message: `Only ${remainingCapacity} spots remaining on this package.`,
        });
      }

      targetPackageId = pkg.id;
      unitPrice = parseFloat(pkg.pricePerPerson);

      calculatedPricing = calculatePricing({
        unitPrice,
        nightsOrDays: 1,
        travelerCount: travelers,
      });

      // Increment package bookedCount
      await prisma.travelPackage.update({
        where: { id: pkg.id },
        data: { bookedCount: { increment: travelers } },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bookingType.' });
    }

    const bookingReference = generateBookingReference();

    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        userId,
        bookingType,
        hotelId: targetHotelId,
        roomTypeId: targetRoomTypeId,
        packageId: targetPackageId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        travelerCount: travelers,
        guestsDetails: Array.isArray(guestsDetails) ? guestsDetails : [],
        specialRequests: specialRequests ? specialRequests.trim() : null,
        unitPriceSnapshot: calculatedPricing.unitPriceSnapshot,
        subtotal: calculatedPricing.subtotal,
        taxAmount: calculatedPricing.taxAmount,
        serviceFee: calculatedPricing.serviceFee,
        totalAmount: calculatedPricing.totalAmount,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'Demo Credit Card',
        paymentReference: `DEMO-PAY-${Date.now()}`,
      },
      include: {
        hotel: {
          select: { id: true, name: true, city: true, country: true, imageUrl: true },
        },
        roomType: {
          select: { id: true, name: true, bedType: true },
        },
        travelPackage: {
          select: { id: true, title: true, durationDays: true, imageUrl: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking successfully confirmed! A confirmation email and receipt have been generated.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged in user's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { userId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: {
          select: { id: true, name: true, city: true, country: true, imageUrl: true },
        },
        roomType: {
          select: { id: true, name: true, bedType: true },
        },
        travelPackage: {
          select: { id: true, title: true, durationDays: true, imageUrl: true, category: true },
        },
      },
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single booking by ID (Ensures ownership or admin authorization)
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        hotel: {
          include: { destination: true },
        },
        roomType: true,
        travelPackage: {
          include: { destination: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Access control: User can only view their own booking unless they are an ADMIN
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have permission to view this booking.',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an eligible booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Only owner or admin can cancel
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot cancel this booking.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Past completed trips cannot be cancelled.',
      });
    }

    // Restore package capacity if applicable
    if (booking.bookingType === 'PACKAGE' && booking.packageId) {
      await prisma.travelPackage.update({
        where: { id: booking.packageId },
        data: { bookedCount: { decrement: booking.travelerCount } },
      }).catch(() => {}); // continue if package was deleted
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
      },
    });

    res.json({
      success: true,
      message: 'Booking has been cancelled. Demo refund has been processed.',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all bookings across the platform with search & status filter
 */
const getAllAdminBookings = async (req, res, next) => {
  try {
    const { search, status, bookingType, page = 1, limit = 15 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(50, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (search && search.trim()) {
      where.OR = [
        { bookingReference: { contains: search.trim(), mode: 'insensitive' } },
        { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
        { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (bookingType && bookingType !== 'ALL') {
      where.bookingType = bookingType;
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          hotel: {
            select: { id: true, name: true, city: true },
          },
          travelPackage: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
        hasMore: pageNum * take < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status provided.',
      });
    }

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateBookingPrice,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllAdminBookings,
  updateBookingStatus,
};
