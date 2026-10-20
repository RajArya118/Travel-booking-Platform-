import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsAPI, hotelsAPI, packagesAPI } from '../services/api';
import {
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  MapPin,
  Lock,
} from 'lucide-react';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const bookingTypeParam = searchParams.get('type') || 'HOTEL'; // 'HOTEL' or 'PACKAGE'
  const hotelIdParam = searchParams.get('hotelId') || '';
  const roomTypeIdParam = searchParams.get('roomTypeId') || '';
  const packageIdParam = searchParams.get('packageId') || '';

  // Form states
  const [bookingType, setBookingType] = useState(bookingTypeParam);
  const [selectedHotelId, setSelectedHotelId] = useState(hotelIdParam);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(roomTypeIdParam);
  const [selectedPackageId, setSelectedPackageId] = useState(packageIdParam);

  // Default dates: check-in 14 days ahead, checkout 18 days ahead
  const defaultCheckIn = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const defaultCheckOut = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [travelerCount, setTravelerCount] = useState(2);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment mock fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Loaded catalogs
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Price breakdown from server
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load catalogs on initial mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [hRes, pRes] = await Promise.all([
          hotelsAPI.getAll({ limit: 100 }),
          packagesAPI.getAll({ limit: 100 }),
        ]);
        if (hRes.data?.success) setHotels(hRes.data.data);
        if (pRes.data?.success) setPackages(pRes.data.data);
      } catch (err) {
        console.error('Error fetching booking options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Update selected hotel details when selectedHotelId changes
  useEffect(() => {
    if (selectedHotelId) {
      const h = hotels.find((item) => item.id === selectedHotelId);
      setSelectedHotel(h || null);
      if (h && h.roomTypes && h.roomTypes.length > 0 && !selectedRoomTypeId) {
        setSelectedRoomTypeId(h.roomTypes[0].id);
      }
    } else {
      setSelectedHotel(null);
    }
  }, [selectedHotelId, hotels]);

  // If user details load, autofill
  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name || '');
      if (!guestEmail) setGuestEmail(user.email || '');
      if (!guestPhone) setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Request server-side pricing recalculation whenever selections change
  useEffect(() => {
    const fetchPricing = async () => {
      setErrorMessage('');
      if (bookingType === 'HOTEL' && !selectedHotelId) return;
      if (bookingType === 'PACKAGE' && !selectedPackageId) return;
      if (!checkInDate || !checkOutDate) return;

      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        setErrorMessage('Check-out date must be after check-in date.');
        setPriceBreakdown(null);
        return;
      }

      setCalculating(true);
      try {
        const payload = {
          bookingType,
          hotelId: bookingType === 'HOTEL' ? selectedHotelId : undefined,
          roomTypeId: bookingType === 'HOTEL' ? selectedRoomTypeId || undefined : undefined,
          packageId: bookingType === 'PACKAGE' ? selectedPackageId : undefined,
          checkInDate: new Date(checkInDate).toISOString(),
          checkOutDate: new Date(checkOutDate).toISOString(),
          travelerCount: parseInt(travelerCount, 10) || 1,
        };

        const res = await bookingsAPI.calculatePrice(payload);
        if (res.data?.success) {
          setPriceBreakdown(res.data.data);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Unable to calculate price for selected options.');
        setPriceBreakdown(null);
      } finally {
        setCalculating(false);
      }
    };

    fetchPricing();
  }, [bookingType, selectedHotelId, selectedRoomTypeId, selectedPackageId, checkInDate, checkOutDate, travelerCount]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      showToast('Please sign in or create an account to finalize your booking.', 'info');
      navigate('/login?redirect=/book');
      return;
    }

    if (!priceBreakdown) {
      setErrorMessage('Please select valid options to compute pricing before confirming.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingType,
        hotelId: bookingType === 'HOTEL' ? selectedHotelId : undefined,
        roomTypeId: bookingType === 'HOTEL' ? selectedRoomTypeId || undefined : undefined,
        packageId: bookingType === 'PACKAGE' ? selectedPackageId : undefined,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        travelerCount: parseInt(travelerCount, 10) || 1,
        guestsDetails: [
          {
            fullName: guestName,
            email: guestEmail,
            phone: guestPhone,
          },
        ],
        specialRequests: specialRequests || undefined,
        paymentMethod: 'Demo Visa •••• 4242',
      };

      const res = await bookingsAPI.create(payload);
      if (res.data?.success) {
        showToast('Booking successfully confirmed! Reference generated.', 'success');
        navigate(`/booking-confirmation/${res.data.data.id}`, {
          state: { booking: res.data.data },
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to complete booking reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
          Secure Reservation
        </span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
          Complete Your Travel Booking
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Server-validated rates, verified room inventory, and instant digital confirmation.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              You are booking as a guest. Please <strong>Sign In</strong> to attach this booking to your account.
            </span>
          </div>
          <Link
            to="/login?redirect=/book"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex-shrink-0 ml-4"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Booking Details & Guest Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Selection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-black flex items-center justify-center">
                1
              </span>
              Select Experience
            </h2>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setBookingType('HOTEL');
                  if (hotels.length > 0 && !selectedHotelId) {
                    setSelectedHotelId(hotels[0].id);
                  }
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  bookingType === 'HOTEL'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hotel & Resort
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingType('PACKAGE');
                  if (packages.length > 0 && !selectedPackageId) {
                    setSelectedPackageId(packages[0].id);
                  }
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  bookingType === 'PACKAGE'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Travel Package
              </button>
            </div>

            {/* Hotel specific selects */}
            {bookingType === 'HOTEL' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Hotel / Resort
                  </label>
                  <select
                    value={selectedHotelId}
                    onChange={(e) => {
                      setSelectedHotelId(e.target.value);
                      setSelectedRoomTypeId('');
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Choose a Luxury Hotel --</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city}, {h.country}) - from ${h.pricePerNight}/nt
                      </option>
                    ))}
                  </select>
                </div>

                {selectedHotel && selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Room / Suite Category
                    </label>
                    <select
                      value={selectedRoomTypeId}
                      onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {selectedHotel.roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} - ${rt.pricePerNight}/night ({rt.bedType}, max {rt.capacity} guests)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Package specific selects */}
            {bookingType === 'PACKAGE' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Travel Package
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Choose a Curated Package --</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.durationDays}D / {p.durationNights}N) - ${p.pricePerPerson}/person
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Travel Dates & Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Travelers / Guests
                </label>
                <select
                  value={travelerCount}
                  onChange={(e) => setTravelerCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>1 Traveler</option>
                  <option value={2}>2 Travelers</option>
                  <option value={3}>3 Travelers</option>
                  <option value={4}>4 Travelers</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Guest Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-black flex items-center justify-center">
                2
              </span>
              Primary Guest Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. traveler@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Special Requests / Dietary Needs (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Quiet room on higher floor, celebration package, or vegetarian dinner requirements..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Demo Payment Simulation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-black flex items-center justify-center">
                  3
                </span>
                Demo Payment Details
              </h2>
              <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Test Sandbox
              </span>
            </div>

            <p className="text-xs text-slate-400">
              * Simulated credit card form for testing full booking pipeline without live charges.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    CVC Code
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Server Price Calculation Summary (5 cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-5">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
              Price Breakdown & Summary
            </h3>

            {calculating ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent mx-auto" />
                <p>Verifying server rates & capacity...</p>
              </div>
            ) : priceBreakdown ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {priceBreakdown.itemTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {bookingType === 'HOTEL'
                      ? `${priceBreakdown.durationDays} Nights reservation`
                      : `${priceBreakdown.durationDays} Days All-Inclusive (${travelerCount} Travelers)`}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Base Subtotal</span>
                    <span className="font-bold text-slate-800">
                      ${parseFloat(priceBreakdown.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Estimated Taxes (10%)</span>
                    <span className="font-bold text-slate-800">
                      ${parseFloat(priceBreakdown.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Platform Service Fee (5%)</span>
                    <span className="font-bold text-slate-800">
                      ${parseFloat(priceBreakdown.serviceFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-800">Total Verified Price</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary-600 block">
                      ${parseFloat(priceBreakdown.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400">Guaranteed server calculation</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">
                Please complete your dates and selection above to preview pricing.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || calculating || !priceBreakdown}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 group"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Complete Booking</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 space-y-1 text-center pt-2">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL encrypted transaction
              </p>
              <p>Free cancellation up to 48 hours before check-in date.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
