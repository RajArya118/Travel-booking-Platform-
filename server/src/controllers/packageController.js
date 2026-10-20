const prisma = require('../utils/prisma');

/**
 * Get all travel packages with search, filters, and pagination
 */
const getAllPackages = async (req, res, next) => {
  try {
    const {
      search,
      destinationId,
      category,
      minDays,
      maxDays,
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
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { category: { contains: search.trim(), mode: 'insensitive' } },
        { destination: { name: { contains: search.trim(), mode: 'insensitive' } } },
        { destination: { country: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    if (destinationId) {
      where.destinationId = destinationId;
    }

    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (minDays || maxDays) {
      where.durationDays = {};
      if (minDays) where.durationDays.gte = parseInt(minDays, 10);
      if (maxDays) where.durationDays.lte = parseInt(maxDays, 10);
    }

    if (minPrice || maxPrice) {
      where.pricePerPerson = {};
      if (minPrice) where.pricePerPerson.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerPerson.lte = parseFloat(maxPrice);
    }

    let orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sortBy === 'priceAsc') orderBy = [{ pricePerPerson: 'asc' }];
    if (sortBy === 'priceDesc') orderBy = [{ pricePerPerson: 'desc' }];
    if (sortBy === 'durationAsc') orderBy = [{ durationDays: 'asc' }];
    if (sortBy === 'durationDesc') orderBy = [{ durationDays: 'desc' }];
    if (sortBy === 'newest') orderBy = [{ createdAt: 'desc' }];

    const [total, packages] = await Promise.all([
      prisma.travelPackage.count({ where }),
      prisma.travelPackage.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          destination: {
            select: { id: true, name: true, country: true, imageUrl: true },
          },
        },
      }),
    ]);

    // Attach remaining capacity helper
    const enrichedPackages = packages.map((pkg) => ({
      ...pkg,
      remainingCapacity: Math.max(0, pkg.maxCapacity - pkg.bookedCount),
    }));

    res.json({
      success: true,
      data: enrichedPackages,
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
 * Get single travel package by ID
 */
const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.travelPackage.findUnique({
      where: { id },
      include: {
        destination: true,
      },
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Travel package not found.',
      });
    }

    const remainingCapacity = Math.max(0, pkg.maxCapacity - pkg.bookedCount);

    res.json({
      success: true,
      data: {
        ...pkg,
        remainingCapacity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create package (Admin only)
 */
const createPackage = async (req, res, next) => {
  try {
    const {
      title,
      destinationId,
      durationDays,
      durationNights,
      pricePerPerson,
      maxCapacity = 20,
      category = 'Adventure',
      season,
      isFeatured = false,
      imageUrl,
      galleryUrls = [],
      itinerary = [],
      includedServices = [],
      excludedServices = [],
    } = req.body;

    if (!title || !destinationId || !durationDays || !pricePerPerson || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, destinationId, durationDays, pricePerPerson, and imageUrl.',
      });
    }

    const pkg = await prisma.travelPackage.create({
      data: {
        title: title.trim(),
        destinationId,
        durationDays: parseInt(durationDays, 10),
        durationNights: parseInt(durationNights || durationDays - 1, 10),
        pricePerPerson: parseFloat(pricePerPerson),
        maxCapacity: parseInt(maxCapacity, 10) || 20,
        bookedCount: 0,
        category: category.trim(),
        season: season ? season.trim() : null,
        isFeatured: Boolean(isFeatured),
        imageUrl: imageUrl.trim(),
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        itinerary: Array.isArray(itinerary) ? itinerary : [],
        includedServices: Array.isArray(includedServices) ? includedServices : [],
        excludedServices: Array.isArray(excludedServices) ? excludedServices : [],
      },
      include: {
        destination: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Travel package created successfully.',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update package (Admin only)
 */
const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.travelPackage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Travel package not found.',
      });
    }

    const updated = await prisma.travelPackage.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.destinationId && { destinationId: data.destinationId }),
        ...(data.durationDays !== undefined && { durationDays: parseInt(data.durationDays, 10) }),
        ...(data.durationNights !== undefined && { durationNights: parseInt(data.durationNights, 10) }),
        ...(data.pricePerPerson !== undefined && { pricePerPerson: parseFloat(data.pricePerPerson) }),
        ...(data.maxCapacity !== undefined && { maxCapacity: parseInt(data.maxCapacity, 10) }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.season !== undefined && { season: data.season }),
        ...(data.isFeatured !== undefined && { isFeatured: Boolean(data.isFeatured) }),
        ...(data.imageUrl && { imageUrl: data.imageUrl.trim() }),
        ...(data.galleryUrls && { galleryUrls: Array.isArray(data.galleryUrls) ? data.galleryUrls : [] }),
        ...(data.itinerary && { itinerary: Array.isArray(data.itinerary) ? data.itinerary : [] }),
        ...(data.includedServices && { includedServices: Array.isArray(data.includedServices) ? data.includedServices : [] }),
        ...(data.excludedServices && { excludedServices: Array.isArray(data.excludedServices) ? data.excludedServices : [] }),
      },
      include: {
        destination: true,
      },
    });

    res.json({
      success: true,
      message: 'Travel package updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete package (Admin only)
 */
const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.travelPackage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Travel package not found.',
      });
    }

    await prisma.travelPackage.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Travel package deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};
