import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hotelsAPI } from '../services/api';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import {
  Star,
  MapPin,
  CheckCircle2,
  Users,
  Bed,
  ArrowLeft,
  Calendar,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await hotelsAPI.getById(id);
        if (res.data?.success) {
          const h = res.data.data;
          setHotel(h);
          setActiveImage(h.imageUrl);
        }
      } catch (err) {
        console.error('Failed to load hotel details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Hotel link copied to clipboard!');
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800">Hotel Not Found</h2>
        <p className="text-slate-500 mt-2 mb-6">The hotel requested does not exist or has been removed.</p>
        <Link to="/hotels" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold">
          Back to Hotels
        </Link>
      </div>
    );
  }

  const gallery = [hotel.imageUrl, ...(hotel.galleryUrls || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button & share */}
      <div className="flex items-center justify-between">
        <Link
          to="/hotels"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Hotels
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Hotel
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {hotel.starRating}-Star Luxury Accommodation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            {hotel.name}
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
            {hotel.address}, {hotel.city}, {hotel.country || hotel.destination?.country}
          </p>
        </div>

        <div className="text-right flex flex-col md:items-end">
          <span className="text-xs text-slate-400 font-medium">Starting from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary-600">
              ${parseFloat(hotel.pricePerNight).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-400">/ night</span>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-soft bg-slate-100">
          <img
            src={activeImage}
            alt={hotel.name}
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

      {/* Description & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
            <h2 className="text-xl font-bold text-slate-800 mb-3">About The Property</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Included Property Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(hotel.amenities || []).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Fast Card */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft sticky top-28 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instant Reservation
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Best Rate Guaranteed
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select one of the verified room types below or click Reserve to choose customized dates.
            </p>

            <button
              onClick={() => navigate(`/book?type=HOTEL&hotelId=${hotel.id}`)}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book This Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Available Room Types */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Available Rooms & Suites
        </h2>

        {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotel.roomTypes.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{room.name}</h3>
                    <span className="text-lg font-black text-primary-600">
                      ${parseFloat(room.pricePerNight).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      <span className="text-xs text-slate-400 font-normal"> / night</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 my-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Bed className="w-4 h-4 text-primary-500" />
                      {room.bedType}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-4 h-4 text-primary-500" />
                      Up to {room.capacity} Guests
                    </span>
                  </div>

                  {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 mb-5">
                      {room.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-medium rounded-lg"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-emerald-600 font-semibold">
                    ✓ Available for booking
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        `/book?type=HOTEL&hotelId=${hotel.id}&roomTypeId=${room.id}`
                      )
                    }
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-100">
            No specific room types cataloged; standard rooms can be reserved directly.
          </p>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;
