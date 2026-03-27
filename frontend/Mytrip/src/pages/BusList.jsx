import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const BusList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  // Seat selection states
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await api.get("buses/");
        setBuses(response.data);
      } catch (err) {
        console.error("Error fetching buses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const handleOpenSeatSelection = (bus) => {
    if (!user) {
      alert("Please login to book a bus ticket.");
      navigate("/login");
      return;
    }
    setSelectedBus(bus);
    setSelectedSeats([]);
    setShowSeatModal(true);
  };

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    setIsBooking(true);
    try {
      const response = await api.post("bookings/", {
        bus_id: selectedBus.id,
        number_of_people: selectedSeats.length,
        seat_numbers: selectedSeats.sort((a, b) => a - b).join(", "),
      });
      alert(`Booking Successful for seats: ${selectedSeats.join(", ")}`);
      setShowSeatModal(false);
      navigate('/my-bookings');
    } catch (error) {
      console.error("Bus booking failed:", error);
      alert("Error booking bus. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Generate 32 seats
  const seats = Array.from({ length: 32 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Available Buses</h1>
          <p className="text-gray-500 text-lg">Find the perfect ride for your next journey.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-40 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {buses.map((bus) => (
            <div key={bus.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {bus.number}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{bus.bus_name}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">From</p>
                      <p className="font-semibold text-gray-700">{bus.origin}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">To</p>
                      <p className="font-semibold text-gray-700">{bus.destination}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Price</p>
                      <p className="font-bold text-indigo-600">₹{bus.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Departure</p>
                      <p className="font-semibold text-gray-700">{bus.start_time}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenSeatSelection(bus)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  Book Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Select Seats</h3>
                <p className="text-sm text-gray-500">{selectedBus?.bus_name} - {selectedBus?.number}</p>
              </div>
              <button 
                onClick={() => setShowSeatModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >&times;</button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 bg-gray-50">
               {/* Legend */}
               <div className="flex justify-center gap-8 mb-8 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white border border-gray-200 rounded-md"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded-md"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
                    <span>Aisle</span>
                  </div>
               </div>

               {/* Seat Grid */}
               <div className="flex justify-center">
                 <div className="grid grid-cols-5 gap-3">
                   {/* Simplified 1-32 grid with Aisle at col 3 */}
                   {Array.from({ length: 8 }).map((_, rowIndex) => (
                     <React.Fragment key={rowIndex}>
                       <SeatButton 
                          num={rowIndex * 4 + 1} 
                          isSelected={selectedSeats.includes(rowIndex * 4 + 1)} 
                          onClick={() => toggleSeat(rowIndex * 4 + 1)} 
                       />
                       <SeatButton 
                          num={rowIndex * 4 + 2} 
                          isSelected={selectedSeats.includes(rowIndex * 4 + 2)} 
                          onClick={() => toggleSeat(rowIndex * 4 + 2)} 
                       />
                       {/* Aisle */}
                       <div className="w-8"></div>
                       <SeatButton 
                          num={rowIndex * 4 + 3} 
                          isSelected={selectedSeats.includes(rowIndex * 4 + 3)} 
                          onClick={() => toggleSeat(rowIndex * 4 + 3)} 
                       />
                       <SeatButton 
                          num={rowIndex * 4 + 4} 
                          isSelected={selectedSeats.includes(rowIndex * 4 + 4)} 
                          onClick={() => toggleSeat(rowIndex * 4 + 4)} 
                       />
                     </React.Fragment>
                   ))}
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 w-full sm:w-auto flex-grow max-w-md">
                     <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Selected Seats</p>
                     <p className="text-lg font-black text-indigo-700">
                        {selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(", ") : "None selected"}
                     </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-gray-900">₹{selectedSeats.length * (selectedBus?.price || 0)}</p>
                  </div>
                  <button 
                    onClick={handleConfirmBooking}
                    disabled={isBooking || selectedSeats.length === 0}
                    className={`w-full sm:w-48 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                      isBooking || selectedSeats.length === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {isBooking ? 'Wait...' : 'Book Now'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatButton = ({ num, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold transition-all border-2 text-sm ${
      isSelected 
        ? 'bg-red-600 border-red-700 text-white shadow-md transform scale-105' 
        : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
    }`}
  >
    {num}
  </button>
);

export default BusList;