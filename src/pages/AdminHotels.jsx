import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelService, amenityService, hotelAmenityService, roomService } from '../services/hotelApi';

export default function AdminHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [roomCounts, setRoomCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', description: '' });
  const [amenityForm, setAmenityForm] = useState({ name: '', description: '' });
  const [linkForm, setLinkForm] = useState({ hotelId: '', amenityId: '' });
  const [saving, setSaving] = useState(false);
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, aRes] = await Promise.all([
        hotelService.getAll(page, 10, ''),
        amenityService.getAll(0, 100),
      ]);
      const hotelList = hRes.data?.data?.content || [];
      setTotalPages(hRes.data?.data?.totalPages || 0);
      setAmenities(aRes.data?.data?.content || []);
      const counts = {};
      const enrichedHotels = await Promise.all(hotelList.map(async (h) => {
        try {
          const [rRes, amenityRes] = await Promise.all([
            roomService.getByHotel(h.hotelId, 0, 1),
            amenityService.getByHotel(h.hotelId),
          ]);
          counts[h.hotelId] = rRes.data?.data?.totalElements || 0;
          return { ...h, amenities: amenityRes.data?.data?.content || [] };
        } catch {
          counts[h.hotelId] = 0;
          return { ...h, amenities: [] };
        }
      }));
      setHotels(enrichedHotels);
      setRoomCounts(counts);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleViewRooms = async (hotel) => {
    if (expandedHotel === hotel.hotelId) { setExpandedHotel(null); return; }
    setLoadingRooms(true);
    setExpandedHotel(hotel.hotelId);
    try {
      const res = await roomService.getByHotel(hotel.hotelId);
      setExpandedRooms(res.data?.data?.content || []);
    } catch { setExpandedRooms([]); }
    setLoadingRooms(false);
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingHotel) { await hotelService.update(editingHotel.hotelId, form); }
      else { await hotelService.create(form); }
      setShowForm(false); setEditingHotel(null);
      setForm({ name: '', location: '', description: '' });
      fetchData();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDeleteHotel = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try { await hotelService.delete(id); fetchData(); } catch (e) { console.error(e); }
  };

  const handleEditHotel = (h) => {
    setEditingHotel(h);
    setForm({ name: h.name, location: h.location, description: h.description || '' });
    setShowForm(true);
  };

  const handleSaveAmenity = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await amenityService.create(amenityForm); setShowAmenityForm(false); setAmenityForm({ name: '', description: '' }); fetchData(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleLinkAmenity = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await hotelAmenityService.addToHotel({ hotelId: parseInt(linkForm.hotelId), amenityId: parseInt(linkForm.amenityId) }); setShowLinkForm(false); setLinkForm({ hotelId: '', amenityId: '' }); fetchData(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Hotels & Amenities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage hotels and their amenities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAmenityForm(true)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-700 cursor-pointer">+ Amenity</button>
          <button onClick={() => setShowLinkForm(true)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-700 cursor-pointer">Link Amenity</button>
          <button onClick={() => { setShowForm(true); setEditingHotel(null); setForm({ name: '', location: '', description: '' }); }} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 cursor-pointer">+ Hotel</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</h3>
          <form onSubmit={handleSaveHotel} className="grid sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Location" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showAmenityForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">Add Amenity</h3>
          <form onSubmit={handleSaveAmenity} className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Amenity Name" required value={amenityForm.name} onChange={e => setAmenityForm({ ...amenityForm, name: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Description" value={amenityForm.description} onChange={e => setAmenityForm({ ...amenityForm, description: e.target.value })} className={inputClass} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowAmenityForm(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showLinkForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">Link Amenity to Hotel</h3>
          <form onSubmit={handleLinkAmenity} className="grid sm:grid-cols-2 gap-4">
            <select required value={linkForm.hotelId} onChange={e => setLinkForm({ ...linkForm, hotelId: e.target.value })} className={inputClass}>
              <option value="">Select Hotel</option>
              {hotels.map(h => <option key={h.hotelId} value={h.hotelId}>{h.name}</option>)}
            </select>
            <select required value={linkForm.amenityId} onChange={e => setLinkForm({ ...linkForm, amenityId: e.target.value })} className={inputClass}>
              <option value="">Select Amenity</option>
              {amenities.map(a => <option key={a.amenityId} value={a.amenityId}>{a.name}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Link'}</button>
              <button type="button" onClick={() => setShowLinkForm(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Hotels Table */}
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/80">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Amenities</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Rooms</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <>
                <tr key={h.hotelId} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <button onClick={() => handleViewRooms(h)} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer text-left">{h.name}</button>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{h.location}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(h.amenities || []).slice(0, 3).map(a => (
                        <span key={a.amenityId} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-md">{a.name}</span>
                      ))}
                      {(h.amenities || []).length > 3 && <span className="text-xs text-gray-500">+{h.amenities.length - 3}</span>}
                      {(!h.amenities || h.amenities.length === 0) && <span className="text-xs text-gray-600">No amenities</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg font-medium">{roomCounts[h.hotelId] || 0} rooms</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleViewRooms(h)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-600/30 cursor-pointer">View Rooms</button>
                      <button onClick={() => handleEditHotel(h)} className="p-1.5 text-gray-400 hover:text-yellow-400 cursor-pointer" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteHotel(h.hotelId)} className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedHotel === h.hotelId && (
                  <tr key={`rooms-${h.hotelId}`}>
                    <td colSpan={5} className="px-4 py-4 bg-gray-800/40">
                      {loadingRooms ? (
                        <div className="text-center py-4"><div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" /></div>
                      ) : expandedRooms.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-2">No rooms assigned to this hotel</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {expandedRooms.map(r => (
                            <div key={r.roomId} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-200">Room {r.roomNumber}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${r.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {r.isAvailable ? 'Available' : 'Booked'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{r.roomType?.typeName} — ₹{r.roomType?.pricePerNight}/night</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer">Next</button>
        </div>
      )}
    </div>
  );
}
