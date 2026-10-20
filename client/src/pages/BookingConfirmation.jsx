import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Printer,
  Compass,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const res = await bookingsAPI.getById(id);
          if (res.data?.success) {
            setBooking(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load booking details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Retrieving your reservation confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800">Booking Record Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6">
          Could not find the requested reservation reference.
        </p>
        <Link to="/my-bookings" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold">
          View My Bookings
        </Link>
      </div>
    );
  }

  const checkInStr = new Date(booking.checkInDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const checkOutStr = new Date(booking.checkOutDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
          Booking Confirmed
        </span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          You're Ready To Travel!
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Your travel reservation has been verified and registered on the blockchain ledger.
          A confirmation receipt has been generated.
        </p>
      </div>

      {/* Confirmation Printable Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6 print:shadow-none print:border-none">
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Booking Reference</span>
            <span className="text-2xl font-mono font-black text-primary-600 tracking-wider">
              {booking.bookingReference}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              ● Status: {booking.status}
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Experience Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Reserved Itinerary
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            {booking.bookingType === 'HOTEL'
              ? `${booking.hotel?.name || 'Luxury Hotel'} ${booking.roomType ? `- ${booking.roomType.name}` : ''}`
              : booking.travelPackage?.title || 'Curated Travel Package'}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary-600" />
              {checkInStr} to {checkOutStr}
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary-600" />
              {booking.paymentMethod}
            </span>
          </div>
        </div>

        {/* Guest Details */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Guest Details
          </h4>
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Primary Guest:</strong> {booking.guestsDetails?.[0]?.fullName || booking.user?.name}</p>
            <p><strong>Contact Email:</strong> {booking.guestsDetails?.[0]?.email || booking.user?.email}</p>
            {booking.specialRequests && (
              <p className="text-slate-500 pt-1">
                <strong>Special Requests:</strong> {booking.specialRequests}
              </p>
            )}
          </div>
        </div>

        {/* Financial Breakdown Snapshot */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Base Subtotal</span>
            <span className="font-semibold text-slate-800">
              ${parseFloat(booking.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes & Tourism Dues (10%)</span>
            <span className="font-semibold text-slate-800">
              ${parseFloat(booking.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Platform Service Fee (5%)</span>
            <span className="font-semibold text-slate-800">
              ${parseFloat(booking.serviceFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-800">Total Paid</span>
            <span className="text-2xl font-black text-primary-600">
              ${parseFloat(booking.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF Receipt
        </button>

        <Link
          to="/my-bookings"
          className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <span>View in My Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/destinations"
          className="w-full sm:w-auto px-5 py-3 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors"
        >
          Explore More Destinations
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
