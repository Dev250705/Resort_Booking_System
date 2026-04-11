import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/user/login";
import Register from "./pages/user/register";
import Home from "./pages/home";
import ResetPassword from "./pages/user/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import VerifyOtp from "./pages/user/verifyotp";
import About from "./pages/about";
import Contact from "./pages/contact";
import Policy from "./pages/policy";
import Rooms from "./pages/rooms";
import ResortDetails from "./pages/resortDetails";
import Search from "./pages/search";
import Payment from "./pages/payment";

import MyBookings from "./pages/user/myBookings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/search" element={<Search />} />
        <Route path="/resort/:id" element={<ResortDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
