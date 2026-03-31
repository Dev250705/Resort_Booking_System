import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      {/* NEWSLETTER SECTION */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2>Subscribe to news, offers & announcements</h2>
          <button className="newsletter-btn">Newsletter Sign Up</button>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <div className="footer-main">
        <div className="footer-container">
          {/* LOGO & SOCIAL */}
          <div className="footer-brand">
            <h3 className="footer-logo">StayEase</h3>
            <p className="brand-tagline">Luxury Resort Booking Platform</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="footer-section">
            <h4 className="section-title">Tourism Services</h4>
            <article className="contact-block">
              <h5>Asia Region</h5>
              <p className="contact-detail">📍 Islamabad Office, Pakistan</p>
              <p className="contact-detail">📞 +92 51 287 4000</p>
              <p className="contact-detail">📧 sales@stayease.pk</p>
            </article>
            <article className="contact-block">
              <h5>Africa Region</h5>
              <p className="contact-detail">📍 Nairobi Office, Kenya</p>
              <p className="contact-detail">📞 +254 732 123 333</p>
              <p className="contact-detail">📧 support@stayease.com</p>
            </article>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-section">
            <h4 className="section-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="#">Destinations</Link></li>
              <li><Link to="#">Gallery</Link></li>
              <li><Link to="/policy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* COMPANY INFO */}
          <div className="footer-section">
            <h4 className="section-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#">Careers</a></li>
              <li><a href="#">Tour Operators</a></li>
              <li><a href="#">Governance</a></li>
              <li><a href="#">Press Centre</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Sustainability</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="footer-bottom">
        <p className="copyright">© 2026 StayEase | Made By Professional Developers</p>
        <div className="footer-bottom-links">
          <Link to="/policy">Privacy Policy</Link>
          <span className="separator">•</span>
          <a href="#">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}