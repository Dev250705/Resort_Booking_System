import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 150) {
          // if scrolling down and past the top area
          setShow(false);
        } else {
          // if scrolling up
          setShow(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <header className={`resort-header ${show ? '' : 'hidden'}`}>
      {/* Top Header Contact Info */}
      <div className="top-header-contact">
        <div className="contact-left">
          <div className="contact-item">
            <span className="icon">📧</span>
            <div className="contact-text">
              <span className="contact-title">DROP US A EMAIL:.</span>
              <span className="contact-value">companyname@mail.com</span>
            </div>
          </div>
        </div>

        <div className="center-logo">
          <h1>H</h1>
          <span>RESORT HOTEL</span>
        </div>

        <div className="contact-right">
          <div className="contact-item text-right">
            <div className="contact-text">
              <span className="contact-title">ANY QUESTIONS? CALL US:.</span>
              <span className="contact-value">+91 123-456-780 / +00 987-654-321</span>
            </div>
            <span className="icon">📞</span>
          </div>
        </div>
      </div>

      {/* Main Dark Navbar */}
      <nav className="dark-navbar">
        <ul className="dark-nav-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/rooms">RESORTS</Link></li>
          {token && <li><Link to="/bookings">MY BOOKINGS</Link></li>}
          <li><Link to="/about">ABOUT US</Link></li>
          <li><Link to="/contact">CONTACT</Link></li>
          {token ? (
            <li><a href="#" onClick={handleLogout}>LOGOUT</a></li>
          ) : (
            <li><Link to="/login">LOGIN</Link></li>
          )}
        </ul>
        <button className="nav-search-btn" onClick={() => navigate('/search')}>🔍</button>
      </nav>
    </header>
  );
}
