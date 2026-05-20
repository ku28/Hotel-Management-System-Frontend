import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-950 font-[Inter,system-ui,sans-serif] flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-100">
              Hotel Management System<span className="text-blue-500">.</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/hotels" className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors">Hotels</Link>
              {isAuthenticated && !isAdmin() && (
                <Link to="/reservations" className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors">My Reservations</Link>
              )}
              {isAuthenticated && isAdmin() && (
                <Link to="/admin" className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors">Dashboard</Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop auth buttons */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-400">{user?.fullName}</span>
                    <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-gray-100 cursor-pointer transition-colors">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors">Login</Link>
                    <Link to="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign Up</Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4 space-y-3">
              <Link to="/hotels" className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Hotels</Link>
              {isAuthenticated && !isAdmin() && (
                <Link to="/reservations" className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">My Reservations</Link>
              )}
              {isAuthenticated && isAdmin() && (
                <Link to="/admin" className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Dashboard</Link>
              )}
              <div className="border-t border-gray-800 pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="px-2 text-sm text-gray-400">{user?.fullName}</p>
                    <button onClick={handleLogout} className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">Logout</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Login</Link>
                    <Link to="/signup" className="block px-2 py-2 text-sm font-medium text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 Hotel Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
