import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService, roomTypeService, amenityService, roomAmenityService, hotelService } from '../services/hotelApi';
import { cachedFetch, invalidateCache } from '../services/cache';
import RefreshButton from '../components/RefreshButton';

export default function AdminRooms() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomTypeId: '', hotelId: '', isAvailable: true });
  const [typeForm, setTypeForm] = useState({ typeName: '', description: '', maxOccupancy: '', pricePerNight: '' });
  const [linkForm, setLinkForm] = useState({ roomId: '', amenityIds: [] });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchInitial = async () => {
    await cachedFetch('admin-rooms-init', async () => {
      const [hRes, tRes, aRes] = await Promise.all([
        hotelService.getAll(0, 100, ''),
        roomTypeService.getAll(0, 100),
        amenityService.getAll(0, 100),
      ]);
      return {
        hotels: hRes.data?.data?.content || [],
        roomTypes: tRes.data?.data?.content || [],
        amenities: aRes.data?.data?.content || [],
      };
    }, [], (data) => {
      setHotels(data.hotels);
      setRoomTypes(data.roomTypes);
      setAmenities(data.amenities);
    }, () => { });
  };

  const fetchRooms = async (hotelId, pg = page) => {
    await cachedFetch('admin-rooms-list', async (hId, p, s) => {
      const res = hId
        ? await roomService.getByHotel(hId, p, s)
        : await roomService.getAll(p, s);
      const data = res.data?.data;
      return {
        content: (data?.content || []).sort((a, b) => b.roomId - a.roomId),
        totalPages: data?.totalPages || 0,
        totalElements: data?.totalElements || 0,
      };
    }, [hotelId, pg, 10], (data) => {
      setRooms(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    }, setLoading);
  };

  useEffect(() => { fetchInitial(); }, []);
  useEffect(() => { fetchRooms(selectedHotel, page); }, [selectedHotel, page]);

  const handleRefresh = async () => {
    invalidateCache('admin-rooms');
    await Promise.all([fetchInitial(), fetchRooms(selectedHotel, page)]);
  };


  const handleSaveRoom = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.roomId, { roomNumber: parseInt(roomForm.roomNumber), roomTypeId: parseInt(roomForm.roomTypeId), hotelId: parseInt(roomForm.hotelId), isAvailable: roomForm.isAvailable });
      } else {
        await roomService.create({ roomNumber: parseInt(roomForm.roomNumber), roomTypeId: parseInt(roomForm.roomTypeId), hotelId: parseInt(roomForm.hotelId || selectedHotel), isAvailable: roomForm.isAvailable });
      }
      setShowRoomForm(false); setEditingRoom(null);
      setRoomForm({ roomNumber: '', roomTypeId: '', hotelId: '', isAvailable: true });
      setPage(0);
      invalidateCache('admin-rooms');
      fetchRooms(selectedHotel, 0);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleEditRoom = (r) => {
    setEditingRoom(r);
    setRoomForm({ roomNumber: r.roomNumber, roomTypeId: r.roomType?.roomTypeId || '', hotelId: r.hotelId || '', isAvailable: r.isAvailable });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Delete this room?')) return;
    try { await roomService.delete(id); invalidateCache('admin-rooms'); fetchRooms(selectedHotel); } catch (e) { console.error(e); }
  };

  const handleSaveType = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await roomTypeService.create({ ...typeForm, maxOccupancy: parseInt(typeForm.maxOccupancy), pricePerNight: parseFloat(typeForm.pricePerNight) }); setShowTypeForm(false); setTypeForm({ typeName: '', description: '', maxOccupancy: '', pricePerNight: '' }); invalidateCache('admin-rooms'); fetchInitial(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleToggleAmenity = (amenityId) => {
    setLinkForm(prev => {
      const ids = prev.amenityIds.includes(amenityId)
        ? prev.amenityIds.filter(id => id !== amenityId)
        : [...prev.amenityIds, amenityId];
      return { ...prev, amenityIds: ids };
    });
  };

  const handleLinkAmenity = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      for (const amenityId of linkForm.amenityIds) {
        await roomAmenityService.addToRoom({ roomId: parseInt(linkForm.roomId), amenityId: parseInt(amenityId) });
      }
      setShowLinkForm(false); setLinkForm({ roomId: '', amenityIds: [] }); invalidateCache('admin-rooms'); fetchRooms(selectedHotel);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Rooms & Amenities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage rooms, room types, and room amenities · {totalElements} total rooms</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton onRefresh={handleRefresh} />
          <button onClick={() => setShowTypeForm(true)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-700 cursor-pointer">+ Room Type</button>
          <button onClick={() => setShowLinkForm(true)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-700 cursor-pointer">Link Amenity</button>
          <button onClick={() => { setShowRoomForm(true); setEditingRoom(null); setRoomForm({ roomNumber: '', roomTypeId: '', hotelId: selectedHotel, isAvailable: true }); }} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 cursor-pointer">+ Room</button>
        </div>
      </div>

      {/* Hotel Filter Dropdown */}
      <div className="mb-6">
        <select value={selectedHotel} onChange={e => { setSelectedHotel(e.target.value); setPage(0); }} className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]">
          <option value="">All Hotels</option>
          {hotels.map(h => <option key={h.hotelId} value={h.hotelId}>{h.name} — {h.location}</option>)}
        </select>
      </div>

      {showTypeForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">Add Room Type</h3>
          <form onSubmit={handleSaveType} className="grid sm:grid-cols-4 gap-4">
            <input type="text" placeholder="Type Name" required value={typeForm.typeName} onChange={e => setTypeForm({ ...typeForm, typeName: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Description" value={typeForm.description} onChange={e => setTypeForm({ ...typeForm, description: e.target.value })} className={inputClass} />
            <input type="number" placeholder="Max Occupancy" required min="1" value={typeForm.maxOccupancy} onChange={e => setTypeForm({ ...typeForm, maxOccupancy: e.target.value })} className={inputClass} />
            <input type="number" placeholder="Price/Night" required min="0" step="0.01" value={typeForm.pricePerNight} onChange={e => setTypeForm({ ...typeForm, pricePerNight: e.target.value })} className={inputClass} />
            <div className="sm:col-span-4 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowTypeForm(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showRoomForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">{editingRoom ? 'Edit Room' : 'Add Room'}</h3>
          <form onSubmit={handleSaveRoom} className="grid sm:grid-cols-4 gap-4">
            <input type="number" placeholder="Room Number" required min="1" value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} className={inputClass} />
            <select required value={roomForm.hotelId} onChange={e => setRoomForm({ ...roomForm, hotelId: e.target.value })} className={inputClass}>
              <option value="">Select Hotel</option>
              {hotels.map(h => <option key={h.hotelId} value={h.hotelId}>{h.name}</option>)}
            </select>
            <select required value={roomForm.roomTypeId} onChange={e => setRoomForm({ ...roomForm, roomTypeId: e.target.value })} className={inputClass}>
              <option value="">Select Room Type</option>
              {roomTypes.map(t => <option key={t.roomTypeId} value={t.roomTypeId}>{t.typeName} — ${t.pricePerNight}/night</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={roomForm.isAvailable} onChange={e => setRoomForm({ ...roomForm, isAvailable: e.target.checked })} className="w-4 h-4 rounded" />Available
            </label>
            <div className="sm:col-span-4 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setShowRoomForm(false); setEditingRoom(null); }} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showLinkForm && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-100 mb-4">Link Amenities to Room</h3>
          <form onSubmit={handleLinkAmenity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Room</label>
              <select required value={linkForm.roomId} onChange={e => setLinkForm({ ...linkForm, roomId: e.target.value })} className={inputClass}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.roomId} value={r.roomId}>Room {r.roomNumber} — {r.roomType?.typeName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Amenities</label>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                {amenities.map(a => (
                  <label key={a.amenityId} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={linkForm.amenityIds.includes(a.amenityId)}
                      onChange={() => handleToggleAmenity(a.amenityId)}
                      className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                    />
                    <span className="text-sm text-gray-200">{a.name}</span>
                    {a.description && <span className="text-xs text-gray-500">— {a.description}</span>}
                  </label>
                ))}
                {amenities.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No amenities available</p>}
              </div>
              {linkForm.amenityIds.length > 0 && (
                <p className="text-xs text-blue-400 mt-1.5">{linkForm.amenityIds.length} amenit{linkForm.amenityIds.length === 1 ? 'y' : 'ies'} selected</p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving || linkForm.amenityIds.length === 0} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 cursor-pointer">{saving ? 'Linking...' : `Link ${linkForm.amenityIds.length || ''} Amenities`}</button>
              <button type="button" onClick={() => { setShowLinkForm(false); setLinkForm({ roomId: '', amenityIds: [] }); }} className="px-4 py-2.5 bg-gray-700 text-gray-300 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/80">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Room #</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Hotel</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Price/Night</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Max Guests</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Amenities</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.roomId} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-200">{r.roomNumber}</td>
                  <td className="py-3 px-4 text-gray-400">{r.hotelName || '—'}</td>
                  <td className="py-3 px-4 text-gray-300">{r.roomType?.typeName || '—'}</td>
                  <td className="py-3 px-4 text-gray-200 font-medium">${r.roomType?.pricePerNight || '—'}</td>
                  <td className="py-3 px-4 text-gray-400">{r.roomType?.maxOccupancy || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${r.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {r.isAvailable ? 'Available' : 'Booked'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(r.amenities || []).slice(0, 2).map(a => (
                        <span key={a.amenityId} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-md">{a.name}</span>
                      ))}
                      {(r.amenities || []).length > 2 && <span className="text-xs text-gray-500">+{r.amenities.length - 2}</span>}
                      {(!r.amenities || r.amenities.length === 0) && <span className="text-xs text-gray-600">—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.isAvailable && (
                        <button onClick={() => navigate('/admin/booking', { state: { roomId: r.roomId } })} className="px-3 py-1.5 bg-green-600/20 text-green-400 text-xs font-medium rounded-lg hover:bg-green-600/30 cursor-pointer">Book</button>
                      )}
                      <button onClick={() => handleEditRoom(r)} className="p-1.5 text-gray-400 hover:text-yellow-400 cursor-pointer" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteRoom(r.roomId)} className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500">No rooms found{selectedHotel ? ' for this hotel' : ''}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
