import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const { id, name, city, country, imageUrl, starRating, pricePerNight, destination, amenities = [] } = hotel;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image container */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />

        {/* Star Rating Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-amber-600 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{starRating}.0 Stars</span>
        </div>

        {/* Location badge */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center text-white/90 text-xs font-medium drop-shadow">
          <MapPin className="w-3.5 h-3.5 text-accent-400 mr-1 flex-shrink-0" />
          <span className="truncate">{city}, {country || destination?.country}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
            {name}
          </h3>

          {/* Amenities preview */}
          {Array.isArray(amenities) && amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[11px] rounded-md font-medium">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-primary-600">
                ${parseFloat(pricePerNight).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ night</span>
            </div>
          </div>

          <Link
            to={`/hotels/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200"
          >
            View Rooms
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
