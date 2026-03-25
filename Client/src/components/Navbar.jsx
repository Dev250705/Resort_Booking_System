import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">StayEase</h1>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="#">Accommodation</Link></li>
        <li><Link to="#">Policy</Link></li>
        <li><Link to="#">Gallery</Link></li>
        <li><Link to="#">About</Link></li>
        <li><Link to="#">Contact</Link></li>
      </ul>

      <div className="auth">
        <Link to="/login">Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </nav>
  );
}