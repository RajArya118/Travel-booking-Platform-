import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const DestinationCard = ({ destination }) => {
  const { id, name, country, imageUrl, priceEstimate, description } = destination;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image container with zoom effect */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-80" />
        
        {/* Country Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold rounded-full shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            {country}
          </span>
        </div>

        {/* Destination Name on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-sm">{name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Estimated from</span>
            <span className="text-lg font-bold text-primary-600">
              ${parseFloat(priceEstimate).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>

          <Link
            to={`/destinations/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200"
          >
            Explore
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
