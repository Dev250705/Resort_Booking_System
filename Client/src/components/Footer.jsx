import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>StayEase</h2>
          <p>Book your perfect resort easily.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="#">Accommodation</Link></li>
            <li><Link to="#">Policy</Link></li>
            <li><Link to="#">Gallery</Link></li>
            <li><Link to="#">About</Link></li>
            <li><Link to="#">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@stayease.com</p>
          <p>Phone: +91 99999 99999</p>
        </div>

      </div>

      <p className="copyright">© 2026 StayEase</p>

    </footer>
  );
}