import { useState, useEffect } from 'react';
import { reservationService } from '../services/hotelApi';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ checkInDate: '', checkOutDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getAll(page, 15);
      setReservations(res.data?.data?.content || []);
      setTotalPages(res.data?.data?.totalPages || 0);
      setTotalElements(res.data?.data?.totalElements || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleEdit = (r) => {
    setEditingId(r.reservationId);
    setEditForm({ checkInDate: r.checkInDate, checkOutDate: r.checkOutDate });
  };

  const handleSave = async (r) => {
    setSaving(true);
    try {
      await reservationService.update(r.reservationId, { ...r, checkInDate: editForm.checkInDate, checkOutDate: editForm.checkOutDate });
      setEditingId(null);
      fetchData();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    try { await reservationService.delete(id); fetchData(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  const inputClass = "px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">All Reservations</h1>
          <p className="text-gray-400 text-sm mt-1">{totalElements} total reservations</p>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/80">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Guest</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Room</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Check-in</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Check-out</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.reservationId} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-200">#{r.reservationId}</td>
                <td className="py-3 px-4 text-gray-200">{r.guestName}</td>
                <td className="py-3 px-4 text-gray-400">{r.guestEmail}</td>
                <td className="py-3 px-4 text-gray-400">{r.guestPhone}</td>
                <td className="py-3 px-4 text-gray-300">{r.roomNumber}</td>
                <td className="py-3 px-4">
                  {editingId === r.reservationId ? (
                    <input type="date" value={editForm.checkInDate} onChange={e => setEditForm({ ...editForm, checkInDate: e.target.value })} className={inputClass} />
                  ) : (
                    <span className="text-gray-300">{r.checkInDate}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === r.reservationId ? (
                    <input type="date" value={editForm.checkOutDate} onChange={e => setEditForm({ ...editForm, checkOutDate: e.target.value })} className={inputClass} />
                  ) : (
                    <span className="text-gray-300">{r.checkOutDate}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === r.reservationId ? (
                      <>
                        <button onClick={() => handleSave(r)} disabled={saving} className="px-3 py-1.5 bg-green-600/20 text-green-400 text-xs font-medium rounded-lg hover:bg-green-600/30 cursor-pointer">{saving ? '...' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-medium rounded-lg cursor-pointer">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-yellow-400 cursor-pointer" title="Edit dates">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(r.reservationId)} className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 cursor-pointer">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 cursor-pointer">Next</button>
        </div>
      )}
    </div>
  );
}
