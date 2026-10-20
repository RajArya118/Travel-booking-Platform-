import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Hotel,
  Briefcase,
  CalendarCheck,
  Users,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // RBAC enforcement: Only ADMIN role allowed
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-rose-100 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Administrator privileges are required to view this management console.
            Please sign in with an authorized administrator account.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/login"
              className="py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Log In as Administrator
            </Link>
            <Link
              to="/"
              className="py-2.5 px-4 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
            >
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Destinations', path: '/admin/destinations', icon: MapPin },
    { name: 'Hotels & Rooms', path: '/admin/hotels', icon: Hotel },
    { name: 'Travel Packages', path: '/admin/packages', icon: Briefcase },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-6 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block">
              Travel<span className="text-accent-400">AI</span>
            </span>
            <span className="text-[10px] font-bold text-primary-400 tracking-wider uppercase block">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer shortcuts */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Public Website
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              aria-label="Toggle admin sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-300 hidden sm:inline-block">
              TravelAI Administration Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm">
            <div className="w-64 bg-slate-950 p-6 flex flex-col h-full border-r border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-black text-white">TravelAI Admin</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" /> Public Website
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6 lg:p-8 flex-1 bg-slate-900 text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
