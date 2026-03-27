import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [numPeople, setNumPeople] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const [pkgRes, reviewsRes] = await Promise.all([
          api.get(`packages/${id}/`),
          api.get(`reviews/?package=${id}`)
        ]);
        setPkg(pkgRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching package data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book a package');
      navigate('/login');
      return;
    }

    setIsBooking(true);
    try {
      const response = await api.post('bookings/', {
        package_id: pkg.id,
        number_of_people: numPeople,
      });
      // Redirect to payment page with booking ID
      navigate(`/payment/${response.data.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handlePostReview = async () => {
    if (!newComment.trim()) return;
    setIsReviewing(true);
    try {
      const response = await api.post('reviews/', {
        package_id: pkg.id,
        rating: newRating,
        comment: newComment
      });
      setReviews([response.data, ...reviews]);
      setNewComment('');
      alert('Review posted successfully!');
    } catch (error) {
      console.error('Review failed:', error);
      alert('Error posting review.');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Package not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={pkg.destination_image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"} 
              alt={pkg.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full font-bold text-indigo-600 shadow-lg">
              {pkg.duration_days} Days Trip
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{pkg.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-1 text-gray-500 font-medium">
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                {pkg.destination_name || 'Destinations'}
              </span>
              <span className="flex items-center gap-1 text-gray-500 font-medium">
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                Starts {pkg.start_date}
              </span>
            </div>
            
            <div className="prose prose-indigo max-w-none text-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="whitespace-pre-line">{pkg.description}</p>
            </div>

            {/* Reviews Section */}
            <div className="pt-12 border-t border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-8">Traveler Reviews</h2>
               <div className="space-y-6">
                 {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                {review.user.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900">{review.user}</p>
                                 <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex text-yellow-400">
                              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                           </div>
                        </div>
                        <p className="text-gray-600 italic">"{review.comment}"</p>
                    </div>
                 )) : (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience!</p>
                 )}

                 {/* Add Review Form (Only for logged in users) */}
                 {user && (
                    <div className="mt-12 bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 text-left">
                       <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-sm font-bold text-gray-600">Rating:</span>
                             {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                  key={star}
                                  onClick={() => setNewRating(star)}
                                  className={`text-2xl transition-all ${newRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </button>
                             ))}
                          </div>
                          <textarea 
                             value={newComment}
                             onChange={(e) => setNewComment(e.target.value)}
                             className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                             placeholder="How was your trip?"
                             rows="4"
                          ></textarea>
                          <button 
                             onClick={handlePostReview}
                             disabled={isReviewing || !newComment.trim()}
                             className={`bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 ${isReviewing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                             {isReviewing ? 'Posting...' : 'Post Review'}
                          </button>
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Price per person</span>
              <span className="text-3xl font-black text-gray-900">₹{pkg.price}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Number of Travelers</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-gray-600 font-bold text-xl"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    readOnly
                    value={numPeople}
                    className="w-full text-center font-bold text-lg outline-none"
                  />
                  <button 
                    onClick={() => setNumPeople(Math.min(pkg.available_slots, numPeople + 1))}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-indigo-600 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{pkg.available_slots} slots available</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total Price</span>
                  <span className="text-2xl font-black text-indigo-600">₹{numPeople * parseFloat(pkg.price)}</span>
                </div>
                <button 
                  onClick={handleBooking}
                  disabled={isBooking}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                    isBooking ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
                  }`}
                >
                  {isBooking ? 'Processing...' : 'Book This Trip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
