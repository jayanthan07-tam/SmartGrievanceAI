import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { complaintService } from '../services/complaintService';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Register Grievance', path: '/register' },
  { label: 'Track Grievance', path: '/track' },
  { label: 'Departments', path: '/departments' },
  { label: 'About', path: '/about' },
  { label: 'Help & Support', path: '/help' },
];

const LOGIN_PORTALS = [
  { label: 'Citizen Login', path: '/citizen/login', icon: '👤', color: 'text-blue-600' },
  { label: 'Department Officer', path: '/officer/login', icon: '🏛️', color: 'text-teal-600' },
  { label: 'District Admin', path: '/district-admin/login', icon: '📊', color: 'text-purple-600' },
  { label: 'Super Admin', path: '/admin/login', icon: '⚙️', color: 'text-red-600' },
];

const DASHBOARD_PATHS: Record<string, string> = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  district_admin: '/district-admin/dashboard',
  super_admin: '/admin/dashboard',
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const loginRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Unread notifications count
  const unreadCount = isAuthenticated && user
    ? complaintService.getNotifications(user.id).filter((n: { read_status: boolean }) => !n.read_status).length
    : 0;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const roleLabel: Record<string, string> = {
    citizen: 'Citizen',
    officer: 'Dept. Officer',
    district_admin: 'District Admin',
    super_admin: 'Super Admin',
  };

  return (
    <>
      {/* Top notice bar */}
      <div className="bg-gray-100 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span>⚗️</span>
            Hackathon Demo | Fictional AI data for evaluation purposes only
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">📞 24x7 Helpline: 1800-000-DEMO</span>
            <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-600">AI Engine v2.4</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0037b0] to-[#311fca] flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">SG</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0037b0] leading-tight tracking-tight">SmartGrievance AI</span>
                <span className="text-xs text-gray-400 hidden sm:block">Your Voice, Our Priority</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-0.5 flex-1 ml-6">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#0037b0] text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Language selector */}
              <div className="relative hidden sm:block" ref={undefined}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  🌐 {LANGUAGES.find(l => l.code === selectedLang)?.label.split(' ')[0]}
                  <span className="text-gray-400">▾</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl py-1 w-48 z-50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLang(lang.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedLang === lang.code ? 'text-[#0037b0] font-semibold' : 'text-gray-700'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Login dropdown (unauthenticated) or User menu (authenticated) */}
              {!isAuthenticated ? (
                <div className="relative" ref={loginRef}>
                  <button
                    onClick={() => setLoginOpen(!loginOpen)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0037b0] text-white text-sm font-semibold hover:bg-[#001f6b] transition-colors shadow-sm"
                  >
                    <span>🔑</span>
                    <span className="hidden sm:inline">Login</span>
                    <span className="text-blue-200">▾</span>
                  </button>
                  {loginOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl py-2 w-56 z-50 animate-fade-in">
                      <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Portal</p>
                      {LOGIN_PORTALS.map(portal => (
                        <Link
                          key={portal.path}
                          to={portal.path}
                          onClick={() => setLoginOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xl">{portal.icon}</span>
                          <span className={`text-sm font-medium ${portal.color}`}>{portal.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0037b0] to-[#311fca] flex items-center justify-center text-white text-xs font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-xs font-semibold text-gray-900 leading-tight">{user?.name.split(' ')[0]}</span>
                      <span className="text-xs text-gray-400">{roleLabel[user?.role || '']}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="relative bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl py-2 w-56 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                        <p className="text-xs text-[#0037b0] font-medium mt-0.5">{roleLabel[user?.role || '']}</p>
                      </div>
                      {user?.role && (
                        <Link
                          to={DASHBOARD_PATHS[user.role]}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          <span>📊</span> My Dashboard
                        </Link>
                      )}
                      {user?.role === 'citizen' && (
                        <>
                          <Link
                            to="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                          >
                            <span>📝</span> Register Complaint
                          </Link>
                          <Link
                            to="/citizen/complaints"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                          >
                            <span>📋</span> My Complaints {unreadCount > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                          </Link>
                        </>
                      )}
                      <hr className="border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                {mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-gray-200 bg-white py-4 px-4 animate-fade-in">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive(link.path)
                    ? 'bg-[#0037b0] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-200 my-3" />
            {!isAuthenticated && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Login Portals</p>
                {LOGIN_PORTALS.map(portal => (
                  <Link
                    key={portal.path}
                    to={portal.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg text-sm text-gray-700 mb-1"
                  >
                    {portal.icon} {portal.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
