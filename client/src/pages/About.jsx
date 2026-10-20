import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, Award, Users, Globe2, Sparkles, ArrowRight } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Radical Transparency',
      desc: 'No hidden taxes, surprise checkout fees, or inflated currency exchange rates. All prices verified directly on server.',
    },
    {
      icon: Globe2,
      title: 'Authentic Local Partnerships',
      desc: 'We collaborate directly with licensed indigenous guides, boutique hoteliers, and sustainable eco-resorts.',
    },
    {
      icon: Award,
      title: 'Curated Excellence',
      desc: 'Every listed property undergoes a multi-point evaluation for hygiene, comfort, and service excellence.',
    },
    {
      icon: Heart,
      title: 'Customer-First Care',
      desc: 'From round-the-clock emergency support to self-service cancellation, your journey is our highest priority.',
    },
  ];

  const team = [
    {
      name: 'Elena Vance',
      role: 'Chief Executive Officer & Founder',
      bio: 'Former global hospitality director with 15+ years orchestrating ultra-luxury travel expeditions.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Julian Sterling',
      role: 'Head of Destination Curation',
      bio: 'Renowned travel journalist and photographer who has mapped uncharted routes across 65+ countries.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Amara Okafor',
      role: 'Director of Guest Experience',
      bio: 'Concierge Clefs d’Or member dedicated to delivering flawless personalized itineraries for every traveler.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-accent-400 mb-4">
            <Sparkles className="w-4 h-4" /> The TravelAI Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Redefining Luxury Travel for the Modern World
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Founded with the conviction that travel should be both profoundly restorative and seamlessly intuitive.
            We blend boutique hospitality curation with modern engineering.
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '15,000+', label: 'Happy Travelers Hosted' },
            { value: '65+', label: 'Iconic Global Destinations' },
            { value: '99.4%', label: 'Positive Experience Rating' },
            { value: '24/7', label: 'On-Ground Concierge Support' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
              <span className="text-3xl sm:text-4xl font-black text-primary-600 block">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            Our Principles
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
            Built on Uncompromising Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{val.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            Leadership
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
            Meet the Travel Designers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Seasoned explorers, architects, and concierges curating journeys of a lifetime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft text-center p-6 space-y-4"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-slate-100"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
                <p className="text-xs font-bold text-primary-600">{member.role}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl">
          <h2 className="text-3xl font-black">Begin Planning Your Next Chapter</h2>
          <p className="text-white/90 text-sm max-w-md mx-auto">
            Browse our curated travel packages and handpicked boutique properties.
          </p>
          <div className="pt-2">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 hover:bg-slate-50 rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              View Available Expeditions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
