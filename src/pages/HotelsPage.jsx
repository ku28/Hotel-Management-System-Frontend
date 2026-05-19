import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelService } from '../services/hotelApi';

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelService.getAll(page, 12, search);
      setHotels(res.data?.data?.content || []);
      setTotalPages(res.data?.data?.totalPages || 0);
    } catch (err) { console.error('Failed to fetch hotels:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, [page, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-100">Explore Hotels</h1>
        <p className="mt-2 text-gray-500">Find your perfect accommodation</p>
      </div>
      <div className="mb-8">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search by name or location..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-20"><p className="text-gray-500">No hotels found</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Link key={hotel.hotelId} to={`/hotels/${hotel.hotelId}`}
              className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-900/30 to-gray-900 flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-800/60 group-hover:text-blue-700/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">{hotel.name}</h3>
                <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {hotel.location}
                </p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{hotel.description}</p>
                {hotel.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {hotel.amenities.slice(0, 3).map(a => (
                      <span key={a.amenityId} className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-xs rounded-md">{a.name}</span>
                    ))}
                    {hotel.amenities.length > 3 && <span className="text-xs text-gray-600">+{hotel.amenities.length - 3}</span>}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
