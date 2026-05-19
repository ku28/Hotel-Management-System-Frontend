import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { path: '/admin/hotels', label: 'Hotels & Amenities', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { path: '/admin/rooms', label: 'Rooms & Amenities', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
  { path: '/admin/booking', label: 'Book for User', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
  { path: '/admin/reservations', label: 'All Reservations', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  { path: '/admin/reviews', label: 'Reviews & Ratings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
];

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { if (!isAuthenticated || !isAdmin()) navigate('/login'); }, [isAuthenticated]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-950 flex font-[Inter,system-ui,sans-serif]">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 text-white flex flex-col min-h-screen fixed">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-tight">Hotel Management System<span className="text-blue-400">.</span> Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{user?.fullName?.charAt(0) || 'A'}</div>
            <div><p className="text-sm font-medium">{user?.fullName}</p><p className="text-xs text-gray-400">Admin</p></div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8"><Outlet /></main>
    </div>
  );
}
