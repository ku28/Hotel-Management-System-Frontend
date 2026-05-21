import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReservationsPage from './pages/ReservationsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminHotels from './pages/AdminHotels';
import AdminRooms from './pages/AdminRooms';
import AdminBooking from './pages/AdminBooking';
import AdminReservations from './pages/AdminReservations';
import AdminReviews from './pages/AdminReviews';
import AdminUsers from './pages/AdminUsers';
import useAuthStore from './store/authStore';
import './index.css';

function DashboardRedirect() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  // Non-admin or unauthenticated: show a proper error page
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
        <p className="text-xl text-gray-400 mb-2">Access Denied</p>
        <p className="text-sm text-gray-500 mb-8">You do not have permission to access the admin dashboard.</p>
        <a href="/hotels" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">Browse Hotels</a>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-2">Page Not Found</p>
        <p className="text-sm text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/booking/:roomId" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="booking" element={<AdminBooking />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

