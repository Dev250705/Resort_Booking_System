import React, { useState, useEffect } from 'react';
import './ExplorePages.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const defaultDining = [
  { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=500', title: 'The Ocean Grill', desc: 'Exquisite seafood varieties by the beach.' },
  { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=500', title: 'Royal Feast', desc: 'Authentic local cuisine and lavish buffet spreads.' },
  { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=500', title: 'Skyline Bar', desc: 'Premium cocktails and spirits with panoramic views.' },
  { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=500', title: 'La Pizzeria', desc: 'Wood-fired authentic Italian pizza and pasta.' },
  { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500', title: 'Coffee Lounge', desc: 'Specialty coffee, pastries, and peaceful ambiance.' },
  { _id: '6', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=500', title: 'In-Room Dining', desc: '24/7 private dining experience in your comfort.' }
];

export default function Dining() {
  const [dining, setDining] = useState(defaultDining);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/explore?type=dining`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.content && d.content.length > 0) {
          setDining(d.content);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <div className="explore-page-container" style={{ paddingTop: '80px' }}>
        <div className="explore-hero" style={{backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=2000')`}}>
          <div className="explore-hero-content">
            <h1>Exquisite Dining</h1>
            <p>Taste the flavors of perfection</p>
          </div>
        </div>

        <div className="explore-grid" style={{ marginBottom: '60px' }}>
          {dining.map(item => (
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
