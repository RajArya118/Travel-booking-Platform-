import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Contact = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast('Your message has been dispatched to our concierge team!', 'success');
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  const faqs = [
    {
      q: 'How does TravelAI calculate booking totals?',
      a: 'All prices are computed securely on our server using real-time database snapshots. Rates include standard room/package charges, municipal tourism tax (10%), and our platform service fee (5%) with complete upfront visibility.',
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'You can cancel any confirmed booking directly from your "My Bookings" portal up to 48 hours prior to your travel check-in date. Refunds are processed immediately back to your original payment method.',
    },
    {
      q: 'Are flights included in travel packages?',
      a: 'Most curated packages focus on luxury lodging, high-speed regional rail, private boat transfers, and guided tours once you arrive at the destination. International airfare is typically excluded to give you freedom of flight selection.',
    },
    {
      q: 'Can I request customized meal plans or room preferences?',
      a: 'Yes! When completing your reservation in the Booking form, enter your requirements under "Special Requests". Our destination concierge will coordinate directly with the hotel or tour guide.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
          Concierge Support
        </span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
          Contact TravelAI
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Have an upcoming reservation question or custom itinerary inquiry? Our luxury travel team is available 24/7.
        </p>
      </div>

      {/* Contact Grid: Form + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Send Us an Inquiry</h2>
          <p className="text-slate-500 text-xs mb-6">
            Fill in the details below and an itinerary specialist will respond within 2 hours.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
              <span className="text-2xl">🎉</span>
              <h3 className="text-base font-bold">Message Received</h3>
              <p className="text-xs text-emerald-700">
                Thank you! Our concierge team has received your message and will reply via email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 text-xs font-bold text-emerald-800 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Inquiry Nature
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="General">General Question</option>
                  <option value="Booking">Active Booking Assistance</option>
                  <option value="Partnership">Hotel / Resort Partnership</option>
                  <option value="Feedback">Platform Feedback</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our destination experts assist you today?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Transmit Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft space-y-5">
            <h3 className="text-lg font-bold text-slate-800">Direct Contact</h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Headquarters</h4>
                  <p className="mt-0.5">742 Evergreen Promenade, Suite 400</p>
                  <p>San Francisco, CA 94107, USA</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">24/7 Telephone</h4>
                  <p className="mt-0.5">+1 (800) 555-TRVL (Toll Free)</p>
                  <p className="text-slate-400 text-[11px]">Available worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Email Direct</h4>
                  <p className="mt-0.5">concierge@travelai.com</p>
                  <p className="text-slate-400 text-[11px]">Average response: 45 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-soft space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-100 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-white">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Contact;
