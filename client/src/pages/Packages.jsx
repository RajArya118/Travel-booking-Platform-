import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PackageCard from '../components/PackageCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { packagesAPI, destinationsAPI } from '../services/api';
import { Search, MapPin, Tag, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialDestId = searchParams.get('destinationId') || '';

  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedDestination, setSelectedDestination] = useState(initialDestId);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await destinationsAPI.getAll({ limit: 100 });
        if (res.data?.success) setDestinations(res.data.data);
      } catch (err) {
        console.error('Failed to load destinations for filter:', err);
      }
    };
    fetchDestinations();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        search: searchTerm || undefined,
        destinationId: selectedDestination || undefined,
        category: category || undefined,
        sort: sortBy,
      };

      const res = await packagesAPI.getAll(params);
      if (res.data?.success) {
        setPackages(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCount(res.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load travel packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [page, selectedDestination, category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = {};
    if (searchTerm) newParams.search = searchTerm;
    if (category) newParams.category = category;
    if (selectedDestination) newParams.destinationId = selectedDestination;
    setSearchParams(newParams);
    fetchPackages();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDestination('');
    setCategory('');
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
          All-Inclusive Journeys
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-1">
          Curated Travel Packages
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Immersive guided expeditions featuring boutique lodging, masterclasses, and certified private local guides.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expedition by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Destination */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDestination}
              onChange={(e) => {
                setSelectedDestination(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Cultural">Cultural Heritage</option>
              <option value="Adventure">Adventure & Safari</option>
              <option value="Romantic">Romantic Getaways</option>
              <option value="Luxury">Luxury & Gastronomy</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="popular">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_desc">Longest Duration</option>
            </select>
          </div>

          {(searchTerm || selectedDestination || category) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      {!loading && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {packages.length} of {totalCount} travel packages</span>
        </div>
      )}

      {/* Package Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          title="No travel packages found"
          description="Try selecting a different destination or category to see scheduled expeditions."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} travelPackage={pkg} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Packages;
