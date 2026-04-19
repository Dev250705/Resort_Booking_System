import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
  const [selectedResort, setSelectedResort] = useState(null);
  const [searchParams] = useSearchParams();
  const resortId = searchParams.get("resortId");
  const isDetailView = Boolean(resortId);
  const navigate = useNavigate();
  const location = useLocation();
  const searchState = location.state || {};
  const { checkIn: roomsCheckIn, checkOut: roomsCheckOut, guests: roomsGuests, locationQuery } = searchState;

  const filters = ["All", "Luxury", "Deluxe", "Standard", "Economy", "Suite"];

  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        
        const qs = new URLSearchParams();
        if (roomsCheckIn && roomsCheckOut) {
           qs.append('checkIn', roomsCheckIn);
           qs.append('checkOut', roomsCheckOut);
           if (roomsGuests) {
               qs.append('guests', roomsGuests);
               qs.append('rooms', '1');
           }
        }
        const url = qs.toString() 
             ? `http://${window.location.hostname}:5000/api/resorts?${qs.toString()}` 
             : `http://${window.location.hostname}:5000/api/resorts`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch resorts");
        }
        const data = await response.json();

        const getImageUrl = (url) => url?.startsWith('/uploads') ? `http://${window.location.hostname}:5000${url}` : url;
        const mappedData = Array.isArray(data) ? data.map(resort => {
          if (resort.images) resort.images = resort.images.map(getImageUrl);
          if (resort.roomTypes) {
            resort.roomTypes = resort.roomTypes.map(rt => {
               if (rt.images) rt.images = rt.images.map(getImageUrl);
               return rt;
            });
          }
          return resort;
        }) : [];

        if (locationQuery && typeof locationQuery === "string" && locationQuery.trim() !== "") {
            const lowerQ = locationQuery.toLowerCase();
            mappedData = mappedData.filter(r => {
                const n = r.name ? String(r.name).toLowerCase() : "";
                const c = r.location?.city ? String(r.location.city).toLowerCase() : "";
                const s = r.location?.state ? String(r.location.state).toLowerCase() : "";
                return n.includes(lowerQ) || c.includes(lowerQ) || s.includes(lowerQ);
            });
        }

        setResorts(mappedData);
        setFilteredResorts(mappedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching resorts:", err);
        setError("Unable to load rooms. Please try again later. Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResorts();
  }, []);

  useEffect(() => {
    if (!resortId) {
      setSelectedResort(null);
      return;
    }

    const fetchResortDetails = async () => {
      setDetailLoading(true);
      try {
        const qs =
          roomsCheckIn && roomsCheckOut
            ? `?checkIn=${encodeURIComponent(roomsCheckIn)}&checkOut=${encodeURIComponent(roomsCheckOut)}`
            : "";
        const response = await fetch(
          `http://${window.location.hostname}:5000/api/resorts/${resortId}${qs}`
        );
        if (!response.ok) {
          throw new Error("Resort not found");
        }
        const data = await response.json();
        setSelectedResort(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching resort details:", err);
        setError("Unable to load resort details. Please try again later.");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchResortDetails();
  }, [resortId, roomsCheckIn, roomsCheckOut]);

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
    navigate(`/resort/${resortId}`, { state: searchState });
  };

  const getMapQuery = (resort) => {
    if (!resort) return "";
    return [resort.location?.address, resort.location?.city, resort.location?.state]
      .filter(Boolean)
      .join(", ");
  };

  const renderDetailView = () => {
    if (detailLoading) {
      return (
        <div className="gallery-container">
          <Navbar />
          <div className="detail-loading">Loading resort details...</div>
          <Footer />
        </div>
      );
    }

    if (error) {
      return (
        <div className="gallery-container">
          <Navbar />
          <div className="detail-error">{error}</div>
          <Footer />
        </div>
      );
    }

    if (!selectedResort) {
      return (
        <div className="gallery-container">
          <Navbar />
          <div className="detail-error">Resort not found.</div>
          <Footer />
        </div>
      );
    }

    const mapQuery = getMapQuery(selectedResort);
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    return (
      <div className="resort-detail-page">
        <Navbar />
        <section className="detail-hero">
          <div
            className="detail-hero-image"
            style={{
              backgroundImage: `url(${selectedResort.images?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"})`,
            }}
          >
            <div className="detail-hero-overlay"></div>
            <div className="detail-hero-copy">
              <span>Resort Details</span>
              <h1>{selectedResort.name}</h1>
              <p>
                {selectedResort.location?.city || "Unknown city"}
                {selectedResort.location?.state ? `, ${selectedResort.location.state}` : ""}
              </p>
              <button
                type="button"
                className="detail-back-btn"
                onClick={() => navigate("/rooms")}
              >
                Back to Gallery
              </button>
            </div>
          </div>
        </section>

        <section className="detail-summary">
          <div className="detail-main">
            <h2>About this resort</h2>
            <p>{selectedResort.description || "Beautiful resort with curated amenities and exquisite rooms."}</p>

            <div className="detail-meta">
              <div>
                <strong>Rating</strong>
                <p>{selectedResort.rating?.toFixed(1) || "N/A"} ⭐</p>
              </div>
              <div>
                <strong>Room types</strong>
                <p>{selectedResort.roomTypes?.length || 0}</p>
              </div>
              <div>
                <strong>Location</strong>
                <p>{mapQuery || "Location details not available"}</p>
              </div>
            </div>

            {selectedResort.amenities?.length > 0 && (
              <div className="detail-amenities">
                <h3>Amenities</h3>
                <ul>
                  {selectedResort.amenities.map((amenity, idx) => (
                    <li key={idx}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="detail-map">
            <h3>Resort location</h3>
            <iframe
              title="Resort location map"
              width="100%"
              height="320"
              frameBorder="0"
              scrolling="no"
              src={mapSrc}
              allowFullScreen
            />
          </div>
        </section>

        <section className="detail-rooms">
          <h2>Room availability</h2>
          <div className="room-types-grid">
            {selectedResort.roomTypes?.length > 0 ? (
              selectedResort.roomTypes.map((room) => (
                <div className="room-card" key={room._id || room.title}>
                  <h4>{room.title}</h4>
                  <p>{room.description || "Comfortable stay with included amenities."}</p>
                  <div className="room-stats">
                    <span>Guests: {room.maxGuests || "-"}</span>
                    <span>
                      Available:{" "}
                      {room.availableInventory ?? room.inventoryCount ?? "-"}
                      {roomsCheckIn && roomsCheckOut ? " (your dates)" : ""}
                    </span>
                  </div>
                  <div className="room-price">₹{room.basePrice || "-"} / night</div>
                </div>
              ))
            ) : (
              <p>No room types are available for this resort yet.</p>
            )}
          </div>
        </section>

        <section className="detail-gallery">
          <h2>Resort gallery</h2>
          <div className="gallery-images">
            {selectedResort.images?.length > 0 ? (
              selectedResort.images.map((img, index) => (
                <img key={index} src={img} alt={`${selectedResort.name} ${index + 1}`} />
              ))
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
                alt="Resort"
              />
            )}
          </div>
        </section>

        <Footer />
      </div>
    );
  };

  return isDetailView ? renderDetailView() : (
    <div className="gallery-container">
      <Navbar />





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
      <Footer />
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