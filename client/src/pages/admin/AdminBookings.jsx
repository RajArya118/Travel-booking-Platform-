import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import Modal from '../../components/Modal';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getAllAdmin({ limit: 100 });
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load bookings ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await bookingsAPI.updateStatus(id, { status: newStatus });
      if (res.data?.success) {
        showToast(`Booking status updated to ${newStatus}`, 'success');
        fetchBookings();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update booking status.', 'error');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Bookings & Reservations Ledger</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audit customer reservations, monitor payment states, and update fulfillment statuses.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, name, or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses ({bookings.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-soft">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Item Reserved</th>
                  <th className="py-3.5 px-4">Travel Dates</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <p className="font-bold">{b.user?.name || 'Guest Traveler'}</p>
                      <p className="text-[10px] text-slate-400">{b.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <p className="font-semibold truncate max-w-xs">
                        {b.bookingType === 'HOTEL'
                          ? b.hotel?.name || 'Hotel Room'
                          : b.travelPackage?.title || 'Package'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {b.travelerCount} Guests • {b.bookingType}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(b.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ${parseFloat(b.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-950 text-blue-400 border-blue-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="View Full Booking Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Booking Audit - ${selectedBooking?.bookingReference}`}
        maxWidth="max-w-xl"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p><strong>Customer:</strong> {selectedBooking.user?.name} ({selectedBooking.user?.email})</p>
              <p><strong>Booking Type:</strong> {selectedBooking.bookingType}</p>
              <p>
                <strong>Experience:</strong>{' '}
                {selectedBooking.bookingType === 'HOTEL'
                  ? selectedBooking.hotel?.name
                  : selectedBooking.travelPackage?.title}
              </p>
              <p><strong>Travelers:</strong> {selectedBooking.travelerCount}</p>
              {selectedBooking.specialRequests && (
                <p><strong>Special Requests:</strong> {selectedBooking.specialRequests}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block font-medium">Subtotal</span>
                <span className="font-bold text-slate-800">${parseFloat(selectedBooking.subtotal).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Billed</span>
                <span className="font-black text-primary-600 text-sm">
                  ${parseFloat(selectedBooking.totalAmount).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment State</span>
                <span className="font-bold text-emerald-600">{selectedBooking.paymentStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Reference</span>
                <span className="font-mono text-slate-600">{selectedBooking.paymentReference || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Link
                to={`/booking-confirmation/${selectedBooking.id}`}
                target="_blank"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Public Receipt
              </Link>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminBookings;
