import React, { useState, useEffect } from 'react';
import './ExplorePages.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Amenities() {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/explore?type=amenity`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.content) {
          setAmenities(d.content);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <div className="explore-page-container" style={{ paddingTop: '80px' }}>
        <div className="explore-hero" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=2000')` }}>
          <div className="explore-hero-content">
            <h1>Premium Amenities</h1>
            <p>Experience world-class luxury & comfort</p>
          </div>
        </div>

        <div className="explore-grid" style={{ marginBottom: '60px' }}>
          {amenities.map(item => (
            <div key={item._id || item.id} className="explore-card">
              <img src={item.imageUrl?.startsWith('/uploads') ? `http://${window.location.hostname}:5000${item.imageUrl}` : item.imageUrl} alt={item.title} className="explore-card-img" />
              <div className="explore-card-body">
                <h3>{item.title}</h3>
                <p>{item.description || item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
