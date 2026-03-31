import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./rooms.css";

export default function Rooms() {
   
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const filters = ["All", "Luxury", "Deluxe", "Standard", "Economy", "Suite"];

  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/resorts");
        if (!response.ok) {
          throw new Error("Failed to fetch resorts");
        }
        const data = await response.json();
        setResorts(data);
        setFilteredResorts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching resorts:", err);
        setError("Unable to load rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResorts();
  }, []);

const handleFilterClick = (filter) => {
  setActiveFilter(filter.toLowerCase());

  if (filter.toLowerCase() === "all") {
    setFilteredResorts(resorts);
  } else {
    setFilteredResorts(
      resorts.filter(
        (resort) =>
          resort.category?.toLowerCase() === filter.toLowerCase()
      )
    );
  }
};

  const handleImageClick = (resort) => {
    setSelectedImage(resort);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleBookNow = (resortId) => {
    navigate(`/booking/${resortId}`);
  };

  return (
      <div className="gallery-container">
        <Navbar />;
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="hero-overlayy"></div>
        <div className="hero-content">
          <h1 className="gallery-title">Gallery</h1>
          <p className="gallery-subtitle">IMAGES OF OUR BEAUTIFUL ROOMS & RESORT</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-container">
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  activeFilter === filter.toLowerCase() ? "active" : ""
                }`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="gallery-wrapper">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading gallery...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : filteredResorts.length === 0 ? (
            <div className="no-items-message">
              <p>No rooms found in this category.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredResorts.map((resort, index) => (
                <div
                  key={resort._id}
                  className={`gallery-item ${getGridClass(index)}`}
                  onClick={() => handleImageClick(resort)}
                >
                  <img
                    // src={`http://localhost:3000${resort.images?.[0]}`}
                    src={resort.images?.[0]}
                    alt={resort.name}
                    className="gallery-image"
                  />
                  <div className="gallery-overlay">
                    <div className="overlay-content">
                      <h3 className="overlay-title">{resort.name}</h3>
                      <p className="overlay-price">₹{resort.price}</p>
                      <button
                        className="overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(resort._id);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-image-container">
              <img
                src={`http://localhost:3000${selectedImage.images?.[0]}`}
                alt={selectedImage.name}
                className="modal-image"
              />
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{selectedImage.name}</h2>
              <p className="modal-description">{selectedImage.description}</p>
              
              {selectedImage.amenities && selectedImage.amenities.length > 0 && (
                <div className="modal-amenities">
                  <h4>Amenities</h4>
                  <ul>
                    {selectedImage.amenities.map((amenity, idx) => (
                      <li key={idx}>✓ {amenity}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-details">
                <div className="detail-item">
                  <span className="detail-label">Rating</span>
                  <span className="detail-value">⭐ {selectedImage.rating || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available Rooms</span>
                  <span className="detail-value">{selectedImage.totalRooms || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price per Night</span>
                  <span className="detail-value detail-price">₹{selectedImage.price}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => {
                  handleBookNow(selectedImage._id);
                  closeModal();
                }}>
                  Reserve Now
                </button>
                <button className="btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="gallery-cta">
        <div className="cta-overlay"></div>
        <div className="cta-content">
          <h2>Ready to Experience Luxury?</h2>
          <p>Discover our collection of beautifully designed rooms and suites</p>
          <button className="cta-btn">Explore More</button>
        </div>
      </section>
      <Footer />;
    </div>
  );
}

// Helper function to create varied grid sizes
function getGridClass(index) {
  const pattern = [
    "grid-item-1",
    "grid-item-2",
    "grid-item-3",
    "grid-item-1",
    "grid-item-2",
  ];
  return pattern[index % pattern.length];
}