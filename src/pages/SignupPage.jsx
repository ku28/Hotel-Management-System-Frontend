import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/hotelApi';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/hotels', { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authService.register(form);
      const data = res.data?.data;
      login({ fullName: data.fullName, email: data.email, role: data.role }, data.token);
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Create Account</h1>
          <p className="mt-2 text-sm text-gray-400">Start booking your perfect stay</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label><input type="text" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label><input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} /></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
