import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsAPI } from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  CalendarCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const MyBookings = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMyBookings();
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/my-bookings');
      return;
    }
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      const res = await bookingsAPI.cancel(selectedBookingToCancel.id);
      if (res.data?.success) {
        showToast('Reservation cancelled. Demo refund has been credited.', 'success');
        setCancelModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            Traveler Dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
            My Travel Bookings
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your active reservations, view digital receipts, or request cancellations.
          </p>
        </div>

        <Link
          to="/packages"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Book New Trip
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs font-bold">
        {[
          { key: 'ALL', label: `All Bookings (${bookings.length})` },
          { key: 'CONFIRMED', label: `Confirmed (${bookings.filter((b) => b.status === 'CONFIRMED').length})` },
          { key: 'COMPLETED', label: `Completed (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
          { key: 'CANCELLED', label: `Cancelled (${bookings.filter((b) => b.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-1 transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings in this category"
          description="You don't have any bookings matching this filter. Explore our travel packages to plan your next escape!"
          actionLabel="Explore Travel Packages"
          actionLink="/packages"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCompleted = b.status === 'COMPLETED';
            const isCancelled = b.status === 'CANCELLED';

            const checkIn = new Date(b.checkInDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const checkOut = new Date(b.checkOutDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const title =
              b.bookingType === 'HOTEL'
                ? b.hotel?.name || 'Luxury Resort'
                : b.travelPackage?.title || 'Travel Expedition';

            const sub =
              b.bookingType === 'HOTEL'
                ? `${b.hotel?.city || ''}, ${b.hotel?.country || ''} • ${b.roomType?.name || 'Standard Room'}`
                : `${b.travelPackage?.durationDays || ''} Days All-Inclusive`;

            const img =
              b.bookingType === 'HOTEL'
                ? b.hotel?.imageUrl
                : b.travelPackage?.imageUrl;

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-card-hover transition-all"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={img || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {b.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700'
                            : isCompleted
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        ● {b.status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                        {checkIn} - {checkOut}
                      </span>
                      <span>•</span>
                      <span>{b.travelerCount} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Total Amount</span>
                    <span className="text-xl font-black text-slate-800">
                      ${parseFloat(b.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Paid via {b.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/booking-confirmation/${b.id}`}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Receipt
                    </Link>

                    {isConfirmed && (
                      <button
                        onClick={() => handleOpenCancelModal(b)}
                        className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Booking Cancellation"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900">
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              Are you sure you want to cancel booking <strong>{selectedBookingToCancel?.bookingReference}</strong>?
              This action is permanent and will release your reserved dates.
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl space-y-1">
            <p><strong>Refund Amount:</strong> ${parseFloat(selectedBookingToCancel?.totalAmount || 0).toFixed(2)}</p>
            <p><strong>Refund Method:</strong> Demo Credit Card (Processed immediately)</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Keep My Booking
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
