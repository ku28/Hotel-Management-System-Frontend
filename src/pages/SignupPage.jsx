import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/hotelApi';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/hotels', { replace: true });
  }, [isAuthenticated]);

  const validatePassword = (password) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!alphanumericRegex.test(password)) {
      return 'Password can only contain letters and numbers (alphanumeric)';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return '';
    if (!/^\d*$/.test(phone)) return 'Phone number must contain only digits';
    if (phone.length !== 10) return 'Phone number must be exactly 10 digits';
    return '';
  };

  const handlePasswordChange = (value) => {
    setForm({ ...form, password: value });
    if (value) {
      setPasswordError(validatePassword(value));
    } else {
      setPasswordError('');
    }
  };

  const handlePhoneChange = (value) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: numericValue });
    if (numericValue) {
      setPhoneError(validatePhone(numericValue));
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);

    const pwError = validatePassword(form.password);
    if (pwError) {
      setPasswordError(pwError);
      setLoading(false);
      return;
    }

    if (form.phone) {
      const phError = validatePhone(form.phone);
      if (phError) {
        setPhoneError(phError);
        setLoading(false);
        return;
      }
    }

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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={e => handlePasswordChange(e.target.value)}
                className={`${inputClass} pr-12 ${passwordError ? '!border-red-500/50 !ring-red-500/30' : ''}`}
                placeholder="Letters and numbers only"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {passwordError && <p className="mt-1.5 text-xs text-red-400">{passwordError}</p>}
            {!passwordError && form.password && <p className="mt-1.5 text-xs text-green-400">✓ Valid password</p>}
            <p className="mt-1 text-xs text-gray-500">Only letters (a-z, A-Z) and numbers (0-9) allowed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => handlePhoneChange(e.target.value)}
              className={`${inputClass} ${phoneError ? '!border-red-500/50 !ring-red-500/30' : ''}`}
              placeholder="10-digit phone number"
              maxLength={10}
              inputMode="numeric"
              pattern="\d{10}"
            />
            {phoneError && <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>}
            {!phoneError && form.phone && form.phone.length === 10 && <p className="mt-1.5 text-xs text-green-400">✓ Valid phone number</p>}
            <p className="mt-1 text-xs text-gray-500">Must be exactly 10 digits</p>
          </div>
          <button type="submit" disabled={loading || !!passwordError || !!phoneError} className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">
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
