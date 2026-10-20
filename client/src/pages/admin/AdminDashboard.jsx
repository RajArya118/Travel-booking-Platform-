import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, bookingsAPI } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import {
  MapPin,
  Hotel,
  Briefcase,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  Shield,
  Eye,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminAPI.getStats(),
          bookingsAPI.getAllAdmin({ limit: 5 }),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (bookingsRes.data?.success) {
          setRecentBookings(bookingsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metricCards = [
    {
      title: 'Total Destinations',
      value: stats?.totalDestinations || 0,
      icon: MapPin,
      color: 'text-sky-400 bg-sky-950/50 border-sky-800/60',
      link: '/admin/destinations',
    },
    {
      title: 'Hotels & Resorts',
      value: stats?.totalHotels || 0,
      icon: Hotel,
      color: 'text-teal-400 bg-teal-950/50 border-teal-800/60',
      link: '/admin/hotels',
    },
    {
      title: 'Travel Packages',
      value: stats?.totalPackages || 0,
      icon: Briefcase,
      color: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
      link: '/admin/packages',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60',
      link: '/admin/bookings',
    },
    {
      title: 'Platform Gross Revenue',
      value: `$${parseFloat(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-indigo-400 bg-indigo-950/50 border-indigo-800/60',
      link: '/admin/bookings',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            Executive Overview
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            TravelAI Operations Hub
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time platform metrics, booking ledger, and catalog controls.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/destinations"
            className="px-3.5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Destination
          </Link>
          <Link
            to="/admin/hotels"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> Hotel
          </Link>
          <Link
            to="/admin/packages"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> Package
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((m, idx) => (
          <Link
            key={idx}
            to={m.link}
            className={`p-5 rounded-2xl border transition-all hover:scale-102 flex flex-col justify-between ${m.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold opacity-80">{m.title}</span>
              <m.icon className="w-5 h-5 opacity-90" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight">{m.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Customer Bookings</h2>
            <p className="text-xs text-slate-400">Latest reservation orders received across the network</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : recentBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No bookings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Traveler</th>
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Dates</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-primary-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 text-slate-200">
                      <p className="font-bold">{b.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-slate-400">{b.user?.email}</p>
                    </td>
                    <td className="py-3 text-slate-300">
                      {b.bookingType === 'HOTEL'
                        ? b.hotel?.name || 'Hotel Room'
                        : b.travelPackage?.title || 'Package'}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(b.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 font-bold text-white">
                      ${parseFloat(b.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/booking-confirmation/${b.id}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
