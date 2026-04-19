import React, { useState, useEffect } from 'react';
import './ExplorePages.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const defaultPhotos = [
  { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800', title: 'Luxury Poolside' },
  { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800', title: 'Ocean View Resort' },
  { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', title: 'Private Villa' },
  { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800', title: 'Tropical Paradise' },
  { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800', title: 'Resort Evening' },
  { _id: '6', imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800', title: 'Beachfront Relaxing' },
  { _id: '7', imageUrl: 'https://images.unsplash.com/photo-1618140052121-39fc6db33972?auto=format&fit=crop&q=80&w=800', title: 'Cozy Room' },
  { _id: '8', imageUrl: 'https://images.unsplash.com/photo-1512626120412-faf41adb4874?auto=format&fit=crop&q=80&w=800', title: 'Spa & Wellness' },
  { _id: '9', imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800', title: 'Pool Party' },
  { _id: '10', imageUrl: 'https://images.unsplash.com/photo-1533898840698-c11516eef247?auto=format&fit=crop&q=80&w=800', title: 'Dining by the Sea' },
  { _id: '11', imageUrl: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=800', title: 'Sunset Views' },
  { _id: '12', imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=800', title: 'Maldives Overwater' }
];

export default function Gallery() {
  const [photos, setPhotos] = useState(defaultPhotos);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/explore?type=gallery`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.content && d.content.length > 0) {
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
