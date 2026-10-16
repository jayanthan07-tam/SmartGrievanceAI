import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterGrievancePage from './pages/RegisterGrievancePage';
import TrackComplaintPage from './pages/TrackComplaintPage';
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import { CitizenLogin, OfficerLogin, DistrictAdminLogin, SuperAdminLogin } from './pages/auth/LoginPages';
import RoleDashboard from './pages/dashboards/RoleDashboard';
import DepartmentDirectoryPage from './pages/DepartmentDirectoryPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterGrievancePage />} />
              <Route path="/track" element={<TrackComplaintPage />} />
              <Route path="/citizen/login" element={<CitizenLogin initialMode="login" />} />
              <Route path="/citizen/register" element={<CitizenLogin initialMode="register" />} />
              <Route path="/signup" element={<CitizenLogin initialMode="register" />} />
              <Route path="/register-account" element={<CitizenLogin initialMode="register" />} />
              <Route path="/officer/login" element={<OfficerLogin />} />
              <Route path="/district-admin/login" element={<DistrictAdminLogin />} />
              <Route path="/admin/login" element={<SuperAdminLogin />} />
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/complaints" element={<CitizenDashboard />} />
              <Route path="/officer/dashboard" element={<RoleDashboard role="officer" />} />
              <Route path="/district-admin/dashboard" element={<RoleDashboard role="district_admin" />} />
              <Route path="/admin/dashboard" element={<RoleDashboard role="super_admin" />} />
              <Route path="/departments" element={<DepartmentDirectoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
