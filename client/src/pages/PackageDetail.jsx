import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { packagesAPI } from '../services/api';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  ShieldCheck,
  ArrowLeft,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PackageDetail = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [expandedDay, setExpandedDay] = useState(1);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await packagesAPI.getById(id);
        if (res.data?.success) {
          const p = res.data.data;
          setPkg(p);
          setActiveImage(p.imageUrl);
        }
      } catch (err) {
        console.error('Failed to load package details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Package link copied to clipboard!');
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!pkg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800">Package Not Found</h2>
        <p className="text-slate-500 mt-2 mb-6">The expedition requested does not exist or has been removed.</p>
        <Link to="/packages" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold">
          Back to Packages
        </Link>
      </div>
    );
  }

  const gallery = [pkg.imageUrl, ...(pkg.galleryUrls || [])];
  const remainingSpots = pkg.maxCapacity - pkg.bookedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button & share */}
      <div className="flex items-center justify-between">
        <Link
          to="/packages"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Packages
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Package
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 bg-accent-50 text-accent-700 text-xs font-bold rounded-full">
              {pkg.category} Expedition
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              {pkg.durationDays} Days / {pkg.durationNights} Nights
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            {pkg.title}
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
            {pkg.destination?.name}, {pkg.destination?.country}
          </p>
        </div>

        <div className="text-right flex flex-col md:items-end">
          <span className="text-xs text-slate-400 font-medium">All-Inclusive Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary-600">
              ${parseFloat(pkg.pricePerPerson).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-400">/ traveler</span>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-soft bg-slate-100">
          <img
            src={activeImage}
            alt={pkg.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[480px]">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`h-28 rounded-2xl overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Itinerary & Booking Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Day by Day Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Day by Day Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Daily Expedition Itinerary
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full step-by-step itinerary crafted by certified destination experts
                </p>
              </div>
              <span className="text-xs font-bold bg-primary-50 text-primary-600 px-3 py-1 rounded-xl">
                {pkg.durationDays} Days Curated
              </span>
            </div>

            <div className="space-y-3">
              {(pkg.itinerary || []).map((dayItem) => {
                const isExpanded = expandedDay === dayItem.day;
                return (
                  <div
                    key={dayItem.day}
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                  >
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : dayItem.day)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                          D{dayItem.day}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            {dayItem.title}
                          </h3>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white">
                        <p>{dayItem.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Included & Excluded Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What's Included
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {(pkg.includedServices || []).map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" /> What's Excluded
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {(pkg.excludedServices || []).map((srv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Sidebar Card */}
        <div>
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft sticky top-28 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Expedition Reservation
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Itinerary
              </span>
            </div>

            {/* Price Snapshot */}
            <div>
              <span className="text-xs text-slate-400 block font-medium">Fixed Package Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary-600">
                  ${parseFloat(pkg.pricePerPerson).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-slate-400">/ person (all fees calculated on server)</span>
              </div>
            </div>

            {/* Capacity status */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary-600" /> Capacity
                </span>
                <span>{pkg.bookedCount} / {pkg.maxCapacity} Booked</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (pkg.bookedCount / pkg.maxCapacity) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-accent-700 font-bold block pt-1">
                {remainingSpots > 0 ? `${remainingSpots} spots remaining for this season` : 'Fully Booked'}
              </span>
            </div>

            {/* Season info */}
            {pkg.season && (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Best Travel Season: <strong className="text-slate-700">{pkg.season}</strong></span>
              </div>
            )}

            <button
              onClick={() => navigate(`/book?type=PACKAGE&packageId=${pkg.id}`)}
              disabled={remainingSpots <= 0}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book This Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
