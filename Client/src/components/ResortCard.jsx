import { Link } from "react-router-dom";
import "./ResortCard.css";

export default function ResortCard({ resort }) {
  const price = resort.roomTypes?.[0]?.basePrice || resort.price || 0;
  
  return (
    <div className="card">
      <div className="card-img-container">
        <img 
          src={resort.images?.[0] ? (resort.images[0].startsWith('http') ? resort.images[0] : `http://${window.location.hostname}:5000${resort.images[0]}`) : "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600"} 
          alt={resort.name} 
        />
        <div className="card-price-badge">
          ₹{price} <span className="text-small">/night</span>
        </div>
      </div>
      
      <div className="card-content">
        <h3>{resort.name}</h3>
        <p className="resort-location">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {resort.location?.city || 'Location unavailable'}
        </p>
        <div className="card-bottom">
          <span className="card-rating">⭐ {resort.rating?.toFixed(1) || "5.0"}</span>
          <Link to={`/resort/${resort._id}`} className="card-book-btn">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}