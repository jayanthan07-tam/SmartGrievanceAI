import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  initialMode?: 'login' | 'register';
}

function LoginPage({
  role, title, subtitle, icon, gradient,
  demoEmail, demoPassword, demoHint, initialMode = 'login',
}: LoginPageProps) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mode: login or register (only available for citizen role)
  const [mode, setMode] = useState<'login' | 'register'>(role === 'citizen' ? initialMode : 'login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state (for citizens)
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dashboardPaths: Record<UserRole, string> = {
    citizen: '/citizen/dashboard',
    officer: '/officer/dashboard',
    district_admin: '/district-admin/dashboard',
    super_admin: '/admin/dashboard',
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError(t('Please enter your email and password.'));
      return;
    }

    setLoading(true);
    try {
      const result = await login(cleanEmail, password, role);
      if (result.error) {
        setError(t(result.error));
        setLoading(false);
      } else {
        navigate(dashboardPaths[role]);
      }
    } catch (err) {
      console.error('[SmartGrievance AI] Login error:', err);
      setError(t('An unexpected login error occurred. Please try again.'));
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !regPassword) {
      setError(t('Please fill in all required fields.'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t('Please enter a valid email address.'));
      return;
    }

    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setError(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    if (regPassword.length < 6) {
      setError(t('Password must be at least 6 characters long.'));
      return;
    }

    if (regPassword !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: regPassword,
        preferred_language: preferredLang,
      });

      if (result.error) {
        setError(t(result.error));
        setLoading(false);
      } else {
        setSuccess(t('Account created successfully! Logging you in...'));
        setTimeout(() => {
          navigate(dashboardPaths[role]);
        }, 800);
      }
    } catch (err) {
      console.error('[SmartGrievance AI] Account creation error:', err);
      setError(t('An error occurred during account creation. Please try again.'));
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSuccess('');
  };

  const otherPortals = [
    { role: 'citizen' as UserRole, label: 'Citizen', path: '/citizen/login', icon: '👤' },
    { role: 'officer' as UserRole, label: 'Department Officer', path: '/officer/login', icon: '🏛️' },
    { role: 'district_admin' as UserRole, label: 'District Admin', path: '/district-admin/login', icon: '📊' },
    { role: 'super_admin' as UserRole, label: 'Super Admin', path: '/admin/login', icon: '⚙️' },
  ].filter(p => p.role !== role);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col">
      {/* Demo mode banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center">
        <p className="text-xs text-amber-700">
          ⚗️ <strong>{t('Demo Mode:')}</strong> {mode === 'register' ? t('Demo Mode: Account is created in local mock database. You will be automatically signed in.') : t('Use the prefilled credentials below. No real data is used.')}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
            {t('← Back to Home')}
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
                  <h1 className="text-xl font-bold">
                    {mode === 'register' && role === 'citizen' ? t('Citizen Account Registration') : t(title)}
                  </h1>
                  <p className="text-sm opacity-80">
                    {mode === 'register' && role === 'citizen' ? t('Create an account to submit and track grievances') : t(subtitle)}
                  </p>
                </div>
              </div>

              {mode === 'login' ? (
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-sm">
                  <p className="font-semibold flex items-center gap-1.5">⚗️ {t('Demo Credentials')}</p>
                  <p className="opacity-90 mt-1 font-mono text-xs">{demoHint}</p>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-sm">
                  <p className="font-semibold flex items-center gap-1.5">📝 {t('Instant Demo Registration')}</p>
                  <p className="opacity-90 mt-1 text-xs">{t('Fill details to create your citizen profile in the demo sandbox.')}</p>
                </div>
              )}
            </div>

            {/* Segmented Mode Selector for Citizens */}
            {role === 'citizen' && (
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                    mode === 'login'
                      ? 'border-[#0037b0] text-[#0037b0] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  🔑 {t('Sign In')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                    mode === 'register'
                      ? 'border-[#0037b0] text-[#0037b0] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📝 {t('Create Account')}
                </button>
              </div>
            )}

            {/* Form Container */}
            <div className="p-8">
              {error && (
                <Alert type="error" className="mb-6" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert type="success" className="mb-6">
                  {success}
                </Alert>
              )}

              {/* Login Form */}
              {mode === 'login' ? (
                <>
                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                    <Input
                      label={t('Email Address')}
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('Enter your email')}
                      required
                      autoComplete="email"
                      id={`${role}-email`}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`${role}-password`} className="text-sm font-semibold text-gray-700">
                        {t('Password')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id={`${role}-password`}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={t('Enter your password')}
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
                      {t('Login')} — {t(title)}
                    </Button>
                  </form>

                  {/* Quick fill */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">{t('Quick Demo Fill:')}</p>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="w-full text-left text-xs font-mono bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      📧 {demoEmail} / 🔒 {demoPassword}
                    </button>
                  </div>

                  {/* Citizen toggle link */}
                  {role === 'citizen' && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      {t('New citizen?')}{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                        className="text-[#0037b0] font-semibold hover:underline cursor-pointer"
                      >
                        {t('Create an Account')}
                      </button>
                    </p>
                  )}
                </>
              ) : (
                /* Registration Form for Citizens */
                <>
                  <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                    <Input
                      label={t('Full Name')}
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('Enter your full name')}
                      required
                      id="reg-name"
                    />

                    <Input
                      label={t('Email Address')}
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder={t('Enter your email')}
                      required
                      autoComplete="email"
                      id="reg-email"
                    />

                    <Input
                      label={t('Phone Number')}
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t('Enter 10-digit mobile number')}
                      required
                      id="reg-phone"
                    />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-lang" className="text-sm font-semibold text-gray-700">
                        {t('Preferred Language')}
                      </label>
                      <select
                        id="reg-lang"
                        value={preferredLang}
                        onChange={e => setPreferredLang(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all bg-white"
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">
                        {t('Password')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder={t('Password must be at least 6 characters long.')}
                          required
                          autoComplete="new-password"
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

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-confirm-password" className="text-sm font-semibold text-gray-700">
                        {t('Confirm Password')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reg-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder={t('Re-enter your password')}
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0] transition-all"
                      />
                    </div>

                    <Button type="submit" loading={loading} className="w-full py-3 text-base mt-2" size="lg">
                      {t('Create Citizen Account')}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    {t('Already have an account?')}{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                      className="text-[#0037b0] font-semibold hover:underline cursor-pointer"
                    >
                      {t('Sign In')}
                    </button>
                  </p>
                </>
              )}

              {/* Other portals */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3 text-center">{t('Other Login Portals')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {otherPortals.map(p => (
                    <Link
                      key={p.path}
                      to={p.path}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-center"
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs text-gray-500">{t(p.label)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            {t('SmartGrievance AI is a hackathon demonstration project and is not affiliated with any government department.')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Four Portal Login Pages ──────────────────────────────────────────────────

export function CitizenLogin({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
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
    initialMode={initialMode}
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
