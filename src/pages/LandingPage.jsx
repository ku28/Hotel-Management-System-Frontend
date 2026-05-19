import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:py-40 lg:py-48">
          <div className="max-w-2xl">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-4">Premium Hospitality</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Find Your Perfect
              <span className="text-blue-400"> Stay</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl">
              Discover exceptional hotels worldwide. Book luxury rooms, enjoy premium amenities, and create unforgettable memories.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link to="/hotels" className="inline-flex items-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40">
                Browse Hotels
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link to={isAuthenticated ? "/hotels" : "/signup"} className="inline-flex items-center px-8 py-3.5 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-semibold rounded-xl transition-all">
                {isAuthenticated ? 'Explore Hotels' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Hotels', value: '50+' },
              { label: 'Room Types', value: '65+' },
              { label: 'Happy Guests', value: '10K+' },
              { label: 'Cities', value: '25+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-100">Why Choose Hotel Management System</h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">Premium hotel booking experience with enterprise-grade reliability</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Booking', desc: 'Real-time availability and instant confirmation for all reservations.', icon: '⚡' },
              { title: 'Best Prices', desc: 'Competitive pricing with transparent fees. No hidden charges.', icon: '💰' },
              { title: 'Premium Support', desc: '24/7 customer support for all your travel needs.', icon: '🎯' },
            ].map((feature) => (
              <div key={feature.title} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-100">{isAuthenticated ? 'Explore Hotels' : 'Ready to Book?'}</h2>
          <p className="mt-4 text-gray-400">{isAuthenticated ? 'Browse our collection of premium hotels and find your perfect stay.' : 'Join thousands of satisfied guests. Sign up today and get exclusive deals.'}</p>
          <Link to={isAuthenticated ? "/hotels" : "/signup"} className="mt-8 inline-flex items-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg">
            {isAuthenticated ? 'Browse Hotels' : 'Create Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
