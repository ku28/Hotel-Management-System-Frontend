import api from './api';

const normalizeRoom = (room) => {
  if (!room) return room;
  return {
    ...room,
    hotelId: room.hotelId ?? room.hotel?.hotelId,
    hotelName: room.hotelName ?? room.hotel?.name,
    roomType: room.roomType ?? (room.roomTypeId || room.roomTypeName || room.pricePerNight || room.maxOccupancy
      ? {
          roomTypeId: room.roomTypeId,
          typeName: room.roomTypeName,
          maxOccupancy: room.maxOccupancy,
          pricePerNight: room.pricePerNight,
        }
      : null),
    amenities: (room.amenities || []).map((amenity, index) => (
      typeof amenity === 'string' ? { amenityId: `${room.roomId}-${index}`, name: amenity } : amenity
    )),
  };
};

const normalizeReview = (review) => {
  if (!review) return review;
  return {
    ...review,
    reservationId: review.reservationId ?? review.reservation?.reservationId,
  };
};

const apiPathFromHref = (href) => {
  if (!href) return null;
  const cleanHref = href.replace(/\{.*\}$/, '');
  try {
    return new URL(cleanHref).pathname;
  } catch {
    return cleanHref;
  }
};

const roomItemResponse = async (response) => {
  const room = normalizeRoom(response.data?.data || response.data);
  if (!room?.roomType?.pricePerNight) {
    const roomTypePath = apiPathFromHref(room?._links?.roomType?.href);
    if (roomTypePath) {
      const roomTypeRes = await api.get(roomTypePath);
      room.roomType = roomTypeRes.data;
    }
  }
  return {
    ...response,
    data: {
      data: normalizeRoom(room),
    },
  };
};

const pageResponse = (response, rel, normalize = (item) => item) => {
  const body = response.data || {};
  const page = body.page || {};
  return {
    ...response,
    data: {
      data: {
        content: (body._embedded?.[rel] || body.data?.content || []).map(normalize),
        page: page.number || 0,
        size: page.size || 0,
        totalElements: page.totalElements || 0,
        totalPages: page.totalPages || 0,
      },
    },
  };
};

const itemResponse = (response, normalize = (item) => item) => ({
  ...response,
  data: {
    data: normalize(response.data?.data || response.data),
  },
});

export const hotelService = {
  getAll: (page = 0, size = 12, search = '') => {
    const params = { page, size };
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      params.name = trimmedSearch;
      params.location = trimmedSearch;
      return api.get('/api/hotels/search/by-name-or-location', { params }).then((res) => pageResponse(res, 'hotels'));
    }
    return api.get('/api/hotels', { params }).then((res) => pageResponse(res, 'hotels'));
  },
  getById: (id) => api.get(`/api/hotels/${id}`).then(itemResponse),
  create: (data) => api.post('/api/hotels', data).then(itemResponse),
  update: (id, data) => api.put(`/api/hotels/${id}`, data).then(itemResponse),
  delete: (id) => api.delete(`/api/hotels/${id}`),
};

export const roomService = {
  getAll: (page = 0, size = 10) =>
    api.get('/api/rooms', { params: { page, size, projection: 'room' } }).then((res) => pageResponse(res, 'rooms', normalizeRoom)),
  getById: (id) => api.get(`/api/rooms/${id}`, { params: { projection: 'room' } }).then(roomItemResponse),
  getByHotel: (hotelId, page = 0, size = 100) =>
    api.get('/api/rooms/search/by-hotel', { params: { hotelId, page, size, projection: 'room' } }).then((res) => pageResponse(res, 'rooms', normalizeRoom)),
  getAvailableByType: (typeId, page = 0, size = 10) =>
    api.get('/api/rooms/search/available-by-room-type', { params: { roomTypeId: typeId, page, size, projection: 'room' } }).then((res) => pageResponse(res, 'rooms', normalizeRoom)),
  create: (data) => api.post('/api/room-management/rooms', data).then((res) => itemResponse(res, normalizeRoom)),
  update: (id, data) => api.put(`/api/room-management/rooms/${id}`, data).then((res) => itemResponse(res, normalizeRoom)),
  delete: (id) => api.delete(`/api/room-management/rooms/${id}`),
};

export const roomTypeService = {
  getAll: (page = 0, size = 50) =>
    api.get('/api/room-types', { params: { page, size } }).then((res) => pageResponse(res, 'roomTypes')),
  getById: (id) => api.get(`/api/room-types/${id}`).then(itemResponse),
  create: (data) => api.post('/api/room-types', data).then(itemResponse),
  update: (id, data) => api.put(`/api/room-types/${id}`, data).then(itemResponse),
  delete: (id) => api.delete(`/api/room-types/${id}`),
};

export const reservationService = {
  getAll: (page = 0, size = 10) => api.get(`/api/reservation/all?page=${page}&size=${size}`),
  getMyReservations: (email, page = 0, size = 10) =>
    api.get(`/api/reservation/my?email=${encodeURIComponent(email)}&page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/reservation/${id}`),
  getRoomAvailableAfter: (roomId) => api.get(`/api/reservation/room/${roomId}/available-after`),
  create: (data) => api.post('/api/reservation/post', data),
  update: (id, data) => api.put(`/api/reservation/update/${id}`, data),
  delete: (id) => api.delete(`/api/reservation/${id}`),
};

export const paymentService = {
  getAll: (page = 0, size = 10) => api.get(`/api/payment/all?page=${page}&size=${size}`),
  create: (data) => api.post('/api/payment/post', data),
  getTotalRevenue: () => api.get('/api/payments/total-revenue'),
};

export const reviewService = {
  getAll: (page = 0, size = 10) =>
    api.get('/api/review-management/reviews', { params: { page, size, sortBy: 'reviewDate', sortDir: 'desc' } }),
  getByRating: (rating, page = 0, size = 10) =>
    api.get('/api/review-management/reviews/by-rating', { params: { rating, page, size, sortBy: 'reviewDate', sortDir: 'desc' } }),
  getByHotel: (hotelId, page = 0, size = 5) =>
    api.get('/api/reviews/search/by-hotel', { params: { hotelId, page, size, projection: 'review', sort: 'reviewDate,desc' } }).then((res) => pageResponse(res, 'reviews', normalizeReview)),
  getRecent: () => api.get('/api/reviews/recent'),
  create: (data) => api.post('/api/review-management/reviews', data),
  delete: (id) => api.delete(`/api/review-management/reviews/${id}`),
};

export const amenityService = {
  getAll: (page = 0, size = 50) =>
    api.get('/api/amenities', { params: { page, size } }).then((res) => pageResponse(res, 'amenities')),
  getByHotel: (hotelId) =>
    api.get('/api/amenities/search/by-hotel', { params: { hotelId } }).then((res) => pageResponse(res, 'amenities')),
  getByRoom: (roomId) =>
    api.get('/api/amenities/search/by-room', { params: { roomId } }).then((res) => pageResponse(res, 'amenities')),
  create: (data) => api.post('/api/amenities', data).then(itemResponse),
  update: (id, data) => api.put(`/api/amenities/${id}`, data).then(itemResponse),
  delete: (id) => api.delete(`/api/amenities/${id}`),
};

export const hotelAmenityService = {
  addToHotel: (data) => api.post('/api/hotelamenity/post', data),
};

export const roomAmenityService = {
  addToRoom: (data) => api.post('/api/roomAmenity/post', data),
};

export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

export const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),
};
