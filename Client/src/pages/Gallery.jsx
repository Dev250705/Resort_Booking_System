import React, { useState, useEffect } from 'react';
import './ExplorePages.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/explore?type=gallery`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.content) {
          setPhotos(d.content);
        }
      })
      .catch(console.error);
  }, []);

  const displayedPhotos = showAll ? photos : photos.slice(0, 12);

  return (
    <>
      <Navbar />
      <div className="explore-page-container" style={{ paddingTop: '80px' }}>
        <div className="explore-hero" style={{backgroundImage: `url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2000')`}}>
          <div className="explore-hero-content">
            <h1>Our Gallery</h1>
            <p>A Glimpse into Paradise</p>
          </div>
        </div>
        
        <div className="gallery-grid" style={{ marginTop: '20px', marginBottom: '40px' }}>
          {displayedPhotos.map(photo => (
            <div key={photo._id || photo.id} className="gallery-item">
              <img src={photo.imageUrl?.startsWith('/uploads') ? `http://${window.location.hostname}:5000${photo.imageUrl}` : photo.imageUrl} alt={photo.title} />
              <div className="gallery-caption">
                <h4>{photo.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {!showAll && photos.length > 12 && (
          <div className="view-all-container" style={{ paddingBottom: '40px' }}>
            <button className="btn-view-all" onClick={() => setShowAll(true)}>
              View All Photos
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
