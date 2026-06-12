import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const currentPath = location.pathname;
  const token = sessionStorage.getItem("token");
  const isAdmin = isAdminFromToken();

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  // Universal scroll event detector (supports window and inner container scrolling)
  useEffect(() => {
    const controlNavbar = (e) => {
      // 1. Check if window is scrolling or any inner container is scrolling
      let currentScroll = window.scrollY;
      if (e && e.target && e.target !== document && e.target.scrollTop !== undefined) {
        currentScroll = e.target.scrollTop;
      }

      console.log("SCROLL TRIGGERED! Y:", currentScroll, "Last Y:", lastScrollY);

      if (menuOpen) return;

      if (currentScroll > lastScrollY && currentScroll > 80) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(currentScroll);
    };

    // Use capturing (third argument 'true') to catch scroll events from any inner div
    window.addEventListener('scroll', controlNavbar, true);
    return () => {
      window.removeEventListener('scroll', controlNavbar, true);
    };
  }, [lastScrollY, menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setExploreOpen(false);
  }, [location]);

  return (
    <header className={`resort-header ${show ? '' : 'hidden'}`}>
      <div className="top-header-contact">
        <div className="contact-left">
          <div className="contact-item">
            <span className="icon">📧</span>
            <div className="contact-text">
              <span className="contact-title">DROP US AN EMAIL:</span>
              <span className="contact-value">hresort.stay@gmail.com</span>
            </div>
          </div>
        </div>

        <Link to="/" className="center-logo">
          <h1>H</h1>
          <span>RESORT</span>
        </Link>

        <div className="contact-right">
          <div className="contact-item text-right">
            <div className="contact-text">
              <span className="contact-title">ANY QUESTIONS? CALL US:</span>
              <span className="contact-value">
                +91 90909 80808 / +91 02692 255555{" "}
              </span>
            </div>
            <span className="icon">📞</span>
          </div>
        </div>
      </div>

      <nav className="dark-navbar">
        <button
          className={`hamburger-btn ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <Link to="/" className="mobile-logo">
          <h1>H</h1>
          <span>RESORT</span>
        </Link>

        <ul className={`dark-nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link
              to="/"
              className={
                currentPath === "/" || currentPath === "/home" ? "active" : ""
              }
            >
              HOME
            </Link>
          </li>
          <li>
            <Link
              to="/resorts"
              className={currentPath.startsWith("/resort") ? "active" : ""}
            >
              RESORTS
            </Link>
          </li>

          <li className={`nav-dropdown ${exploreOpen ? "mobile-open" : ""}`}>
            <span
              className={`dropdown-toggle ${["/gallery", "/amenities", "/dining"].includes(currentPath) ? "active" : ""}`}
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault();
                  setExploreOpen(!exploreOpen);
                }
              }}
            >
              EXPLORE ▾
            </span>
            <div className="dropdown-menu">
              <Link
                to="/gallery"
                className={currentPath === "/gallery" ? "active" : ""}
              >
                Gallery
              </Link>
              <Link
                to="/amenities"
                className={currentPath === "/amenities" ? "active" : ""}
              >
                Amenities
              </Link>
              <Link
                to="/dining"
                className={currentPath === "/dining" ? "active" : ""}
              >
                Dining
              </Link>
            </div>
          </li>
          <li>
            <Link
              to="/policy"
              className={currentPath === "/policy" ? "active" : ""}
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={currentPath === "/about" ? "active" : ""}
            >
              ABOUT US
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={currentPath === "/contact" ? "active" : ""}
            >
              CONTACT
            </Link>
          </li>

          <li className="mobile-contact-info">
            <div className="mobile-contact-item">
              <span className="icon">📧</span>
              <a href="mailto:hresort.stay@gmail.com">
                hresort.stay@gmail.com
              </a>
            </div>
            <div className="mobile-contact-item">
              <span className="icon">📞</span>
              <a href="tel:+919090980808">+91 90909 80808</a>
            </div>
          </li>
        </ul>

        <div className="nav-right-actions">
          <button
            className="nav-search-btn"
            onClick={() => navigate("/search")}
            title="Search"
          >
            <span className="search-text-desktop">SEARCH</span>
            <span className="search-icon-mobile">🔍</span>
          </button>
          <div className="nav-user-slot">
            {token ? (
              <div className="nav-dropdown user-dropdown right-side-profile">
                <span
                  className="dropdown-toggle profile-icon-only"
                  onClick={() =>
                    navigate(isAdmin ? "/admin/dashboard" : "/user/dashboard")
                  }
                  title="Go to Dashboard"
                >
                  <span className="user-icon-mobile">👤</span>
                </span>

                <div className="dropdown-menu">
                  {!isAdmin && <Link to="/bookings">My Bookings</Link>}
                  <a href="#" onClick={handleLogout}>
                    Logout
                  </a>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn">
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}