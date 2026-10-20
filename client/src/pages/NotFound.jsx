import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-soft space-y-6">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div>
          <span className="text-5xl font-black text-primary-600 tracking-tight block">404</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">
            Lost Off the Beaten Path
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
            The destination or route you are searching for does not exist on our global travel maps.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            to="/destinations"
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Explore Places
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
