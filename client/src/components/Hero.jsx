import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Hotel, Briefcase, Compass, Sparkles } from 'lucide-react';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'hotels' | 'packages'
  const [destinationQuery, setDestinationQuery] = useState('');
  const [hotelQuery, setHotelQuery] = useState('');
  const [packageCategory, setPackageCategory] = useState('');
  const [travelerCount, setTravelerCount] = useState(2);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'destinations') {
      navigate(destinationQuery ? `/destinations?search=${encodeURIComponent(destinationQuery)}` : '/destinations');
    } else if (activeTab === 'hotels') {
      navigate(hotelQuery ? `/hotels?search=${encodeURIComponent(hotelQuery)}` : '/hotels');
    } else if (activeTab === 'packages') {
      const query = [];
      if (destinationQuery) query.push(`search=${encodeURIComponent(destinationQuery)}`);
      if (packageCategory) query.push(`category=${encodeURIComponent(packageCategory)}`);
      navigate(`/packages${query.length ? '?' + query.join('&') : ''}`);
    }
  };

  return (
    <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Hero Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80"
          alt="Tropical paradise travel background"
          className="w-full h-full object-cover object-center transform scale-105 animate-pulse-subtle"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Highlight Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span>Next-Generation Travel Booking</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight drop-shadow-md">
          Explore Extraordinary Places <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">
            With TravelAI Precision
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 mb-10 leading-relaxed font-normal drop-shadow">
          Book handpicked luxury resorts, bespoke cultural itineraries, and guaranteed experiences with transparent server pricing.
        </p>

        {/* Tabbed Search Box Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-3 sm:p-5 shadow-2xl border border-white/40 max-w-4xl mx-auto text-left">
          {/* Tabs */}
          <div className="flex border-b border-slate-200/80 pb-3 mb-4 gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('destinations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'destinations'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Destinations
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'hotels'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'
              }`}
            >
              <Hotel className="w-4 h-4" />
              Hotels & Resorts
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'packages'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Travel Packages
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {activeTab === 'destinations' && (
              <div className="sm:col-span-9 relative">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Where do you want to wander?
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-primary-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Search by city, country or island (e.g. Bali, Santorini, Paris)..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <>
                <div className="sm:col-span-6 relative">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Destination or Hotel Name
                  </label>
                  <div className="relative">
                    <Hotel className="w-5 h-5 text-primary-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={hotelQuery}
                      onChange={(e) => setHotelQuery(e.target.value)}
                      placeholder="e.g. Four Seasons, Purnama, Oia Suites..."
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 relative">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-primary-500 absolute left-3.5 top-3" />
                    <select
                      value={travelerCount}
                      onChange={(e) => setTravelerCount(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4+ Guests</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'packages' && (
              <>
                <div className="sm:col-span-5 relative">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-primary-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={destinationQuery}
                      onChange={(e) => setDestinationQuery(e.target.value)}
                      placeholder="e.g. Kyoto, Alps, Serengeti..."
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4 relative">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Expedition Category
                  </label>
                  <select
                    value={packageCategory}
                    onChange={(e) => setPackageCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="Cultural">Cultural Heritage</option>
                    <option value="Adventure">Adventure & Safari</option>
                    <option value="Romantic">Romantic Getaway</option>
                    <option value="Luxury">Luxury & Gastronomy</option>
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className={`sm:col-span-3 ${activeTab === 'destinations' ? 'sm:col-span-3 sm:mt-5' : 'sm:mt-5'}`}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all text-sm group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Find Journeys
              </button>
            </div>
          </form>
        </div>

        {/* Feature stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/80 text-xs sm:text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400" /> 6+ Global Iconic Destinations
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400" /> 5-Star Verified Accommodations
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400" /> Guaranteed Instant Reservations
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
