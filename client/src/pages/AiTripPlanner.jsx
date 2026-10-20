import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Sun,
  Sunset,
  Moon,
  Lightbulb,
  CheckSquare,
  UtensilsCrossed,
  ArrowRight,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import aiService from '../services/aiService';
import { useToast } from '../context/ToastContext';

const QUICK_DESTINATIONS = [
  'Kyoto, Japan',
  'Bali, Indonesia',
  'Paris, France',
  'Swiss Alps, Switzerland',
  'Santorini, Greece',
  'New York, USA',
];

const INTEREST_OPTIONS = [
  'Cultural & Heritage',
  'Fine Dining & Street Food',
  'Nature & Hiking',
  'Photography & Views',
  'Beaches & Relaxation',
  'Nightlife & Entertainment',
  'Adventure Sports',
  'Local Markets & Shopping',
];

const BUDGET_TIERS = [
  { id: 'Budget', label: 'Budget-Savvy', desc: 'Hostels, local transit, authentic street eats' },
  { id: 'Moderate', label: 'Comfort & Quality', desc: 'Boutique hotels, curated tours, classic bistros' },
  { id: 'Luxury', label: '5-Star Luxury', desc: 'Luxury resorts, private guides, fine dining' },
];

const TRAVELER_TYPES = ['Solo Adventurer', 'Romantic Couple', 'Family with Kids', 'Group of Friends'];

