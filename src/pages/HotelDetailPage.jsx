import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hotelService, roomService, reservationService, reviewService } from '../services/hotelApi';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [bookedUntil, setBookedUntil] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelService.getById(id),
          roomService.getByHotel(id, 0, 100),
        ]);
        setHotel(hotelRes.data?.data);
        const roomList = roomsRes.data?.data?.content || [];
        setRooms(roomList);
        const bookedRooms = roomList.filter(room => !room.isAvailable);
        const availabilityEntries = await Promise.all(bookedRooms.map(async (room) => {
          try {
            const res = await reservationService.getRoomAvailableAfter(room.roomId);
            return [room.roomId, res.data?.data];
          } catch {
            return [room.roomId, null];
          }
        }));
        setBookedUntil(Object.fromEntries(availabilityEntries));
      } catch (err) { console.error('Failed to load hotel:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    reviewService.getByHotel(id, reviewPage, 5).then((res) => {
      setReviews(res.data?.data?.content || []);
      setReviewTotalPages(res.data?.data?.totalPages || 0);
    }).catch(console.error);
  }, [id, reviewPage]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!hotel) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p className="text-gray-500">Hotel not found</p></div>;

  const availableRooms = rooms.filter(room => room.isAvailable);
  const bookedRooms = rooms.filter(room => !room.isAvailable);
  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/hotels" className="hover:text-gray-300 transition-colors">Hotels</Link>
        <span>/</span>
        <span className="text-gray-200">{hotel.name}</span>
      </div>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8">
        <div className="h-64 bg-gradient-to-br from-blue-900/40 via-gray-900 to-gray-950 flex items-center justify-center">
          <svg className="w-24 h-24 text-blue-800/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-100">{hotel.name}</h1>
          <p className="mt-2 text-gray-400 flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {hotel.location}
          </p>
          <p className="mt-4 text-gray-400 leading-relaxed max-w-3xl">{hotel.description}</p>
        </div>
      </div>
      {hotel.amenities?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((a) => (
              <span key={a.amenityId} className="px-3 py-1.5 bg-blue-500/15 text-blue-400 text-sm rounded-lg border border-blue-500/20">{a.name}</span>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Available Rooms</h2>
        {availableRooms.length === 0 ? (
          <p className="text-gray-500">No rooms available</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.map((room) => (
              <div key={room.roomId} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-100">Room {room.roomNumber}</span>
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-500/20 text-green-400">Available</span>
                </div>
                {room.roomType && (
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>{room.roomType.typeName}</p>
                    <p>Up to {room.roomType.maxOccupancy} guests</p>
                    <p className="text-lg font-bold text-gray-100">₹{room.roomType.pricePerNight}<span className="text-sm font-normal text-gray-500">/night</span></p>
                  </div>
                )}
                {room.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.amenities.slice(0, 3).map(a => (
                      <span key={a.amenityId} className="px-2 py-0.5 bg-purple-500/15 text-purple-400 text-xs rounded-md">{a.name}</span>
                    ))}
                    {room.amenities.length > 3 && <span className="text-xs text-gray-500">+{room.amenities.length - 3}</span>}
                  </div>
                )}
                <Link to={`/booking/${room.roomId}`} className="mt-4 block text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Book Now</Link>
              </div>
            ))}
          </div>
        )}
      </div>
      {bookedRooms.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Booked Rooms</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookedRooms.map((room) => (
              <div key={room.roomId} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-100">Room {room.roomNumber}</span>
                  <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-500/20 text-red-400">Booked</span>
                </div>
                {room.roomType && (
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>{room.roomType.typeName}</p>
                    <p>Up to {room.roomType.maxOccupancy} guests</p>
                    <p className="text-gray-500">Available after {bookedUntil[room.roomId] || 'current booking'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.reviewId} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm font-bold text-yellow-400">{review.rating}/5</span>
                  <span className="text-xs text-gray-500">{review.reviewDate}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{review.comment || 'No comment provided.'}</p>
              </div>
            ))}
          </div>
        )}
        {reviewTotalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => setReviewPage(Math.max(0, reviewPage - 1))} disabled={reviewPage === 0} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 cursor-pointer">Previous</button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {reviewPage + 1} of {reviewTotalPages}</span>
            <button onClick={() => setReviewPage(Math.min(reviewTotalPages - 1, reviewPage + 1))} disabled={reviewPage >= reviewTotalPages - 1} className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 cursor-pointer">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
