import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const PackageCard = ({ travelPackage }) => {
  const {
    id,
    title,
    durationDays,
    durationNights,
    pricePerPerson,
    category,
    imageUrl,
    destination,
    includedServices = [],
  } = travelPackage;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image container */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 bg-accent-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">
            {category}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold rounded-full shadow-sm">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            {durationDays}D / {durationNights}N
          </span>
        </div>

        {/* Location badge on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="inline-flex items-center text-white/90 text-xs font-medium drop-shadow mb-1">
            <MapPin className="w-3.5 h-3.5 text-accent-400 mr-1" />
            {destination?.name}, {destination?.country}
          </div>
          <h3 className="text-xl font-bold text-white drop-shadow line-clamp-1">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Included services highlight */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Package Highlights
          </span>
          {Array.isArray(includedServices) && includedServices.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center text-xs text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-slate-400 block font-medium">All-Inclusive</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary-600">
                ${parseFloat(pricePerPerson).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ person</span>
            </div>
          </div>

          <Link
            to={`/packages/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200"
          >
            View Itinerary
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
