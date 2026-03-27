import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Payment = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking
    const [upiApp, setUpiApp] = useState('phonepe'); // phonepe, paytm, gpay
    const [paymentStep, setPaymentStep] = useState('selection'); // selection, processing, success

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await api.get(`bookings/${bookingId}/`);
                setBooking(response.data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handleProcessPayment = async () => {
        setPaymentStep('processing');
        setIsProcessing(true);
        
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post('razorpay-order/', { booking_id: bookingId });
            const order = orderRes.data;

            // 2. Simulate Bank Redirect & Processing
            setTimeout(async () => {
                try {
                    // 3. Verify Payment on Backend
                    await api.post('verify-payment/', {
                        booking_id: bookingId,
                        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
                        razorpay_order_id: order.id,
                        razorpay_signature: 'simulated_signature'
                    });

                    setPaymentStep('success');
                    setTimeout(() => {
                        navigate('/my-bookings');
                    }, 3000);
                } catch (verifyError) {
                    console.error('Verification failed:', verifyError);
                    alert('Payment verification failed.');
                    setPaymentStep('selection');
                } finally {
                    setIsProcessing(false);
                }
            }, 3000);

        } catch (error) {
            console.error('Payment initialization failed:', error);
            alert('Could not initialize payment.');
            setIsProcessing(false);
            setPaymentStep('selection');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
    if (!booking) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 bg-gray-50">Booking not found.</div>;

    const item = booking.package || booking.bus;
    const itemName = item?.title || item?.bus_name || 'Trip';

    if (paymentStep === 'processing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
                <p className="text-gray-500 animate-pulse">Contacting your bank... Do not refresh the page.</p>
                <div className="mt-12 flex items-center gap-4 border border-gray-100 px-6 py-3 rounded-2xl bg-gray-50">
                    <img src="https://razorpay.com/favicon.png" className="w-5 h-5 opacity-50" alt="rzp" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Secured by Razorpay</p>
                </div>
            </div>
        );
    }

    if (paymentStep === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8">Your booking for {itemName} is confirmed.</p>
                <p className="text-sm text-indigo-600 font-semibold italic">Redirecting to your bookings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Payment Methods */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h1 className="text-2xl font-black text-gray-900 mb-1">Choose Payment Method</h1>
                            <p className="text-gray-500 text-sm">All transactions are secure and encrypted.</p>
                        </div>

                        {/* Method Tabs */}
                        <div className="flex bg-gray-50 p-2 m-4 rounded-2xl">
                            <button 
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'upi' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                UPI / QR
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'card' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Card
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('netbanking')}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === 'netbanking' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Net Banking
                            </button>
                        </div>

                        <div className="p-8 pt-4">
                            {paymentMethod === 'upi' && (
                                <div className="space-y-6">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Popular UPI Apps</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <UpiOption 
                                            name="PhonePe" 
                                            id="phonepe" 
                                            active={upiApp === 'phonepe'} 
                                            onClick={() => setUpiApp('phonepe')}
                                            color="bg-purple-50 text-purple-700 border-purple-200"
                                        />
                                        <UpiOption 
                                            name="Paytm" 
                                            id="paytm" 
                                            active={upiApp === 'paytm'} 
                                            onClick={() => setUpiApp('paytm')}
                                            color="bg-blue-50 text-blue-700 border-blue-200"
                                        />
                                        <UpiOption 
                                            name="Google Pay" 
                                            id="gpay" 
                                            active={upiApp === 'gpay'} 
                                            onClick={() => setUpiApp('gpay')}
                                            color="bg-red-50 text-red-700 border-red-200"
                                        />
                                    </div>
                                    <div className="mt-8 border-t border-gray-50 pt-8">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Enter UPI ID</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="username@bank"
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Verify</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Card Number</label>
                                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expiry Date</label>
                                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CVV</label>
                                                <input type="password" placeholder="XXX" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4">
                                        <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-8" alt="visa" />
                                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-8" alt="mc" />
                                        <img src="https://img.icons8.com/color/48/000000/rupay.png" className="h-8" alt="rupay" />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'netbanking' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'KOTAK', 'BOI'].map(bank => (
                                        <button key={bank} className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-400 transition-all font-bold text-gray-700 text-sm flex items-center justify-between">
                                            {bank}
                                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
                        <div className="p-8 bg-indigo-600 text-white">
                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Payable Amount</p>
                            <h2 className="text-4xl font-black">₹{booking.total_price}</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{itemName}</p>
                                        <p className="text-sm text-gray-500">
                                            {booking.package ? `${booking.package.duration_days} Days` : `Seats: ${booking.seat_numbers || '1'}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold">₹{booking.total_price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Booking Fee</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleProcessPayment}
                                className="w-full py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-indigo-200 active:scale-[0.98]"
                            >
                                Pay Now
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                Secure Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UpiOption = ({ name, id, active, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${active ? color : 'bg-white border-gray-100 hover:border-gray-300'}`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${active ? 'bg-white/50' : 'bg-gray-100'}`}>
            {name[0]}
        </div>
        <span className="font-bold text-sm">{name}</span>
    </button>
);

export default Payment;
