import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Register from "./pages/Register";
import BusList from "./pages/BusList";
import Login from "./pages/Login";
import Home from "./pages/Home";
import PackageList from "./pages/PackageList";
import PackageDetail from "./pages/PackageDetail";
import MyBookings from "./pages/MyBookings";
import Payment from "./pages/Payment";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/buses" element={<BusList />} />
              <Route path="/packages" element={<PackageList />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App;