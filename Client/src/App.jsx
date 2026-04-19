import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
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
import Gallery from "./pages/Gallery";
import Amenities from "./pages/Amenities";
import Dining from "./pages/Dining";

import MyBookings from "./pages/user/myBookings";
import UserDashboard from "./pages/user/pages/Dashboard";
import AdminRoute from "./AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResorts from "./pages/admin/AdminResorts";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExplore from "./pages/admin/AdminExplore";
import AdminContacts from "./pages/admin/AdminContacts";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <Route path="/resorts" element={<Rooms />} />
        <Route path="/search" element={<Search />} />
        <Route path="/resort/:id" element={<ResortDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/amenities" element={<Amenities />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="resorts" element={<AdminResorts />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="explore" element={<AdminExplore />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
