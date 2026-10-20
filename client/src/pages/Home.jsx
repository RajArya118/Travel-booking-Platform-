import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';
import PackageCard from '../components/PackageCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { destinationsAPI, hotelsAPI, packagesAPI } from '../services/api';
import {
  Compass,
  ShieldCheck,
  Zap,
  Headphones,
  Award,
  ArrowRight,
  Star,
  Quote,
  Sparkles,
  Plane,
} from 'lucide-react';

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, hotelsRes, pkgRes] = await Promise.all([
          destinationsAPI.getAll({ limit: 4, featured: true }),
          hotelsAPI.getAll({ limit: 3, featured: true }),
          packagesAPI.getAll({ limit: 3, featured: true }),
        ]);

        if (destRes.data?.success) setDestinations(destRes.data.data);
        if (hotelsRes.data?.success) setHotels(hotelsRes.data.data);
        if (pkgRes.data?.success) setPackages(pkgRes.data.data);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Pricing Engine',
      description: 'Transparent server-side verified rates with zero hidden markups or sudden checkout surcharges.',
    },
    {
      icon: ShieldCheck,
      title: 'Handpicked Luxury',
      description: 'Every hotel and expedition is verified by travel curators for luxury standards and safety.',
    },
    {
      icon: Headphones,
      title: '24/7 Global Concierge',
      description: 'Dedicated travel experts supporting you from planning through flight departures and returns.',
    },
    {
      icon: Award,
      title: 'Flexible Cancellation',
      description: 'Seamless self-service booking cancellations and prompt demo refunds directly in your portal.',
    },
  ];

  const sampleTestimonials = [
    {
      name: 'Sophia Martinez',
      role: 'Solo Explorer & Photographer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment: 'Booking my Bali retreat with TravelAI was flawless. The oceanfront villa and local driver were arranged down to the minute. Truly world-class!',
      rating: 5,
      location: 'Bali Coastal Escape',
    },
    {
      name: 'David Chen',
      role: 'Architect & Travel Writer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      comment: 'The Kyoto heritage tour itinerary surpassed all expectations. The private tea ceremony and bullet train passes were ready upon arrival.',
      rating: 5,
      location: 'Kyoto Cultural Odyssey',
    },
    {
      name: 'Emma & Liam Harrison',
      role: 'Honeymooners',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      comment: 'Santorini cliffside cave suite was straight out of a dream. Watching the sunset directly from our plunge pool was unforgettable.',
      rating: 5,
      location: 'Santorini Sunsets',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
              <Compass className="w-4 h-4" /> Iconic Escapes
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Popular Global Destinations
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Immerse yourself in timeless European romance, tropical Asian sanctuaries, and alpine wonderlands.
            </p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 mt-4 sm:mt-0 group"
          >
            Explore All Destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Hotels & Resorts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" /> Luxury Accommodations
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Featured 5-Star Hotels & Resorts
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Unrivaled comfort, private plunge pools, panoramic vistas, and Michelin-starred dining.
            </p>
          </div>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 mt-4 sm:mt-0 group"
          >
            Browse All Hotels
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Recommended Travel Packages */}
      <section className="bg-gradient-to-b from-primary-900/5 via-primary-50/50 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
                <Plane className="w-4 h-4" /> Curated Expeditions
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                Recommended All-Inclusive Packages
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-lg">
                Complete vacation itineraries with verified guides, daily meals, private transport, and entrance passes.
              </p>
            </div>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 mt-4 sm:mt-0 group"
            >
              View All Packages
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} travelPackage={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Why Choose TravelAI Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            The TravelAI Distinction
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
            Why Discerning Travelers Choose Us
          </h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Engineered from the ground up for travelers who demand transparency, verified luxury, and total peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">
              Verified Traveler Stories
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-2">
              Loved by Explorers Worldwide
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              (Sample traveler reviews demonstrating customer feedback interface)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleTestimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between relative shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                  <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                    "{testimonial.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{testimonial.name}</h4>
                    <p className="text-xs text-accent-400 font-medium">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 p-8 sm:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Your Journey Awaits
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Book Your Next Dream Vacation?
            </h2>
            <p className="text-primary-100 text-sm mt-2 leading-relaxed">
              Explore our handpicked travel packages with verified reservations and instant confirmations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/packages"
              className="px-6 py-3.5 bg-white text-primary-700 hover:bg-slate-50 font-bold rounded-xl shadow-lg transition-all text-center text-sm"
            >
              Browse Packages
            </Link>
            <Link
              to="/destinations"
              className="px-6 py-3.5 bg-primary-800/60 hover:bg-primary-800/80 text-white font-bold rounded-xl border border-white/20 transition-all text-center text-sm"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
