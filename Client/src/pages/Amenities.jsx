import React, { useState, useEffect } from 'react';
import './ExplorePages.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const defaultAmenities = [
  { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=500', title: 'Swimming Pool', desc: 'Olympic-sized infinity pool with temperature control.' },
  { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1540555700392-696668ce01c6?auto=format&fit=crop&q=80&w=500', title: 'Spa & Wellness', desc: 'Rejuvenate your senses with luxury massage and therapies.' },
  { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=500', title: 'Fitness Center', desc: 'State-of-the-art gym equipment and personal trainers.' },
  { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1570535977936-ce47eb5957b4?auto=format&fit=crop&q=80&w=500', title: 'Tennis Court', desc: 'Professional outdoor floodlit tennis courts.' },
  { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1558269784-fb73be5c6e8e?auto=format&fit=crop&q=80&w=500', title: 'Kids Play Zone', desc: 'Safe and engaging indoor and outdoor active play areas.' },
  { _id: '6', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=500', title: 'Concierge Desk', desc: '24/7 premium assistance for all your travel needs.' }
];

export default function Amenities() {
  const [amenities, setAmenities] = useState(defaultAmenities);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/explore?type=amenity`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.content && d.content.length > 0) {
          setAmenities(d.content);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <div className="explore-page-container" style={{ paddingTop: '80px' }}>
        <div className="explore-hero" style={{backgroundImage: `url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=2000')`}}>
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
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
