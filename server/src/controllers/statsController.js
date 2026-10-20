const prisma = require('../utils/prisma');

/**
 * Get aggregated statistics for the Admin Dashboard
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalDestinations,
      totalHotels,
      totalPackages,
      totalBookings,
      totalUsers,
      recentBookings,
      revenueResult,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.destination.count(),
      prisma.hotel.count(),
      prisma.travelPackage.count(),
      prisma.booking.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          hotel: { select: { name: true } },
          travelPackage: { select: { title: true } },
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount ? parseFloat(revenueResult._sum.totalAmount) : 0;

    res.json({
      success: true,
      data: {
        totalDestinations,
        totalHotels,
        totalPackages,
        totalBookings,
        totalUsers,
        totalRevenue,
        recentBookings,
        bookingsByStatus: bookingsByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all registered users
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        totalBookings: u._count.bookings,
      })),
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
};
