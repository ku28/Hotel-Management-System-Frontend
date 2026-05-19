import { useState, useEffect } from 'react';
import { reviewService } from '../services/hotelApi';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterRating, setFilterRating] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = filterRating > 0
        ? await reviewService.getByRating(filterRating, page, 15)
        : await reviewService.getAll(page, 15);
      setReviews(res.data?.data?.content || []);
      setTotalPages(res.data?.data?.totalPages || 0);
      setTotalElements(res.data?.data?.totalElements || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, filterRating]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await reviewService.delete(id); fetchData(); } catch (e) { console.error(e); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reviews & Ratings</h1>
          <p className="text-gray-400 text-sm mt-1">{totalElements} total reviews · Average {avgRating}/5</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setFilterRating(0); setPage(0); }}
          className={`px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors ${filterRating === 0 ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}>All</button>
        {[5, 4, 3, 2, 1].map(r => (
          <button key={r} onClick={() => { setFilterRating(r); setPage(0); }}
            className={`px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors ${filterRating === r ? 'bg-blue-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}>{r} ★</button>
        ))}
      </div>
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700"><p className="text-gray-500">No reviews found</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.reviewId} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">{renderStars(r.rating)}</div>
                    <span className="text-sm font-bold text-yellow-400">{r.rating}/5</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500">Reservation #{r.reservationId}</span>
                    {r.hotelName && (
                      <>
                        <span className="text-xs text-gray-600">·</span>
                        <span className="text-xs text-blue-400 font-medium">{r.hotelName}</span>
                      </>
                    )}
                  </div>
                  {r.guestName && <p className="text-xs text-gray-500 mb-1">By {r.guestName}</p>}
                  <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">{r.reviewDate}</p>
                </div>
                <button onClick={() => handleDelete(r.reviewId)} className="p-1.5 text-gray-500 hover:text-red-400 cursor-pointer ml-4" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
