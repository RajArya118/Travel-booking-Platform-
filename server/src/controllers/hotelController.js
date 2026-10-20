const prisma = require('../utils/prisma');

/**
 * Get all hotels with search, filter, and pagination
 */
const getAllHotels = async (req, res, next) => {
  try {
    const {
      search,
      destinationId,
      city,
      minPrice,
      maxPrice,
      starRating,
      amenity,
      sortBy = 'featured',
      page = 1,
      limit = 9,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { city: { contains: search.trim(), mode: 'insensitive' } },
        { country: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (destinationId) {
      where.destinationId = destinationId;
    }

    if (city && city.trim()) {
      where.city = { contains: city.trim(), mode: 'insensitive' };
    }

    if (starRating) {
      where.starRating = { gte: parseInt(starRating, 10) };
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }

    let orderBy = [{ isFeatured: 'desc' }, { starRating: 'desc' }];
    if (sortBy === 'priceAsc') orderBy = [{ pricePerNight: 'asc' }];
    if (sortBy === 'priceDesc') orderBy = [{ pricePerNight: 'desc' }];
    if (sortBy === 'ratingDesc') orderBy = [{ starRating: 'desc' }];
    if (sortBy === 'nameAsc') orderBy = [{ name: 'asc' }];

    const [total, hotels] = await Promise.all([
      prisma.hotel.count({ where }),
      prisma.hotel.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          destination: {
            select: { id: true, name: true, country: true },
          },
          roomTypes: {
            take: 1,
            orderBy: { pricePerNight: 'asc' },
          },
          _count: {
            select: { roomTypes: true },
          },
        },
      }),
    ]);

    // Optional in-memory filter for amenities if requested
    let filteredHotels = hotels;
    if (amenity && amenity.trim()) {
      filteredHotels = hotels.filter((h) => {
        if (!Array.isArray(h.amenities)) return false;
        return h.amenities.some((a) =>
          a.toLowerCase().includes(amenity.toLowerCase().trim())
        );
      });
    }

    res.json({
      success: true,
      data: filteredHotels,
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
 * Get single hotel by ID with room types and destination
 */
const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        destination: true,
        roomTypes: {
          orderBy: { pricePerNight: 'asc' },
        },
      },
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    res.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create hotel (Admin only)
 */
const createHotel = async (req, res, next) => {
  try {
    const {
      name,
      destinationId,
      address,
      city,
      country,
      description,
      imageUrl,
      galleryUrls,
      starRating = 4,
      pricePerNight,
      amenities = [],
      isFeatured = false,
      roomTypes = [],
    } = req.body;

    if (!name || !destinationId || !address || !city || !description || !imageUrl || pricePerNight === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, destinationId, address, city, description, imageUrl, and pricePerNight.',
      });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        destinationId,
        address: address.trim(),
        city: city.trim(),
        country: country ? country.trim() : city.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        starRating: parseInt(starRating, 10) || 4,
        pricePerNight: parseFloat(pricePerNight),
        amenities: Array.isArray(amenities) ? amenities : [],
        isFeatured: Boolean(isFeatured),
        ...(roomTypes.length > 0 && {
          roomTypes: {
            create: roomTypes.map((rt) => ({
              name: rt.name,
              description: rt.description || null,
              capacity: parseInt(rt.capacity, 10) || 2,
              pricePerNight: parseFloat(rt.pricePerNight || pricePerNight),
              bedType: rt.bedType || '1 King Bed',
              amenities: Array.isArray(rt.amenities) ? rt.amenities : [],
              totalRooms: parseInt(rt.totalRooms, 10) || 10,
              availableRooms: parseInt(rt.availableRooms || rt.totalRooms, 10) || 10,
            })),
          },
        }),
      },
      include: {
        roomTypes: true,
        destination: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully.',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update hotel (Admin only)
 */
const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.destinationId && { destinationId: data.destinationId }),
        ...(data.address && { address: data.address.trim() }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.country && { country: data.country.trim() }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.imageUrl && { imageUrl: data.imageUrl.trim() }),
        ...(data.galleryUrls && { galleryUrls: Array.isArray(data.galleryUrls) ? data.galleryUrls : [] }),
        ...(data.starRating !== undefined && { starRating: parseInt(data.starRating, 10) }),
        ...(data.pricePerNight !== undefined && { pricePerNight: parseFloat(data.pricePerNight) }),
        ...(data.amenities && { amenities: Array.isArray(data.amenities) ? data.amenities : [] }),
        ...(data.isFeatured !== undefined && { isFeatured: Boolean(data.isFeatured) }),
      },
      include: {
        destination: true,
        roomTypes: true,
      },
    });

    res.json({
      success: true,
      message: 'Hotel updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete hotel (Admin only)
 */
const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.',
      });
    }

    await prisma.hotel.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Hotel deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Room Type to Hotel (Admin only)
 */
const addRoomType = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { name, description, capacity = 2, pricePerNight, bedType = '1 King Bed', amenities = [], totalRooms = 10 } = req.body;

    if (!name || pricePerNight === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Room type name and pricePerNight are required.',
      });
    }

    const roomType = await prisma.roomType.create({
      data: {
        hotelId,
        name: name.trim(),
        description: description ? description.trim() : null,
        capacity: parseInt(capacity, 10) || 2,
        pricePerNight: parseFloat(pricePerNight),
        bedType: bedType.trim(),
        amenities: Array.isArray(amenities) ? amenities : [],
        totalRooms: parseInt(totalRooms, 10) || 10,
        availableRooms: parseInt(totalRooms, 10) || 10,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Room type added successfully.',
      data: roomType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Room Type (Admin only)
 */
const deleteRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.roomType.delete({ where: { id } });
    res.json({
      success: true,
      message: 'Room type deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  addRoomType,
  deleteRoomType,
};
