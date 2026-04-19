import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function isAdminFromToken() {
  const t = sessionStorage.getItem("token")?.trim();
  if (!t) return false;
  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.role === "admin";
  } catch {
    return false;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const isAdmin = isAdminFromToken();

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setShow(false);
        } else {
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
              <span className="contact-value">hresort.stay@mail.com</span>
            </div>
          </div>
        </div>

        <div className="center-logo">
          <h1>H</h1>
          <span>RESORT</span>
        </div>

        <div className="contact-right">
          <div className="contact-item text-right">
            <div className="contact-text">
              <span className="contact-title">ANY QUESTIONS? CALL US:.</span>
              <span className="contact-value">+91 90909 80808 / +91 02692 255555 </span>
            </div>
            <span className="icon">📞</span>
          </div>
        </div>
      </div>

      {/* Main Dark Navbar */}
      <nav className="dark-navbar">
        <ul className="dark-nav-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/resorts">RESORTS</Link></li>

          <li className="nav-dropdown">
            <span className="dropdown-toggle">EXPLORE ▾</span>
            <div className="dropdown-menu">
              <Link to="/gallery">Gallery</Link>
              <Link to="/amenities">Amenities</Link>
              <Link to="/dining">Dining</Link>
            </div>
          </li>
          <li><Link to="/policy">Privacy Policy</Link></li>
          <li><Link to="/about">ABOUT US</Link></li>
          <li><Link to="/contact">CONTACT</Link></li>

        </ul>

        <div className="nav-right-actions">
          <button className="nav-search-btn" onClick={() => navigate('/search')}>SEARCH</button>
          {token ? (
            <div className="nav-dropdown user-dropdown right-side-profile">
              <span 
                className="dropdown-toggle profile-icon-only" 
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard')}
                title="Go to Dashboard"
              >
                <span className="user-icon-round">👤</span>
              </span>
              <div className="dropdown-menu">
                {!isAdmin && (
                  <Link to="/bookings">My Bookings</Link>
                )}
                <a href="#" onClick={handleLogout}>Logout</a>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">LOGIN</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
