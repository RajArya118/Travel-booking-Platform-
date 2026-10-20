import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsAPI } from '../services/api';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import HotelCard from '../components/HotelCard';
import PackageCard from '../components/PackageCard';
import {
  MapPin,
  Calendar,
  DollarSign,
  Languages,
  Compass,
  ArrowLeft,
  Hotel,
  Briefcase,
  Share2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const res = await destinationsAPI.getById(id);
        if (res.data?.success) {
          const dest = res.data.data;
          setDestination(dest);
          setActiveImage(dest.imageUrl);
        }
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800">Destination Not Found</h2>
        <p className="text-slate-500 mt-2 mb-6">The destination you are looking for does not exist or has been removed.</p>
        <Link to="/destinations" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold">
          Back to Destinations
        </Link>
      </div>
    );
  }

  const gallery = [destination.imageUrl, ...(destination.galleryUrls || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button & share */}
      <div className="flex items-center justify-between">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Destinations
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Destination
        </button>
      </div>

      {/* Hero Visual Banner & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main active image */}
        <div className="lg:col-span-2 relative h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-soft bg-slate-100 border border-slate-100">
          <img
            src={activeImage}
            alt={destination.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
                <MapPin className="w-3.5 h-3.5 text-accent-400" />
                {destination.country} • {destination.continent}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{destination.name}</h1>
          </div>
        </div>

        {/* Gallery Thumbnails & Quick Info Card */}
        <div className="flex flex-col justify-between space-y-4">
          {/* Thumbnails */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Photo Gallery
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Travel Essentials
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Best Time to Visit</span>
                  <span>{destination.bestTimeToVisit || 'Spring through Autumn'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Currency</span>
                  <span>{destination.currency || 'Local Currency / USD'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Language</span>
                  <span>{destination.language || 'Official & English widely spoken'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">Average Trip Estimate</span>
              <span className="text-2xl font-black text-primary-600">
                ${parseFloat(destination.priceEstimate).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-soft">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">
          About {destination.name}
        </h2>
        <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
          {destination.description}
        </p>
      </div>

      {/* Related Hotels in this Destination */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Hotel className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Hotels & Resorts in {destination.name}
            </h2>
          </div>
          <Link
            to={`/hotels?destinationId=${destination.id}`}
            className="text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            View All ({destination.hotels?.length || 0})
          </Link>
        </div>

        {destination.hotels && destination.hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={{ ...hotel, destination }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-100">
            No hotels currently listed for this destination.
          </p>
        )}
      </div>

      {/* Related Packages in this Destination */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Curated Travel Packages in {destination.name}
            </h2>
          </div>
          <Link
            to={`/packages?destinationId=${destination.id}`}
            className="text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            View All ({destination.packages?.length || 0})
          </Link>
        </div>

        {destination.packages && destination.packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.packages.map((pkg) => (
              <PackageCard key={pkg.id} travelPackage={{ ...pkg, destination }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-100">
            No travel packages currently scheduled for this destination.
          </p>
        )}
      </div>
    </div>
  );
};

export default DestinationDetail;
