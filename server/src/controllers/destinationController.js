const prisma = require('../utils/prisma');

/**
 * Get all destinations with search, filter, and pagination
 */
const getAllDestinations = async (req, res, next) => {
  try {
    const {
      search,
      continent,
      featured,
      minPrice,
      maxPrice,
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
        { country: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (continent && continent !== 'All') {
      where.continent = { equals: continent, mode: 'insensitive' };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      where.priceEstimate = {};
      if (minPrice) where.priceEstimate.gte = parseFloat(minPrice);
      if (maxPrice) where.priceEstimate.lte = parseFloat(maxPrice);
    }

    let orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sortBy === 'priceAsc') orderBy = [{ priceEstimate: 'asc' }];
    if (sortBy === 'priceDesc') orderBy = [{ priceEstimate: 'desc' }];
    if (sortBy === 'nameAsc') orderBy = [{ name: 'asc' }];
    if (sortBy === 'newest') orderBy = [{ createdAt: 'desc' }];

    const [total, destinations] = await Promise.all([
      prisma.destination.count({ where }),
      prisma.destination.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: { hotels: true, packages: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: destinations,
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
 * Get single destination by ID with related packages and hotels
 */
const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        hotels: {
          take: 4,
          include: {
            roomTypes: {
              take: 1,
              orderBy: { pricePerNight: 'asc' },
            },
          },
        },
        packages: {
          take: 4,
          orderBy: { pricePerPerson: 'asc' },
        },
      },
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      });
    }

    res.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create destination (Admin only)
 */
const createDestination = async (req, res, next) => {
  try {
    const {
      name,
      country,
      continent,
      description,
      imageUrl,
      galleryUrls,
      bestTimeToVisit,
      currency,
      language,
      priceEstimate,
      isFeatured = false,
    } = req.body;

    if (!name || !country || !description || !imageUrl || priceEstimate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, country, description, imageUrl, and priceEstimate.',
      });
    }

    const destination = await prisma.destination.create({
      data: {
        name: name.trim(),
        country: country.trim(),
        continent: continent ? continent.trim() : null,
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        bestTimeToVisit: bestTimeToVisit ? bestTimeToVisit.trim() : null,
        currency: currency ? currency.trim() : 'USD',
        language: language ? language.trim() : 'English',
        priceEstimate: parseFloat(priceEstimate),
        isFeatured: Boolean(isFeatured),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Destination created successfully.',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update destination (Admin only)
 */
const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      });
    }

    const updated = await prisma.destination.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.country && { country: data.country.trim() }),
        ...(data.continent !== undefined && { continent: data.continent ? data.continent.trim() : null }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.imageUrl && { imageUrl: data.imageUrl.trim() }),
        ...(data.galleryUrls && { galleryUrls: Array.isArray(data.galleryUrls) ? data.galleryUrls : [] }),
        ...(data.bestTimeToVisit !== undefined && { bestTimeToVisit: data.bestTimeToVisit }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.priceEstimate !== undefined && { priceEstimate: parseFloat(data.priceEstimate) }),
        ...(data.isFeatured !== undefined && { isFeatured: Boolean(data.isFeatured) }),
      },
    });

    res.json({
      success: true,
      message: 'Destination updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete destination (Admin only)
 */
const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      });
    }

    await prisma.destination.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Destination deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};
