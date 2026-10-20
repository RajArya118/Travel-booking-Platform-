const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

let userToken;
let userId;
let adminToken;
let testDestinationId;
let testHotelId;
let testBookingId;
let otherUserToken;

beforeAll(async () => {
  // Ensure database connected
  await prisma.$connect();

  // Create or retrieve test users
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('TestPass@123', salt);

  // Clean test-specific users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['test_user_qa@travelai.com', 'test_admin_qa@travelai.com', 'test_other_qa@travelai.com'],
      },
    },
  });

  const testUser = await prisma.user.create({
    data: {
      name: 'QA Test User',
      email: 'test_user_qa@travelai.com',
      password,
      role: 'USER',
    },
  });
  userId = testUser.id;

  const otherUser = await prisma.user.create({
    data: {
      name: 'Other User QA',
      email: 'test_other_qa@travelai.com',
      password,
      role: 'USER',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'QA Admin User',
      email: 'test_admin_qa@travelai.com',
      password,
      role: 'ADMIN',
    },
  });

  // Logins to obtain tokens
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test_user_qa@travelai.com', password: 'TestPass@123' });
  userToken = userRes.body.token;

  const otherRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test_other_qa@travelai.com', password: 'TestPass@123' });
  otherUserToken = otherRes.body.token;

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test_admin_qa@travelai.com', password: 'TestPass@123' });
  adminToken = adminRes.body.token;

  // Create a test destination
  const dest = await prisma.destination.create({
    data: {
      name: 'Test Paradise Island',
      country: 'Testland',
      continent: 'Oceania',
      description: 'A serene test island for testing purposes.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      priceEstimate: 999.00,
    },
  });
  testDestinationId = dest.id;

  // Create a test hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Paradise Lagoon Resort',
      destinationId: testDestinationId,
      address: '100 Ocean Drive',
      city: 'Paradise Bay',
      country: 'Testland',
      description: 'Test luxury hotel resort.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      starRating: 5,
      pricePerNight: 200.00,
      amenities: ['Free WiFi', 'Pool'],
      roomTypes: {
        create: [
          {
            name: 'Ocean View Room',
            capacity: 2,
            pricePerNight: 200.00,
            bedType: '1 King Bed',
            totalRooms: 5,
            availableRooms: 5,
          },
        ],
      },
    },
  });
  testHotelId = hotel.id;
});

afterAll(async () => {
  // Clean up test data
  if (testDestinationId) {
    await prisma.destination.deleteMany({ where: { id: testDestinationId } });
  }
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['test_user_qa@travelai.com', 'test_admin_qa@travelai.com', 'test_other_qa@travelai.com'],
      },
    },
  });
  await prisma.$disconnect();
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return status 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('TravelAI');
  });
});

describe('2. Authentication & Authorization API', () => {
  it('POST /api/auth/register should create a new regular user with USER role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Registered Traveler',
        email: `new_user_${Date.now()}@example.com`,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('USER');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login with valid credentials returns 200 and JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user_qa@travelai.com',
        password: 'TestPass@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test_user_qa@travelai.com');
  });

  it('POST /api/auth/login with incorrect password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user_qa@travelai.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return current user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe(userId);
  });

  it('GET /api/auth/me should return 401 without authentication token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('3. Public Destinations & Hotel Browsing', () => {
  it('GET /api/destinations should return paginated destinations list', async () => {
    const res = await request(app).get('/api/destinations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/destinations/:id should return destination details', async () => {
    const res = await request(app).get(`/api/destinations/${testDestinationId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Paradise Island');
  });

  it('GET /api/hotels should return list of hotels with destination information', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('4. Role-Based Access Control (RBAC)', () => {
  it('POST /api/admin/destinations should block non-admin users with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/admin/destinations')
      .set('Authorization', `Bearer ${userToken}`) // Regular user token
      .send({
        name: 'Unauthorized Island',
        country: 'Hackerland',
        description: 'Should fail',
        imageUrl: 'https://example.com/island.jpg',
        priceEstimate: 500,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Administrator privileges are required');
  });

  it('POST /api/admin/destinations should succeed for verified ADMIN users', async () => {
    const res = await request(app)
      .post('/api/admin/destinations')
      .set('Authorization', `Bearer ${adminToken}`) // Admin token
      .send({
        name: 'Admin Approved Paradise',
        country: 'Validland',
        description: 'Created by an authorized administrator.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        priceEstimate: 850.00,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Admin Approved Paradise');

    // Clean up created destination
    await prisma.destination.delete({ where: { id: res.body.data.id } });
  });
});

describe('5. Booking Workflows & Server Pricing Validation', () => {
  it('POST /api/bookings/calculate accurately calculates subtotal, tax (10%), and fee (5%) on server', async () => {
    const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const checkOut = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(); // 3 nights

    const res = await request(app)
      .post('/api/bookings/calculate')
      .send({
        bookingType: 'HOTEL',
        hotelId: testHotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        travelerCount: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // 3 nights * $200 = $600 subtotal
    expect(res.body.data.subtotal).toBe(600);
    // 10% tax = $60
    expect(res.body.data.taxAmount).toBe(60);
    // 5% fee = $30
    expect(res.body.data.serviceFee).toBe(30);
    // Total = $690
    expect(res.body.data.totalAmount).toBe(690);
  });

  it('POST /api/bookings creates a verified booking with unique reference and price snapshot', async () => {
    const checkIn = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const checkOut = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        bookingType: 'HOTEL',
        hotelId: testHotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        travelerCount: 2,
        specialRequests: 'Quiet room please',
      });

    testBookingId = res.body.data.id;
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingReference).toMatch(/^TRV-\d{4}-[A-Z0-9]+$/);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(parseFloat(res.body.data.totalAmount)).toBe(690);
  });

  it('GET /api/bookings/:id prevents unauthorized users from accessing another user’s booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${otherUserToken}`); // different user

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/bookings/:id allows the owner to view their own booking', async () => {
    const res = await request(app)
      .get(`/api/bookings/${testBookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testBookingId);
  });

  it('PATCH /api/bookings/:id/cancel allows owner to cancel booking and process refund', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${testBookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.paymentStatus).toBe('REFUNDED');
  });

  // 6. AI Travel Itinerary Engine
  describe('6. AI Travel Itinerary Planner', () => {
    it('POST /api/ai/generate-itinerary rejects requests without destination', async () => {
      const res = await request(app)
        .post('/api/ai/generate-itinerary')
        .send({ durationDays: 3 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/ai/generate-itinerary generates a complete day-by-day structured itinerary', async () => {
      const res = await request(app)
        .post('/api/ai/generate-itinerary')
        .send({
          destination: 'Santorini, Greece',
          durationDays: 3,
          budget: 'Luxury',
          travelers: 'Couple',
          interests: ['Beaches & Relaxation', 'Fine Dining'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.tripTitle).toContain('Santorini');
      expect(res.body.data.days).toHaveLength(3);
      expect(res.body.data.estimatedBudgetBreakdown).toBeDefined();
      expect(res.body.data.packingChecklist).toBeInstanceOf(Array);
      expect(res.body.data.localCuisineToTry).toBeInstanceOf(Array);
    });
  });
});
