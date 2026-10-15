import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { Button, Input, Alert } from '../../components/ui';

interface LoginPageProps {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: string;
  color?: string;
  gradient: string;
  demoEmail: string;
  demoPassword: string;
  demoHint: string;
}

function LoginPage({
  role, title, subtitle, icon, gradient,
  demoEmail, demoPassword, demoHint,
}: LoginPageProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dashboardPaths: Record<UserRole, string> = {
    citizen: '/citizen/dashboard',
    officer: '/officer/dashboard',
    district_admin: '/district-admin/dashboard',
    super_admin: '/admin/dashboard',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(dashboardPaths[role]);
    }
  };

  const fillDemo = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const otherPortals = [
    { role: 'citizen' as UserRole, label: 'Citizen', path: '/citizen/login', icon: '👤' },
    { role: 'officer' as UserRole, label: 'Officer', path: '/officer/login', icon: '🏛️' },
    { role: 'district_admin' as UserRole, label: 'District Admin', path: '/district-admin/login', icon: '📊' },
    { role: 'super_admin' as UserRole, label: 'Super Admin', path: '/admin/login', icon: '⚙️' },
  ].filter(p => p.role !== role);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">
      {/* Demo mode banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center">
        <p className="text-xs text-amber-700">
          ⚗️ <strong>Demo Mode:</strong> Use the prefilled credentials below. No real data is used.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
            ← Back to Home
          </Link>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${gradient} p-8 text-white`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
                  {icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{title}</h1>
                  <p className="text-sm opacity-80">{subtitle}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-sm">
                <p className="font-semibold flex items-center gap-1.5">⚗️ Demo Credentials</p>
                <p className="opacity-90 mt-1 font-mono text-xs">{demoHint}</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <Alert type="error" className="mb-6" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  id={`${role}-email`}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${role}-password`} className="text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`${role}-password`}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full py-3 text-base" size="lg">
                  Sign In to {title.replace(' Login', '')}
                </Button>
              </form>

              {/* Quick fill */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-medium">Quick Demo Fill:</p>
                <button
                  onClick={fillDemo}
                  className="w-full text-left text-xs font-mono bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  📧 {demoEmail} / 🔒 {demoPassword}
                </button>
              </div>

              {/* Citizen registration */}
              {role === 'citizen' && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  New citizen?{' '}
                  <Link to="/citizen/register" className="text-[#0037b0] font-semibold hover:underline">
                    Create an Account
                  </Link>
                </p>
              )}

              {/* Other portals */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3 text-center">Other Login Portals</p>
                <div className="grid grid-cols-3 gap-2">
                  {otherPortals.map(p => (
                    <Link
                      key={p.path}
                      to={p.path}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-center"
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs text-gray-500">{p.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            SmartGrievance AI is a hackathon demonstration project not affiliated with any government department.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Four Portal Login Pages ──────────────────────────────────────────────────

export function CitizenLogin() {
  return <LoginPage
    role="citizen"
    title="Citizen Login"
    subtitle="Register and track your grievances"
    icon="👤"
    color="blue"
    gradient="from-[#0037b0] to-[#1d4ed8]"
    demoEmail="citizen@demo.com"
    demoPassword="demo123"
    demoHint="Email: citizen@demo.com | Password: demo123"
  />;
}

export function OfficerLogin() {
  return <LoginPage
    role="officer"
    title="Department Officer Login"
    subtitle="Review and action citizen complaints"
    icon="🏛️"
    color="teal"
    gradient="from-[#006a61] to-[#0d9488]"
    demoEmail="officer@demo.com"
    demoPassword="demo123"
    demoHint="Email: officer@demo.com | Password: demo123"
  />;
}

export function DistrictAdminLogin() {
  return <LoginPage
    role="district_admin"
    title="District Admin Login"
    subtitle="Monitor district-wide complaint analytics"
    icon="📊"
    color="purple"
    gradient="from-[#6d28d9] to-[#8b5cf6]"
    demoEmail="districtadmin@demo.com"
    demoPassword="demo123"
    demoHint="Email: districtadmin@demo.com | Password: demo123"
  />;
}

export function SuperAdminLogin() {
  return <LoginPage
    role="super_admin"
    title="Super Admin Login"
    subtitle="System-wide management and configuration"
    icon="⚙️"
    color="red"
    gradient="from-[#991b1b] to-[#dc2626]"
    demoEmail="admin@demo.com"
    demoPassword="demo123"
    demoHint="Email: admin@demo.com | Password: demo123"
  />;
}