const AiTripPlanner = () => {
  const { showToast } = useToast();

  // Form State
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [durationDays, setDurationDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [travelers, setTravelers] = useState('Romantic Couple');
  const [selectedInterests, setSelectedInterests] = useState(['Cultural & Heritage', 'Fine Dining & Street Food']);

  // Result State
  const [loading, setLoading] = useState(false);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      showToast('Please enter a destination to plan your journey.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.generateItinerary({
        destination: destination.trim(),
        durationDays,
        budget,
        travelers,
        interests: selectedInterests,
      });

      if (res.success && res.data) {
        setItineraryResult(res.data);
        setActiveDayTab(1);
        setCheckedItems({});
        showToast('Your personalized AI itinerary is ready!', 'success');
      } else {
        showToast('Unable to generate itinerary. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error communicating with AI engine', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-primary-500/20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-400/30 text-accent-300 text-xs font-bold tracking-wider uppercase mb-5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-pulse text-accent-400" />
              Powered by Google Gemini 3.8 Flash
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI Travel Itinerary <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Planner</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Design a tailor-made, day-by-day travel plan crafted to your exact pace, budget, and passions. From morning excursions to evening dinners, our AI concierge builds your ultimate itinerary in seconds.
            </p>
          </div>
        </div>

        {/* Generator Form */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-200/80 p-6 sm:p-10">
          <form onSubmit={handleGenerate} className="space-y-8">
            
            {/* 1. Destination Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-primary-600" />
                Where do you want to go?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Japan or Florence, Italy"
                  className="w-full px-5 py-4 pl-12 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-base font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
                  required
                />
                <Compass className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Quick Picks */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 mr-1">Popular:</span>
                {QUICK_DESTINATIONS.map((dest) => (
                  <button
                    type="button"
                    key={dest}
                    onClick={() => setDestination(dest)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      destination === dest
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Duration, Budget & Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Duration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Trip Length
                </label>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">{durationDays} Days</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 3, 5, 7, 10, 14].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDurationDays(d)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          durationDays === d
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  Budget Style
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {BUDGET_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label} ({tier.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Travelers */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-primary-600" />
                  Traveler Group
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {TRAVELER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Interests Tag Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Interests & Activities (Choose any)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        active
                          ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-base sm:text-lg shadow-lg shadow-primary-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Gemini 3.8 Flash is crafting your itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-accent-300" />
                    <span>Generate Personalized Itinerary</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Itinerary Section */}
        {itineraryResult && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Itinerary Banner Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-slate-200 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified by {itineraryResult.source || 'Gemini 3.8 Flash'}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {itineraryResult.tripTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 font-medium">
                    {itineraryResult.tagline}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Save
                  </button>
                  <Link
                    to={`/book?destination=${encodeURIComponent(destination)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-600/20"
                  >
                    <span>Book Trip</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Trip Highlights & Season */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trip Overview</h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {itineraryResult.summary}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Best Time to Visit & Weather
                  </h3>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {itineraryResult.bestTimeToVisit}
                  </p>
                </div>
              </div>

              {/* Estimated Budget Card */}
              {itineraryResult.estimatedBudgetBreakdown && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary-900 to-slate-900 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary-300">
                        Estimated Budget ({budget} Tier)
                      </span>
                      <h4 className="text-xl font-bold text-white mt-1">
                        Total Est: {itineraryResult.estimatedBudgetBreakdown.estimatedTotal}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-300">Estimates include taxes & standard gratuities</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-400 font-medium block">Accommodation</span>
                      <span className="text-base font-bold text-white mt-0.5 block">
                        {itineraryResult.estimatedBudgetBreakdown.accommodation}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-400 font-medium block">Dining & Food</span>
                      <span className="text-base font-bold text-white mt-0.5 block">
                        {itineraryResult.estimatedBudgetBreakdown.foodAndDining}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-400 font-medium block">Activities & Entry</span>
                      <span className="text-base font-bold text-white mt-0.5 block">
                        {itineraryResult.estimatedBudgetBreakdown.activities}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-[11px] text-slate-400 font-medium block">Local Transport</span>
                      <span className="text-base font-bold text-white mt-0.5 block">
                        {itineraryResult.estimatedBudgetBreakdown.localTransport}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Day by Day Plan */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Day-by-Day Schedule
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Click each day tab to explore morning, afternoon, and evening plans.
                  </p>
                </div>

                {/* Day selector tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {itineraryResult.days?.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDayTab(day.dayNumber)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        activeDayTab === day.dayNumber
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Day {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Content */}
              {itineraryResult.days && (
                (() => {
                  const day = itineraryResult.days.find((d) => d.dayNumber === activeDayTab) || itineraryResult.days[0];
                  if (!day) return null;

                  return (
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-primary-50/70 border border-primary-100 flex items-center justify-between">
                        <span className="text-base font-bold text-primary-900">
                          {day.theme}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-primary-700 border border-primary-200">
                          Day {day.dayNumber} of {itineraryResult.days.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Morning */}
                        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100/80 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                              <Sun className="w-4 h-4 text-amber-500" />
                              Morning • {day.morning?.duration || '9:00 AM - 12:30 PM'}
                            </div>
                            <h4 className="text-base font-bold text-slate-900">{day.morning?.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {day.morning?.description}
                            </p>
                          </div>
                          {day.morning?.location && (
                            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-amber-200/50">
                              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                              <span>{day.morning.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Afternoon */}
                        <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100/80 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
                              <Sunset className="w-4 h-4 text-sky-500" />
                              Afternoon • {day.afternoon?.duration || '1:00 PM - 5:00 PM'}
                            </div>
                            <h4 className="text-base font-bold text-slate-900">{day.afternoon?.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {day.afternoon?.description}
                            </p>
                          </div>
                          {day.afternoon?.location && (
                            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-sky-200/50">
                              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                              <span>{day.afternoon.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Evening */}
                        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                              <Moon className="w-4 h-4 text-indigo-500" />
                              Evening • {day.evening?.duration || '6:30 PM Onward'}
                            </div>
                            <h4 className="text-base font-bold text-slate-900">{day.evening?.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {day.evening?.description}
                            </p>
                          </div>
                          {day.evening?.location && (
                            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 pt-2 border-t border-indigo-200/50">
                              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                              <span>{day.evening.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Insider Tip for the Day */}
                      {day.insiderTip && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                              Local Insider Advice
                            </span>
                            <p className="text-xs sm:text-sm text-emerald-950 mt-0.5 font-medium">
                              {day.insiderTip}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Packing List & Local Dining */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Packing Checklist */}
              {itineraryResult.packingChecklist && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                    <CheckSquare className="w-5 h-5 text-primary-600" />
                    Essential Packing Checklist
                  </div>
                  <div className="space-y-2.5">
                    {itineraryResult.packingChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          checkedItems[idx]
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            checkedItems[idx]
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {checkedItems[idx] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Dining Recommendations */}
              {itineraryResult.localCuisineToTry && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                    <UtensilsCrossed className="w-5 h-5 text-accent-500" />
                    Authentic Flavors to Savor
                  </div>
                  <div className="space-y-2.5">
                    {itineraryResult.localCuisineToTry.map((food, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                      >
                        <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium">
                          {food}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Call to Action */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to turn this itinerary into reality?</h3>
              <p className="text-primary-100 max-w-2xl mx-auto text-sm sm:text-base">
                Book verified hotels and tailored vacation packages in {destination} with instantaneous reservation confirmations.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link
                  to={`/hotels?search=${encodeURIComponent(destination)}`}
                  className="px-6 py-3.5 rounded-xl bg-white text-primary-800 font-bold text-sm shadow-md hover:bg-slate-50 transition-all"
                >
                  Find Hotels in {destination}
                </Link>
                <Link
                  to="/packages"
                  className="px-6 py-3.5 rounded-xl bg-primary-800/80 hover:bg-primary-900 text-white font-bold text-sm border border-white/20 transition-all"
                >
                  Browse Travel Packages
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AiTripPlanner;
