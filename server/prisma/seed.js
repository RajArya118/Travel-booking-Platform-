const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/prisma');
const { generateBookingReference } = require('../src/utils/referenceGenerator');

async function seed() {
  console.log('🌱 Starting TravelAI database seeding (Sample Data Mode)...');

  // Clean existing data in reverse relation order
  await prisma.booking.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.travelPackage.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 1. Seed Users
  const passwordSalt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123456', passwordSalt);
  const demoUserPassword = await bcrypt.hash('Travel@123456', passwordSalt);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Elena Vance (Admin)',
      email: 'admin@travelai.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'demo@travelai.com',
      password: demoUserPassword,
      role: 'USER',
      phone: '+1 (555) 438-9102',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log('✓ Users created: Admin (admin@travelai.com) and Demo User (demo@travelai.com)');

  // 2. Seed Destinations
  const destinationsData = [
    {
      name: 'Bali',
      country: 'Indonesia',
      continent: 'Asia',
      description: 'An idyllic Indonesian island renowned for its lush terraced rice paddies, serene Hindu water temples, pristine beaches, vibrant artistic culture, and world-class surfing along dramatic coastlines.',
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'April to October (Dry Season)',
      currency: 'IDR (Indonesian Rupiah)',
      language: 'Indonesian, Balinese, English widely spoken',
      priceEstimate: 1200.00,
      isFeatured: true,
    },
    {
      name: 'Santorini',
      country: 'Greece',
      continent: 'Europe',
      description: 'A breathtaking volcanic jewel in the southern Aegean Sea, famous for dramatic whitewashed cliffside villages, cobalt blue domes, volcanic black sand beaches, and the worlds most celebrated caldera sunsets.',
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'May to September',
      currency: 'EUR (Euro)',
      language: 'Greek, English',
      priceEstimate: 1550.00,
      isFeatured: true,
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      continent: 'Asia',
      description: 'The cultural heart of Japan, brimming with thousands of classical Buddhist temples, gardens, imperial palaces, Shinto shrines, traditional wooden machiya townhouses, and peaceful bamboo groves.',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'March to May (Sakura) & October to November (Autumn leaves)',
      currency: 'JPY (Japanese Yen)',
      language: 'Japanese, English in tourist hubs',
      priceEstimate: 1750.00,
      isFeatured: true,
    },
    {
      name: 'Swiss Alps',
      country: 'Switzerland',
      continent: 'Europe',
      description: 'Majestic jagged peaks, crystalline mountain lakes, alpine meadows, world-class ski slopes, and iconic cogwheel mountain trains offering unforgettable vistas of the Matterhorn and Jungfrau.',
      imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'December to March (Skiing) & June to September (Hiking)',
      currency: 'CHF (Swiss Franc)',
      language: 'German, French, Italian, English',
      priceEstimate: 2300.00,
      isFeatured: true,
    },
    {
      name: 'Paris',
      country: 'France',
      continent: 'Europe',
      description: 'The global capital of art, fashion, gastronomy, and culture. A romantic tapestry of 19th-century cityscape crisscrossed by wide boulevards, the River Seine, and legendary landmarks like the Eiffel Tower.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520939817895-060bdef4dc1a?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'June to August & September to October',
      currency: 'EUR (Euro)',
      language: 'French, English',
      priceEstimate: 1600.00,
      isFeatured: true,
    },
    {
      name: 'Serengeti',
      country: 'Tanzania',
      continent: 'Africa',
      description: 'A vast, untamed wilderness where millions of wildebeest, zebras, and gazelles embark on the legendary Great Migration across acacia-dotted plains under the watchful eyes of lions and leopards.',
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      ],
      bestTimeToVisit: 'Late June to October (Great Migration River Crossings)',
      currency: 'TZS / USD accepted',
      language: 'Swahili, English',
      priceEstimate: 3100.00,
      isFeatured: false,
    },
  ];

  const createdDestinations = {};
  for (const d of destinationsData) {
    const created = await prisma.destination.create({ data: d });
    createdDestinations[d.name] = created;
  }
  console.log(`✓ Seeded ${Object.keys(createdDestinations).length} Destinations.`);

  // 3. Seed Hotels with Room Types
  const hotelsData = [
    {
      name: 'The Royal Purnama Resort & Spa',
      destinationId: createdDestinations['Bali'].id,
      address: 'Jl. Pantai Purnama, Sukawati, Gianyar',
      city: 'Ubud / Sukawati',
      country: 'Indonesia',
      description: 'An exclusive oceanfront haven designed for discerning travelers, featuring private plunge pool villas, lush tropical gardens, and an authentic Balinese Ayurvedic spa overlooking the sparkling sea.',
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 240.00,
      amenities: ['Free High-Speed WiFi', 'Infinity Ocean Pool', 'Balinese Spa', 'Airport Shuttle', 'Gourmet Restaurant', 'Beachfront Cabanas'],
      isFeatured: true,
      roomTypes: [
        { name: 'Deluxe Suite with Jacuzzi', capacity: 2, pricePerNight: 240.00, bedType: '1 King Bed', amenities: ['Jacuzzi', 'Ocean View Terrace', 'Espresso Machine'] },
        { name: 'Royal Private Pool Villa', capacity: 4, pricePerNight: 480.00, bedType: '2 King Beds', amenities: ['Private Plunge Pool', 'Outdoor Rain Shower', 'Butler Service'] },
      ],
    },
    {
      name: 'Four Seasons Resort Bali at Sayan',
      destinationId: createdDestinations['Bali'].id,
      address: 'Sayan, Ubud',
      city: 'Ubud',
      country: 'Indonesia',
      description: 'Hidden in a lush river valley along the sacred Ayung River, arrived via an iconic suspended bridge above the rainforest canopy. Experience serene luxury and yoga pavilions.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 620.00,
      amenities: ['Free WiFi', 'Multi-tiered Valley Pool', 'Riverside Spa', 'Yoga Shala', 'Farm-to-Table Dining'],
      isFeatured: true,
      roomTypes: [
        { name: 'Riverfront Suite', capacity: 2, pricePerNight: 620.00, bedType: '1 King Bed', amenities: ['River View', 'Deep Soaking Tub'] },
        { name: 'One-Bedroom Rainforest Villa', capacity: 3, pricePerNight: 950.00, bedType: '1 King Bed + 1 Rollaway', amenities: ['Private Pool', 'Sun Deck'] },
      ],
    },
    {
      name: 'Canaves Oia Suites & Luxury Caves',
      destinationId: createdDestinations['Santorini'].id,
      address: 'Main Street, Oia Caldera',
      city: 'Oia',
      country: 'Greece',
      description: 'Carved into the volcanic cliffside of Oia, blending contemporary minimalist elegance with traditional Cycladic architecture, infinity pools that blend into the Aegean horizon, and candlelit wine dining.',
      imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 550.00,
      amenities: ['Free WiFi', 'Caldera Infinity Pool', 'Wine Cellar Tours', 'Sunset Cocktails Bar', 'Helipad Access'],
      isFeatured: true,
      roomTypes: [
        { name: 'Classic Caldera View Suite', capacity: 2, pricePerNight: 550.00, bedType: '1 Queen Bed', amenities: ['Private Veranda', 'Panoramic Caldera View'] },
        { name: 'Infinity Cave Pool Suite', capacity: 2, pricePerNight: 890.00, bedType: '1 King Bed', amenities: ['Heated Cave Infinity Pool', 'Champagne Breakfast Included'] },
      ],
    },
    {
      name: 'Hoshinoya Kyoto',
      destinationId: createdDestinations['Kyoto'].id,
      address: '11-2 Arashiyama Genrokuzan-cho, Nishikyo-ku',
      city: 'Kyoto',
      country: 'Japan',
      description: 'A riverside retreat accessible only by a scenic wooden boat cruise up the Oi River in Arashiyama. Restored century-old Japanese architecture featuring traditional woodblock printed wallpapers and tatami rooms.',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 720.00,
      amenities: ['Free WiFi', 'Traditional Onsen Bath', 'Kaiseki Dining', 'Private Boat Transfer', 'Morning Zen Meditation'],
      isFeatured: true,
      roomTypes: [
        { name: 'Tsukihashi Riverside Suite', capacity: 2, pricePerNight: 720.00, bedType: '2 Japanese Futons or Twin Beds', amenities: ['Cedar Wood Bath', 'River Garden View'] },
        { name: 'Yamanoha Pavilion', capacity: 4, pricePerNight: 1200.00, bedType: '4 Futons', amenities: ['Panoramic Gorge View', 'Tea Ceremony Set'] },
      ],
    },
    {
      name: 'The Chedi Andermatt',
      destinationId: createdDestinations['Swiss Alps'].id,
      address: 'Gotthardstrasse 4, Andermatt',
      city: 'Andermatt',
      country: 'Switzerland',
      description: 'An architectural marvel blending Alpine chic with Asian aesthetic sensibilities. Features a 2,400-square-meter wellness spa, open fireplaces in every room, and Michelin-starred dining in the heart of the Alps.',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 780.00,
      amenities: ['Free WiFi', 'Heated Indoor & Outdoor Pools', 'Alpine Spa & Finnish Sauna', 'Ski Butler Service', 'Cheese Humidor'],
      isFeatured: true,
      roomTypes: [
        { name: 'Deluxe Alpine Room', capacity: 2, pricePerNight: 780.00, bedType: '1 King Bed', amenities: ['Fireplace', 'Heated Stone Floors', 'Balcony'] },
        { name: 'Gemsstock Suite', capacity: 4, pricePerNight: 1450.00, bedType: '2 King Beds', amenities: ['Panoramic Mountain View', 'Living Room', 'Wine Cooler'] },
      ],
    },
    {
      name: 'Hôtel Plaza Athénée Paris',
      destinationId: createdDestinations['Paris'].id,
      address: '25 Avenue Montaigne, 8th Arrondissement',
      city: 'Paris',
      country: 'France',
      description: 'The epitome of Parisian Haute Couture and timeless elegance on prestigious Avenue Montaigne. Renowned for its signature red geranium-draped facade, Dior Spa, and enchanting Eiffel Tower vistas.',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 980.00,
      amenities: ['Free WiFi', 'Dior Institut Spa', 'Michelin Star Dining', 'Eiffel Tower Balconies', 'Concierge Clefs d’Or'],
      isFeatured: true,
      roomTypes: [
        { name: 'Superior King Room', capacity: 2, pricePerNight: 980.00, bedType: '1 King Bed', amenities: ['Marble Bathroom', 'Avenue Montaigne View'] },
        { name: 'Eiffel Tower Suite', capacity: 2, pricePerNight: 1950.00, bedType: '1 King Bed', amenities: ['Direct Eiffel Tower View', 'Living Salon', 'Champagne on Arrival'] },
      ],
    },
    {
      name: 'Four Seasons Safari Lodge Serengeti',
      destinationId: createdDestinations['Serengeti'].id,
      address: 'Central Serengeti National Park',
      city: 'Serengeti',
      country: 'Tanzania',
      description: 'Deep in the heart of Africa’s most celebrated wildlife sanctuary. Watch elephants and wildlife gather at the active watering hole directly from your elevated deck and infinity swimming pool.',
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
      ],
      starRating: 5,
      pricePerNight: 1150.00,
      amenities: ['Free WiFi', 'Watering Hole Infinity Pool', 'Daily Game Drives', 'Discovery Centre Museum', 'Bush Dinners'],
      isFeatured: true,
      roomTypes: [
        { name: 'Savannah Room', capacity: 2, pricePerNight: 1150.00, bedType: '1 King Bed', amenities: ['Private Balcony', 'Outdoor Shower', 'Binoculars Provided'] },
        { name: 'Waterhole Terrace Villa', capacity: 4, pricePerNight: 2300.00, bedType: '2 King Beds', amenities: ['Private Plunge Pool', 'Direct Waterhole Frontage'] },
      ],
    },
  ];

  const createdHotels = [];
  for (const h of hotelsData) {
    const { roomTypes, ...hotelFields } = h;
    const hotel = await prisma.hotel.create({
      data: {
        ...hotelFields,
        roomTypes: {
          create: roomTypes.map((rt) => ({
            ...rt,
            amenities: rt.amenities || [],
            totalRooms: 10,
            availableRooms: 10,
          })),
        },
      },
      include: { roomTypes: true },
    });
    createdHotels.push(hotel);
  }
  console.log(`✓ Seeded ${createdHotels.length} Hotels with associated Room Types.`);

  // 4. Seed Travel Packages
  const packagesData = [
    {
      title: 'Bali Spiritual & Coastal Escape',
      destinationId: createdDestinations['Bali'].id,
      durationDays: 7,
      durationNights: 6,
      pricePerPerson: 1199.00,
      maxCapacity: 16,
      bookedCount: 6,
      category: 'Cultural',
      season: 'Year-Round (Best: May - Sep)',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Arrival & Oceanfront Welcome', description: 'Airport pickup in private VIP minivan, check-in at luxury resort, and an evening Balinese seafood barbecue dinner on the beach.' },
        { day: 2, title: 'Sacred Temples & Tegallalang Rice Terraces', description: 'Early morning guided excursion to Tirta Empul holy spring water temple, followed by a walk through the lush green rice terraces.' },
        { day: 3, title: 'Mount Batur Sunrise Trek', description: 'Sunrise trek up active Mount Batur volcano followed by a breakfast cooked by volcanic steam and a dip in natural hot springs.' },
        { day: 4, title: 'Ubud Arts, Cooking & Monkey Forest', description: 'Visit local artisans, explore the sacred Ubud Monkey Forest, and participate in an authentic Balinese organic cooking class.' },
        { day: 5, title: 'Nusa Penida Island Speedboat Day', description: 'Fast boat to Nusa Penida to witness the famous T-Rex cliff at Kelingking Beach, Angel’s Billabong, and snorkel with manta rays.' },
        { day: 6, title: 'Uluwatu Sunset & Kecak Fire Dance', description: 'Explore south coast surf beaches, Uluwatu cliff temple, and witness the captivating rhythmic Kecak Fire Dance at sunset.' },
        { day: 7, title: 'Balinese Spa & Farewell Transfer', description: 'Two-hour traditional herbal oil massage, souvenir shopping, and private chauffeur transfer to Denpasar International Airport.' },
      ],
      includedServices: [
        '6 nights 5-star resort accommodations',
        'Daily gourmet breakfasts and 4 dinners',
        'All private air-conditioned transport',
        'English-speaking licensed certified guide',
        'Fast boat tickets to Nusa Penida island',
        'All temple entrance fees and activity permits',
      ],
      excludedServices: [
        'International flights to/from Bali',
        'Personal shopping and travel insurance',
        'Alcoholic beverages not listed in dinners',
      ],
    },
    {
      title: 'Santorini Sunsets & Aegean Yacht Odyssey',
      destinationId: createdDestinations['Santorini'].id,
      durationDays: 5,
      durationNights: 4,
      pricePerPerson: 1380.00,
      maxCapacity: 12,
      bookedCount: 4,
      category: 'Romantic',
      season: 'May - October',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Arrival in Oia Caldera', description: 'VIP airport or port greeting and escort to your whitewashed cliffside cave suite. Evening sunset welcome cocktails.' },
        { day: 2, title: 'Caldera Hiking & Akrotiri Ruins', description: 'Scenic walking trail along the rim from Fira to Oia, followed by a private guided tour of prehistoric Akrotiri archaeological site.' },
        { day: 3, title: 'Private Catamaran Cruise & Volcanic Springs', description: 'Sail past Red Beach and White Beach, swim in volcanic thermal sulfur springs, and enjoy a grilled Greek lunch onboard.' },
        { day: 4, title: 'Boutique Winery Tour & Megalochori', description: 'Tasting of volcanic Assyrtiko white wines at three cliffside estates, exploring preserved Venetian village Megalochori.' },
        { day: 5, title: 'Aegean Sunrise & Departure', description: 'Leisurely champagne breakfast overlooking the caldera followed by private transfer for your onward journey.' },
      ],
      includedServices: [
        '4 nights luxury cliffside cave suite in Oia',
        'Daily champagne breakfast',
        'Full-day private catamaran sailing cruise with meal and open bar',
        'Volcanic wine tasting pass with sommelier',
        'All private Mercedes airport/ferry transfers',
      ],
      excludedServices: [
        'International airfare',
        'Travel insurance',
        'Optional helicopter charter transfers',
      ],
    },
    {
      title: 'Kyoto Cultural Heritage & Tea Masterclasses',
      destinationId: createdDestinations['Kyoto'].id,
      durationDays: 6,
      durationNights: 5,
      pricePerPerson: 1650.00,
      maxCapacity: 14,
      bookedCount: 5,
      category: 'Cultural',
      season: 'Spring (Sakura) & Autumn (Koyo)',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Konnichiwa Kyoto', description: 'Arrive at Kyoto Station, transfer to traditional Ryokan, and experience your first multi-course seasonal Kaiseki banquet.' },
        { day: 2, title: 'Fushimi Inari 10,000 Torii & Sake District', description: 'Early access walking through the iconic red torii path before crowds, followed by Fushimi sake brewery exploration.' },
        { day: 3, title: 'Arashiyama Bamboo Grove & Tenryu-ji', description: 'Wander the towering Arashiyama bamboo path, view Zen rock gardens at UNESCO World Heritage Tenryu-ji.' },
        { day: 4, title: 'Authentic Matcha Tea Ceremony & Kimono', description: 'Private tea masterclass in a historic 300-year-old teahouse, traditional silk kimono dressing, and Gion evening stroll.' },
        { day: 5, title: 'Kinkaku-ji Golden Pavilion & Daitoku-ji', description: 'Marvel at the glistening Gold Leaf Pavilion and practice mindfulness meditation with a Zen monk at Daitoku-ji temple.' },
        { day: 6, title: 'Sayonara Kyoto', description: 'Final Japanese matcha breakfast and private bullet train escort to Tokyo or Kansai Airport.' },
      ],
      includedServices: [
        '5 nights luxury Ryokan and boutique hotel lodging',
        'Daily Japanese traditional breakfasts & 2 Kaiseki dinners',
        'Private certified Kyoto cultural guide throughout',
        'Exclusive private Uji matcha tea masterclass',
        '7-day Japan Rail Green Car Pass',
      ],
      excludedServices: [
        'International airfare',
        'Personal expenses and additional meals',
      ],
    },
    {
      title: 'Swiss Alpine Panorama & Glacier Express',
      destinationId: createdDestinations['Swiss Alps'].id,
      durationDays: 8,
      durationNights: 7,
      pricePerPerson: 2490.00,
      maxCapacity: 16,
      bookedCount: 8,
      category: 'Adventure',
      season: 'June - September (Hiking) / Dec - Mar (Ski)',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Zurich to Lucerne Lake Vista', description: 'Scenic train from Zurich to Lucerne, stroll Chapel Bridge, and sunset steamship cruise on Lake Lucerne.' },
        { day: 2, title: 'Mount Pilatus Golden Round Trip', description: 'Ascend Pilatus via the world’s steepest cogwheel railway, alpine toboggan run, and cableway descent.' },
        { day: 3, title: 'Glacier Express Scenic Train to Zermatt', description: 'Board the panoramic Glacier Express crossing 291 bridges and 91 tunnels through dramatic Swiss mountain passes.' },
        { day: 4, title: 'Matterhorn Glacier Paradise Ascent', description: 'Take Europe’s highest 3S cable car to 3,883 meters for 360-degree views of 38 alpine four-thousanders and the ice palace.' },
        { day: 5, title: 'Gornergrat Cogwheel & Alpine Lakes Trail', description: 'Ride the Gornergrat train and hike past Riffelsee reflecting the iconic Matterhorn summit.' },
        { day: 6, title: 'Interlaken & Jungfraujoch Top of Europe', description: 'Travel into the Bernese Oberland to Jungfraujoch, the highest railway station in Europe, walking inside the Aletsch Glacier.' },
        { day: 7, title: 'Grindelwald First Cliff Walk & Alpine Spa', description: 'Walk the suspension Cliff Walk by Tissot, relax in an open-air heated infinity pool overlooking the Eiger North Face.' },
        { day: 8, title: 'Farewell Swiss Alpine Adventure', description: 'Scenic return journey to Zurich Airport with memories that will last a lifetime.' },
      ],
      includedServices: [
        '7 nights 4 and 5-star Alpine resort lodging',
        'Swiss Travel Pass First Class 8-day unlimited transit',
        'Reserved seats on Glacier Express Panoramic Coach',
        'Jungfraujoch and Matterhorn Glacier Paradise cableway tickets',
        'Daily buffet breakfast and 4 alpine fondue dinners',
      ],
      excludedServices: [
        'International flights',
        'Ski gear rental and lift passes (if winter)',
      ],
    },
    {
      title: 'Serengeti Big Five Luxury Safari',
      destinationId: createdDestinations['Serengeti'].id,
      durationDays: 7,
      durationNights: 6,
      pricePerPerson: 3200.00,
      maxCapacity: 10,
      bookedCount: 3,
      category: 'Adventure',
      season: 'June - October',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Arusha to Ngorongoro Crater Rim', description: 'Fly into Kilimanjaro, private safari vehicle transfer to the caldera rim with sunset sundowners overlooking the crater floor.' },
        { day: 2, title: 'Ngorongoro Crater Floor Safari', description: 'Descend 600m to the wildlife-dense crater floor to spot rare black rhinos, lion prides, flamingos, and elephants.' },
        { day: 3, title: 'Into the Great Serengeti Plains', description: 'Game drive through Olduvai Gorge and into the vast Serengeti Savannah, arriving at your luxury tented safari lodge.' },
        { day: 4, title: 'Sunrise Hot Air Balloon Flight', description: 'Floating at dawn above the great herds of the Serengeti followed by a champagne bush breakfast under an acacia tree.' },
        { day: 5, title: 'Predator Tracking & Mara River Crossing', description: 'Follow migrating wildebeest herds, tracking cheetah coalitions and riverbank crocodiles.' },
        { day: 6, title: 'Seronera Valley Leopard Tracking', description: 'Search for leopards lounging in sausage trees and enjoy an evening traditional Maasai warrior storytelling campfire.' },
        { day: 7, title: 'Bush Flight to Kilimanjaro', description: 'Morning game drive to the bush airstrip and panoramic charter flight back to Kilimanjaro International Airport.' },
      ],
      includedServices: [
        '6 nights luxury tented safari suites with all meals included',
        'Custom 4x4 Land Cruiser with pop-up roof and guaranteed window seat',
        'Professional licensed silver-level wildlife tracker guide',
        'Sunrise hot air balloon safari flight and champagne bush breakfast',
        'All Serengeti and Ngorongoro national park conservation fees',
      ],
      excludedServices: [
        'International flights',
        'Tipping for safari guides and camp staff',
        'Visa fees for Tanzania',
      ],
    },
    {
      title: 'Parisian Romance & Culinary Masterclass',
      destinationId: createdDestinations['Paris'].id,
      durationDays: 5,
      durationNights: 4,
      pricePerPerson: 1450.00,
      maxCapacity: 12,
      bookedCount: 4,
      category: 'Luxury',
      season: 'Spring - Autumn',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      galleryUrls: [
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      ],
      itinerary: [
        { day: 1, title: 'Bienvenue à Paris', description: 'Private transfer from Charles de Gaulle to Avenue Montaigne, welcome macarons, and private Seine river sunset champagne cruise.' },
        { day: 2, title: 'Louvre VIP After-Hours & Montmartre', description: 'Skip-the-line VIP tour of the Mona Lisa and Venus de Milo, followed by an afternoon walking tour of bohemian Montmartre.' },
        { day: 3, title: 'French Patisserie & Macaron Masterclass', description: 'Hands-on pastry baking workshop with a master French pastry chef, crafting authentic croissants and macarons.' },
        { day: 4, title: 'Versailles Palace & Hall of Mirrors', description: 'Private day trip to the Palace of Versailles, exploring the royal gardens and the Grand Trianon.' },
        { day: 5, title: 'Au Revoir Paris', description: 'Gourmet French cafe breakfast and private chauffeur transfer to airport or train station.' },
      ],
      includedServices: [
        '4 nights 5-star boutique hotel in Central Paris',
        'Daily Parisian petit déjeuner and 2 Michelin-starred dinners',
        'VIP skip-the-line Louvre and Versailles admission with private guide',
        'Hands-on French pastry masterclass with chef',
        'Private Mercedes E-Class transfers',
      ],
      excludedServices: [
        'International airfare',
        'Personal shopping along Champs-Élysées',
      ],
    },
  ];

  const createdPackages = [];
  for (const pkg of packagesData) {
    const p = await prisma.travelPackage.create({ data: pkg });
    createdPackages.push(p);
  }
  console.log(`✓ Seeded ${createdPackages.length} Travel Packages.`);

  // 5. Seed Sample Bookings
  const sampleBookings = [
    {
      bookingReference: generateBookingReference(),
      userId: demoUser.id,
      bookingType: 'HOTEL',
      hotelId: createdHotels[0].id,
      roomTypeId: createdHotels[0].roomTypes[0].id,
      checkInDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      checkOutDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), // 19 days from now (5 nights)
      travelerCount: 2,
      guestsDetails: [
        { fullName: 'Alex Morgan', email: 'demo@travelai.com' },
        { fullName: 'Taylor Reed', email: 'taylor@example.com' },
      ],
      specialRequests: 'High floor with ocean view please. Celebrating 5th wedding anniversary.',
      unitPriceSnapshot: 240.00,
      subtotal: 1200.00, // 5 nights * $240
      taxAmount: 120.00, // 10%
      serviceFee: 60.00, // 5%
      totalAmount: 1380.00,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'Demo Visa •••• 4242',
      paymentReference: `DEMO-PAY-${Date.now()}-1`,
    },
    {
      bookingReference: generateBookingReference(),
      userId: demoUser.id,
      bookingType: 'PACKAGE',
      packageId: createdPackages[0].id,
      checkInDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      checkOutDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000), // 7 days later
      travelerCount: 2,
      guestsDetails: [
        { fullName: 'Alex Morgan', email: 'demo@travelai.com' },
        { fullName: 'Taylor Reed', email: 'taylor@example.com' },
      ],
      specialRequests: 'Vegetarian meals preferred for the cooking class.',
      unitPriceSnapshot: 1199.00,
      subtotal: 2398.00, // 2 travelers * $1199
      taxAmount: 239.80,
      serviceFee: 119.90,
      totalAmount: 2757.70,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'Demo Mastercard •••• 8888',
      paymentReference: `DEMO-PAY-${Date.now()}-2`,
    },
    {
      bookingReference: generateBookingReference(),
      userId: demoUser.id,
      bookingType: 'HOTEL',
      hotelId: createdHotels[2].id, // Canaves Oia
      roomTypeId: createdHotels[2].roomTypes[0].id,
      checkInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      checkOutDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000), // 26 days ago
      travelerCount: 2,
      guestsDetails: [{ fullName: 'Alex Morgan' }],
      specialRequests: 'Late arrival at 9 PM.',
      unitPriceSnapshot: 550.00,
      subtotal: 2200.00,
      taxAmount: 220.00,
      serviceFee: 110.00,
      totalAmount: 2530.00,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Demo Visa •••• 4242',
      paymentReference: `DEMO-PAY-PAST-${Date.now()}`,
    },
  ];

  for (const b of sampleBookings) {
    await prisma.booking.create({ data: b });
  }
  console.log(`✓ Seeded ${sampleBookings.length} Sample Bookings.`);

  console.log('🎉 Seeding successfully completed!');
  console.log('--------------------------------------------------');
  console.log('Sample Logins:');
  console.log('Administrator: admin@travelai.com / Admin@123456');
  console.log('Demo Customer: demo@travelai.com / Travel@123456');
  console.log('--------------------------------------------------');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
