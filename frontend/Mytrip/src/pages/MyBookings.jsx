import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('bookings/');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`bookings/${bookingId}/`, { status: "cancelled" });
      // User wants it removed from UI automatically on cancel
      setBookings(bookings.filter((b) => b.id !== bookingId));
      alert("Booking cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking from your history? This cannot be undone.")) return;
    try {
      await api.delete(`bookings/${bookingId}/`);
      setBookings(bookings.filter((b) => b.id !== bookingId));
      alert("Booking deleted from history.");
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL booking history? This cannot be undone.")) return;
    try {
      await api.delete('clear-history/');
      setBookings([]);
      alert("All booking history cleared.");
    } catch (error) {
      console.error('Error clearing history:', error);
      alert("Failed to clear history.");
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Please login to view your bookings.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-500 text-lg">Manage your trips and view booking history.</p>
        </div>
        {bookings.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-red-600 font-bold text-sm bg-red-50 px-6 py-3 rounded-xl hover:bg-red-100 transition flex items-center gap-2 border border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Clear All History
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(n => (
            <div key={n} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const item = booking.package || booking.bus;
              const title = item?.title || item?.bus_name || 'Trip';
              const type = booking.package ? 'Package' : 'Bus';
              const image = booking.package?.destination?.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 h-48 md:h-auto overflow-hidden bg-gray-100">
                      <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }}
                      />
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                              {type} Booking #{booking.id}
                            </p>
                            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                          </div>
                          <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium mb-1 uppercase text-xs">Booked On</p>
                            <p className="text-gray-700 font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-1 uppercase text-xs">Details</p>
                            <p className="text-gray-700 font-semibold">
                              {booking.package ? `${booking.number_of_people} Person(s)` : `Bus: ${booking.bus?.number} (Seats: ${booking.seat_numbers || 'N/A'})`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium mb-1 uppercase text-xs">Total Amount</p>
                            <p className="text-indigo-600 font-bold text-lg">₹{booking.total_price}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-4">
                        {booking.status === "pending" && (
                          <Link
                            to={`/payment/${booking.id}`}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
                          >
                            Pay Now
                          </Link>
                        )}
                        {(booking.status === "pending" ||
                          booking.status === "confirmed") && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-white text-gray-600 border border-gray-200 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
                          >
                            Cancel Booking
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="bg-white text-red-600 border border-red-100 px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition ml-auto"
                        >
                          Delete History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <p className="text-gray-500 text-xl font-medium mb-8">You haven't made any bookings yet.</p>
              <Link to="/packages" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg hover:shadow-indigo-200">
                Explore Packages
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
