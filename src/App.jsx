import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import './index.css';

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
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="booking" element={<AdminBooking />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
