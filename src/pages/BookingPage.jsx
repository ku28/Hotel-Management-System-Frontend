import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService, reservationService, paymentService } from '../services/hotelApi';
import useAuthStore from '../store/authStore';

export default function BookingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('PAY_ON_PREMISES');
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', checkInDate: '', checkOutDate: '' });
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const checkoutMinDate = form.checkInDate
    ? new Date(new Date(form.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login but pass current path so user comes back here after login
      navigate('/login', { state: { from: `/booking/${roomId}` } });
      return;
    }
    roomService.getById(roomId).then((res) => {
      setRoom(res.data?.data);
      setForm(f => ({ ...f, guestName: user?.fullName || '', guestEmail: user?.email || '' }));
    }).catch(() => setError('Room not found')).finally(() => setLoading(false));
  }, [roomId, isAuthenticated]);

  const totalNights = form.checkInDate && form.checkOutDate
    ? Math.max(1, Math.ceil((new Date(form.checkOutDate) - new Date(form.checkInDate)) / (1000 * 60 * 60 * 24))) : 0;
  const pricePerNight = Number(room?.roomType?.pricePerNight || 0);
  const totalPrice = totalNights * pricePerNight;

  const handleContinueToPayment = (e) => {
    e.preventDefault(); setError('');
    if (!form.checkInDate || !form.checkOutDate) { setError('Please select check-in and check-out dates'); return; }
    if (form.checkInDate < today) { setError('Check-in cannot be before today'); return; }
    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) { setError('Check-out must be after check-in'); return; }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(''); setSubmitting(true);
    try {
      const res = await reservationService.create({ ...form, roomId: parseInt(roomId) });
      const reservation = res.data?.data;
      if (reservation && room?.roomType) {
        await paymentService.create({ reservationId: reservation.reservationId, amount: totalPrice, paymentDate: today, paymentStatus: 'Pending', paymentMethod });
      }
      navigate('/reservations');
    } catch (err) { setError(err.response?.data?.message || 'Booking failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  const inputClass = "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>1</div>
          <span className="text-sm font-medium hidden sm:inline">Booking Details</span>
        </div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
          <span className="text-sm font-medium hidden sm:inline">Payment</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-100 mb-2">{step === 1 ? 'Book Your Stay' : 'Payment Instructions'}</h1>
      {room && <p className="text-gray-400 mb-8">Room {room.roomNumber} — {room.roomType?.typeName} — ₹{pricePerNight.toFixed(2)}/night</p>}
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleContinueToPayment} className="space-y-5">
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label><input type="text" required value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label><input type="email" required value={form.guestEmail} onChange={e => setForm({...form, guestEmail: e.target.value})} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label><input type="tel" required value={form.guestPhone} onChange={e => setForm({...form, guestPhone: e.target.value})} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Check-in</label><input type="date" required min={today} value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value, checkOutDate: e.target.value >= form.checkOutDate ? '' : form.checkOutDate})} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Check-out</label><input type="date" required min={checkoutMinDate} value={form.checkOutDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} className={inputClass} /></div>
          </div>
          {totalNights > 0 && (
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">₹{pricePerNight.toFixed(2)}/night × {totalNights} night{totalNights > 1 ? 's' : ''}</span>
                <span className="font-bold text-gray-100">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 cursor-pointer transition-colors">Continue to Payment</button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="font-semibold text-gray-100 text-sm mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Guest</span><span className="text-gray-200">{form.guestName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Dates</span><span className="text-gray-200">{form.checkInDate} → {form.checkOutDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-gray-200">{totalNights} night{totalNights > 1 ? 's' : ''}</span></div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="font-semibold text-gray-100">Total</span>
                <span className="font-bold text-gray-100 text-lg">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button type="button" onClick={() => setPaymentMethod('PAY_ON_PREMISES')}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'PAY_ON_PREMISES' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'PAY_ON_PREMISES' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="text-left flex-1"><p className="font-semibold text-gray-100">Pay on Premises</p><p className="text-sm text-gray-400 mt-0.5">No charges or pre-payment are required now. Pay the full amount at the hotel during check-in.</p></div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'PAY_ON_PREMISES' ? 'border-blue-500' : 'border-gray-600'}`}>
                {paymentMethod === 'PAY_ON_PREMISES' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex-1 py-3.5 bg-gray-800 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer transition-colors">Back</button>
            <button type="button" onClick={handleSubmit} disabled={submitting || !paymentMethod} className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">{submitting ? 'Processing...' : 'Confirm Booking'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
