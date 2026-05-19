import { useState, useEffect } from 'react';
import { adminService } from '../services/hotelApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then((res) => setStats(res.data?.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" /></div>;

  const recentBookings = stats?.recentBookings || [];
  const recentReviews = stats?.recentReviews || [];
  const totalRevenue = stats?.totalRevenue || 0;
  const totalReservations = stats?.totalReservations || 0;

  const bookingsByMonth = {};
  recentBookings.forEach((b) => { const m = b.checkInDate?.substring(0, 7) || 'Unknown'; bookingsByMonth[m] = (bookingsByMonth[m] || 0) + 1; });
  const barData = Object.entries(bookingsByMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month: month.substring(5), bookings: count }));

  const ratingDist = { '1★': 0, '2★': 0, '3★': 0, '4★': 0, '5★': 0 };
  recentReviews.forEach((r) => { ratingDist[`${r.rating}★`] = (ratingDist[`${r.rating}★`] || 0) + 1; });
  const pieData = Object.entries(ratingDist).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const avgRating = recentReviews.length > 0 ? (recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length).toFixed(1) : '0.0';

  const revenueByMonth = {};
  recentBookings.forEach((b) => { const m = b.checkInDate?.substring(0, 7) || 'Unknown'; revenueByMonth[m] = (revenueByMonth[m] || 0) + 1; });
  const lineData = Object.entries(revenueByMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month: month.substring(5), revenue: count * 250 }));

  const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your hotel management system</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Reservations', value: totalReservations, sub: 'All time bookings', color: 'blue', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
          { label: 'Total Revenue', value: `₹${totalRevenue?.toLocaleString() || '0'}`, sub: 'Total payments', color: 'green', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: 'Avg. Rating', value: <>{avgRating}<span className="text-lg text-gray-500">/5</span></>, sub: `From ${recentReviews.length} reviews`, color: 'yellow', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
          { label: 'Reviews', value: recentReviews.length, sub: 'Guest reviews', color: 'purple', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        ].map((card, i) => (
          <div key={i} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">{card.label}</span>
              <div className={`w-10 h-10 bg-${card.color}-500/15 rounded-lg flex items-center justify-center text-${card.color}-400`}>{card.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-100">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Booking Trends</h3>
          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-500 text-sm">No booking data</div>}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <h3 className="font-semibold text-gray-100 mb-4">Rating Distribution</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-500 text-sm">No review data</div>}
          </div>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="font-semibold text-gray-100 mb-4">Revenue Trend</h3>
        <div className="h-64">
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-full text-gray-500 text-sm">No revenue data</div>}
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
        <h3 className="font-semibold text-gray-100 mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Guest</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Room</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Check-in</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Check-out</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.reservationId} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-200">#{b.reservationId}</td>
                  <td className="py-3 px-4 text-gray-300">{b.guestName}</td>
                  <td className="py-3 px-4 text-gray-400">{b.guestEmail}</td>
                  <td className="py-3 px-4 text-gray-300">{b.roomNumber}</td>
                  <td className="py-3 px-4 text-gray-300">{b.checkInDate}</td>
                  <td className="py-3 px-4 text-gray-300">{b.checkOutDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
