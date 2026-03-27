import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await api.get('destinations/');
        setDestinations(response.data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in">
            Explore Your Next <span className="text-indigo-400">Adventure</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Book buses and holiday packages to world's most beautiful destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/buses" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-xl hover:shadow-indigo-500/50">
              Search Buses
            </Link>
            <Link to="/packages" className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition shadow-xl">
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Destinations</h2>
            <p className="text-gray-600">Handpicked locations for your dream vacation</p>
          </div>
          <Link to="/packages" className="text-indigo-600 font-semibold hover:text-indigo-500 transition">
            See All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
            {destinations.slice(0, 3).map((dest) => (
              <div key={dest.id} className="group relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-500 transform hover:-translate-y-2">
                <img 
                  src={dest.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 p-6 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-medium text-indigo-300 mb-1">{dest.city}, {dest.country}</p>
                      <h3 className="text-2xl font-bold">{dest.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-300">Starts from</p>
                      <p className="text-xl font-bold">₹{dest.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-indigo-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Travel With MyTrip?</h2>
            <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 bg-indigo-800/50 rounded-2xl backdrop-blur-sm border border-indigo-700/50">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
              <p className="text-indigo-200">Track your bus in real-time and never miss your ride with our integrated GPS system.</p>
            </div>
            <div className="p-8 bg-indigo-800/50 rounded-2xl backdrop-blur-sm border border-indigo-700/50">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-indigo-200">Your transactions are protected with industry-standard encryption and multiple payment options.</p>
            </div>
            <div className="p-8 bg-indigo-800/50 rounded-2xl backdrop-blur-sm border border-indigo-700/50">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Customer Support</h3>
              <p className="text-indigo-200">Our dedicated support team is available around the clock to assist you with your travel needs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
