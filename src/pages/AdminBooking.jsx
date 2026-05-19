import { useState, useEffect } from 'react';
import { roomService, reservationService, paymentService } from '../services/hotelApi';

export default function AdminBooking() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PAY_ON_PREMISES');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', checkInDate: '', checkOutDate: '', roomId: '' });
  const today = new Date().toISOString().split('T')[0];
  const checkoutMinDate = form.checkInDate
    ? new Date(new Date(form.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

  useEffect(() => {
    roomService.getAll(0, 100).then((res) => {
      const allRooms = res.data?.data?.content || [];
      setRooms(allRooms.filter(r => r.isAvailable));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalNights = form.checkInDate && form.checkOutDate ? Math.max(1, Math.ceil((new Date(form.checkOutDate) - new Date(form.checkInDate)) / (1000 * 60 * 60 * 24))) : 0;
  const pricePerNight = Number(selectedRoom?.roomType?.pricePerNight || 0);
  const totalPrice = totalNights * pricePerNight;

  const handleRoomChange = (roomId) => { setForm({ ...form, roomId }); setSelectedRoom(rooms.find(r => r.roomId === parseInt(roomId)) || null); };

  const handleContinue = (e) => {
    e.preventDefault(); setError('');
    if (!form.roomId) { setError('Please select a room'); return; }
    if (!form.checkInDate || !form.checkOutDate) { setError('Please select dates'); return; }
    if (form.checkInDate < today) { setError('Check-in cannot be before today'); return; }
    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) { setError('Check-out must be after check-in'); return; }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(''); setSubmitting(true);
    try {
      const res = await reservationService.create({ ...form, roomId: parseInt(form.roomId) });
      const reservation = res.data?.data;
      if (reservation) {
        await paymentService.create({ reservationId: reservation.reservationId, amount: totalPrice, paymentDate: today, paymentStatus: 'Pending', paymentMethod });
      }
      setSuccess(`Booking #${reservation?.reservationId} created successfully!`);
      setStep(1); setForm({ guestName: '', guestEmail: '', guestPhone: '', checkInDate: '', checkOutDate: '', roomId: '' });
      setSelectedRoom(null); setPaymentMethod('PAY_ON_PREMISES');
    } catch (err) { setError(err.response?.data?.message || 'Booking failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Book for User</h1>
        <p className="text-gray-500 text-sm mt-1">Create a reservation on behalf of a guest</p>
      </div>
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-300 cursor-pointer">✕</button>
        </div>
      )}
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>1</div>
          <span className="text-sm font-medium">Details</span>
        </div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>
      {step === 1 && (
        <form onSubmit={handleContinue} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Guest Name</label><input type="text" required value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Guest Email</label><input type="email" required value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Guest Phone</label><input type="tel" required value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Room</label>
              <select required value={form.roomId} onChange={e => handleRoomChange(e.target.value)} className={inputClass}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.roomId} value={r.roomId}>Room {r.roomNumber} — {r.hotelName ? r.hotelName + ' — ' : ''}{r.roomType?.typeName} — ₹{r.roomType?.pricePerNight}/night</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Check-in</label><input type="date" required min={today} value={form.checkInDate} onChange={e => setForm({ ...form, checkInDate: e.target.value, checkOutDate: e.target.value >= form.checkOutDate ? '' : form.checkOutDate })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Check-out</label><input type="date" required min={checkoutMinDate} value={form.checkOutDate} onChange={e => setForm({ ...form, checkOutDate: e.target.value })} className={inputClass} /></div>
          </div>
          {totalNights > 0 && selectedRoom && (
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">₹{pricePerNight.toFixed(2)}/night × {totalNights} night{totalNights > 1 ? 's' : ''}</span>
                <span className="font-bold text-gray-100">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 cursor-pointer transition-colors">Continue to Payment</button>
        </form>
      )}
      {step === 2 && (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 space-y-5">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold text-gray-100 text-sm mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Guest</span><span className="text-gray-200">{form.guestName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-200">{form.guestEmail}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Room</span><span className="text-gray-200">{selectedRoom?.roomNumber} — {selectedRoom?.roomType?.typeName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Dates</span><span className="text-gray-200">{form.checkInDate} → {form.checkOutDate}</span></div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="font-semibold text-gray-100">Total</span>
                <span className="font-bold text-gray-100 text-lg">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button type="button" onClick={() => setPaymentMethod('PAY_ON_PREMISES')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'PAY_ON_PREMISES' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === 'PAY_ON_PREMISES' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div className="text-left"><p className="font-semibold text-gray-100 text-sm">Pay on Premises</p><p className="text-xs text-gray-500">No charges or pre-payment are required now. The guest pays at the hotel.</p></div>
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex-1 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer">Back</button>
            <button type="button" onClick={handleSubmit} disabled={submitting || !paymentMethod} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer">{submitting ? 'Creating...' : 'Create Booking'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
