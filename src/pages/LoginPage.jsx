import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/hotelApi';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state (set by BookingPage or other protected pages)
  const redirectTo = location.state?.from || null;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo || (isAdmin() ? '/admin' : '/hotels'), { replace: true });
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(form);
      const data = res.data?.data;
      login({ fullName: data.fullName, email: data.email, role: data.role }, data.token);
      // If there's a redirect path (e.g. from booking), go there; otherwise default
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(data.role === 'ROLE_ADMIN' ? '/admin' : '/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
          {redirectTo && (
            <p className="mt-2 text-sm text-blue-400">Please sign in to continue your booking</p>
          )}
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
