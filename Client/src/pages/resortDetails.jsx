import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./resortDetails.css";

const Icons = {
  Cross: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Success: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
};

export default function ResortDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkIn, checkOut, guests: searchedGuests } = location.state || {};
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Room Details Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Resort Gallery State
  const [isResortGalleryOpen, setIsResortGalleryOpen] = useState(false);
  const [currentResortImgIdx, setCurrentResortImgIdx] = useState(0);

  // Booking details state (Checkout Drawer)
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [bookSuccess, setBookSuccess] = useState(false);

  useEffect(() => {
    const fetchResort = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/resorts/${id}`);
        if (!response.ok) throw new Error("Resort details not available");
        const data = await response.json();
        
        // Appending 4-5 high-quality mock images so the UI grid layout shows properly
        if (data && (!data.images || data.images.length < 5)) {
           const mockImages = [
             data.images?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
             "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800",
             "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
             "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800",
             "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800"
           ];
           data.images = mockImages;
        }

        setResort(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to load resort details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResort();
    window.scrollTo(0,0);
  }, [id]);

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !selectedRoomToBook) return 0;
    const cin = new Date(checkInDate);
    const cout = new Date(checkOutDate);
    const nights = (cout - cin) / (1000 * 60 * 60 * 24);
    if (nights <= 0) return 0;
    return nights * quantity * selectedRoomToBook.basePrice;
  };

  const handleBookNow = (room) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname + location.search, searchState: location.state } });
      return;
    }
    navigate("/payment", { state: { resort, room, checkIn, checkOut, guests: searchedGuests } });
  };

  const loadRazorpayCore = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      setBookLoading(true);
      setBookError(null);
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      
      const response = await fetch("http://localhost:5000/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
           resortId: id, roomTypeTitle: selectedRoomToBook.title, quantity: parseInt(quantity), checkInDate, checkOutDate, totalGuests: parseInt(guests)
        })
      });
      if (response.status === 401) { navigate("/login"); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to lock room");
      
      const draftBookingId = data.booking._id;
      const amountToPay = data.booking.totalAmount;

      const isScriptLoaded = await loadRazorpayCore();
      if (!isScriptLoaded) throw new Error("Could not load Razorpay Payment Gateway.");

      const orderRes = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ amount: amountToPay, bookingId: draftBookingId })
      });
      
      if (orderRes.status === 401) { navigate("/login"); return; }
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to initiate payment");

      if (orderData.order.id.startsWith("order_MOCK")) {
         setTimeout(async () => {
             const verifyRes = await fetch("http://localhost:5000/api/payments/verify-payment", {
               method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
               body: JSON.stringify({ razorpay_order_id: orderData.order.id, razorpay_payment_id: "pay_MOCK12345", razorpay_signature: "mock", bookingId: draftBookingId })
             });
             const verifyData = await verifyRes.json();
             if (verifyRes.ok && verifyData.success) {
               setBookSuccess(true);
               setBookLoading(false);
               setTimeout(() => navigate("/bookings"), 2500); 
             } else {
               setBookError("Mock payment verification failed.");
             }
         }, 1500);
         return; 
      }

      const razorpayKeyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) throw new Error("Razorpay key missing. Please configure payment keys.");

      const options = {
        key: razorpayKeyId, amount: orderData.order.amount, currency: orderData.order.currency,
        name: resort?.name || "Booking", description: `Booking for ${selectedRoomToBook.title}`, order_id: orderData.order.id,
        handler: async function (paymentResponse) {
          try {
             setBookLoading(true);
             const verifyRes = await fetch("http://localhost:5000/api/payments/verify-payment", {
               method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
               body: JSON.stringify({ ...paymentResponse, bookingId: draftBookingId })
             });
             const verifyData = await verifyRes.json();
             if (verifyRes.ok && verifyData.success) { setBookSuccess(true); setTimeout(() => navigate("/bookings"), 2500); }
             else { setBookError("Payment verification failed."); }
          } catch(err) { setBookError("Network error during verification."); } finally { setBookLoading(false); }
        },
        theme: { color: "#f7a02d" }
      };

      const razorpayObj = new window.Razorpay(options);
      razorpayObj.on('payment.failed', function (res){ setBookError(res.error.description || "Payment Failed."); });
      razorpayObj.open();
      
    } catch (err) {
      setBookError(err.message);
    } finally {
      if(!bookSuccess && !String(bookError).includes("MOCK")) setBookLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resort-detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px", marginTop: "120px" }}>Loading resort details...</div>
        <Footer />
      </div>
    );
  }

  if (error || !resort) {
    return (
      <div className="resort-detail-page">
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px", marginTop: "120px", color: "red" }}>{error || "Resort not found."}</div>
        <Footer />
      </div>
    );
  }

  const mapQuery = [resort.location?.address, resort.location?.city, resort.location?.state]
    .filter(Boolean)
    .join(", ");
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || "Luxury Resort")}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const openRoomModal = (room) => {
    setSelectedRoom(room);
    setCurrentImageIdx(0);
    setIsModalOpen(true);
  };

  const closeRoomModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const nextImg = () => {
    if (!selectedRoom?.images) return;
    setCurrentImageIdx((prev) => (prev + 1) % selectedRoom.images.length);
  };

  const prevImg = () => {
    if (!selectedRoom?.images) return;
    setCurrentImageIdx((prev) => (prev - 1 + selectedRoom.images.length) % selectedRoom.images.length);
  };

  const nextResortImg = () => {
    if (!resort?.images) return;
    setCurrentResortImgIdx((prev) => (prev + 1) % resort.images.length);
  };

  const prevResortImg = () => {
    if (!resort?.images) return;
    setCurrentResortImgIdx((prev) => (prev - 1 + resort.images.length) % resort.images.length);
  };

  return (
    <div className="resort-detail-page">
      <Navbar />

      <section className="resort-premium-header">
        <div className="resort-header-text">
          <div className="rh-badge">Premium Resort</div>
          <h1>{resort.name}</h1>
          <p className="resort-location-text">📍 {mapQuery}</p>
        </div>
        <div className={`resort-gallery-grid count-${Math.min(resort.images?.length || 1, 3)}`}>
          <div className="gallery-main-img" onClick={() => { setCurrentResortImgIdx(0); setIsResortGalleryOpen(true); }}>
            <img 
              src={resort.images?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"} 
              alt="Resort View" 
            />
          </div>
          {(resort.images?.length > 1) && (
            <div className="gallery-side-imgs">
              <div className="side-img" onClick={() => { setCurrentResortImgIdx(1); setIsResortGalleryOpen(true); }}>
                <img src={resort.images[1]} alt="Resort View 2" />
              </div>
              {resort.images?.length > 2 && (
                <div className="side-img" onClick={() => { setCurrentResortImgIdx(2); setIsResortGalleryOpen(true); }}>
                  <img src={resort.images[2]} alt="Resort View 3" />
                </div>
              )}
            </div>
          )}
          <div className="gallery-overlay-btn" onClick={() => setIsResortGalleryOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Show all photos</span>
          </div>
        </div>
      </section>

      <div className="detail-content-wrapper">
        <section className="resort-info-section">
          <div className="info-block">
            <h2>About The Property</h2>
            <p className="resort-desc-text">
              {resort.description || "Escape to this luxury resort offering breathtaking views, modern amenities, and world-class service. Perfect for both relaxation and adventure."}
            </p>

            {resort.amenities?.length > 0 && (
              <>
                <h3 style={{ marginTop: "30px", marginBottom: "20px" }}>Amenities</h3>
                <div className="resort-amenities-list">
                  {resort.amenities.map((amenity, idx) => (
                    <div className="am-badge" key={idx}>
                      <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="go-map-container">
            <iframe title="Resort map" frameBorder="0" src={mapSrc} allowFullScreen />
            <div className="map-overlay-text">
              Location Map
            </div>
          </div>
        </section>

        <section className="rooms-list-container">
          <h2>Available Rooms</h2>
          <div className="rooms-grid">
            {resort.roomTypes?.length > 0 ? (
              resort.roomTypes.map((room) => (
                <div className="room-card" key={room._id || room.title}>
                  <div className="room-card-image" onClick={() => openRoomModal(room)}>
                    <img src={room.images?.[0] || resort.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800"} alt={room.title} />
                    <div className="view-photos-tag">View Gallery</div>
                  </div>
                  
                  <div className="room-card-content">
                    <h3 className="room-card-title">{room.title}</h3>
                    
                    <div className="room-card-specs">
                      <span><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg> {room.maxGuests || 2} Guests</span>
                      <span><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z" /></svg> {room.size || 224} sq.ft</span>
                    </div>

                    <div className="rooms-left-badge" style={{color: '#d9534f', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px'}}>
                      <span style={{display: 'inline-block', width: '8px', height: '8px', background: '#d9534f', borderRadius: '50%'}}></span>
                      Only {room.inventoryCount || 2} room{room.inventoryCount === 1 ? '' : 's'} left at this price
                    </div>

                    <div className="room-card-footer">
                      <div className="room-card-price">
                        <strong>₹{(room.basePrice || 0).toLocaleString()}</strong>
                        <span>+ ₹{Math.round(room.basePrice * 0.18).toLocaleString()} taxes/night</span>
                      </div>
                      <button className="book-room-btn" onClick={() => handleBookNow(room)}>Select Room</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-rooms-msg">No room types available for this resort.</div>
            )}
           </div>
        </section>
      </div>

      {/* Room Details Modal */}
      {isModalOpen && selectedRoom && (
        <div className="go-modal-overlay" onClick={closeRoomModal}>
          <div className="go-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="go-modal-header">
              <h2>{selectedRoom.title}</h2>
              <button className="go-modal-close" onClick={closeRoomModal}>&times;</button>
            </div>

            <div className="go-modal-body">
              <div className="go-modal-carousel">
                <img src={selectedRoom.images?.[currentImageIdx] || resort.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39"} alt="Room" />
                <button className="go-m-slider-btn left" onClick={prevImg}>&#10094;</button>
                <button className="go-m-slider-btn right" onClick={nextImg}>&#10095;</button>
              </div>

              <div className="go-modal-specs">
                <div className="spec-item">
                  <span className="spec-icon">🛁</span>
                  <span className="spec-text">Private Bathroom with luxury toiletries</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">❄️</span>
                  <span className="spec-text">Central Air Conditioning</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📺</span>
                  <span className="spec-text">55" Smart Flat-screen TV</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📶</span>
                  <span className="spec-text">High-Speed Free WiFi</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">☕</span>
                  <span className="spec-text">Premium Coffee Maker</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">🛏️</span>
                  <span className="spec-text">King Size Cloud Bed</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">🛎️</span>
                  <span className="spec-text">24/7 Room Service</span>
                </div>
                {selectedRoom.maxGuests && (
                  <div className="spec-item">
                    <span className="spec-icon">👪</span>
                    <span className="spec-text">Accommodates up to {selectedRoom.maxGuests} Guests</span>
                  </div>
                )}
              </div>

              <div className="go-modal-section">
                <h3>Room Features</h3>
                <p className="go-modal-desc">{selectedRoom.description || "This luxurious room offers premium comfort, stunning views, and top-tier amenities to ensure a relaxing stay."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resort Gallery Modal */}
      {isResortGalleryOpen && resort && (
        <div className="go-modal-overlay" onClick={() => setIsResortGalleryOpen(false)}>
          <div className="go-modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="go-modal-header">
              <h2>Property Photos</h2>
              <button className="go-modal-close" onClick={() => setIsResortGalleryOpen(false)}>&times;</button>
            </div>

            <div className="go-modal-body">
              <div className="resort-photos-grid">
                {resort.images?.map((img, idx) => (
                  <div className="grid-photo-item" key={idx}>
                    <img src={img} alt={`Resort View ${idx + 1}`} />
                  </div>
                ))}
                {(!resort.images || resort.images.length === 0) && (
                  <div className="grid-photo-item">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Resort View" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Side Drawer */}
      {showDrawer && selectedRoomToBook && (
        <div className="dr-drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="dr-drawer" onClick={e => e.stopPropagation()}>
            <div className="dr-dw-header">
              <h3>Confirm Booking</h3>
              <button className="dr-dw-close" onClick={() => setShowDrawer(false)}><Icons.Cross/></button>
            </div>

            {bookSuccess ? (
              <div className="dr-dw-success">
                <Icons.Success />
                <h4>Booking Secured</h4>
                <p>Redirecting to your confirmations...</p>
              </div>
            ) : (
              <form className="dr-dw-form" onSubmit={submitBooking}>
                <div className="dr-dw-room-preview">
                  <img src={selectedRoomToBook.images?.[0] || resort.images?.[0]} alt="Room preview" />
                  <div>
                    <strong>{selectedRoomToBook.title}</strong>
                    <span>₹{selectedRoomToBook.basePrice.toLocaleString()} / night</span>
                  </div>
                </div>

                {bookError && <div className="dr-dw-error">{bookError}</div>}
                
                <div className="dr-dw-row">
                  <div className="dr-dw-input">
                    <label>Check-in</label>
                    <input type="date" required value={checkInDate} min={new Date().toISOString().split("T")[0]} onChange={e => setCheckInDate(e.target.value)} />
                  </div>
                  <div className="dr-dw-input">
                    <label>Check-out</label>
                    <input type="date" required value={checkOutDate} min={checkInDate || new Date().toISOString().split("T")[0]} onChange={e => setCheckOutDate(e.target.value)} />
                  </div>
                </div>

                <div className="dr-dw-row">
                  <div className="dr-dw-input">
                    <label>Rooms</label>
                    <div className="dr-stepper">
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
                      <input type="number" value={quantity} readOnly />
                      <button type="button" onClick={() => setQuantity(q => Math.min(selectedRoomToBook.inventoryCount || 10, q+1))}>+</button>
                    </div>
                  </div>
                  <div className="dr-dw-input">
                    <label>Guests</label>
                    <div className="dr-stepper">
                      <button type="button" onClick={() => setGuests(g => Math.max(1, g-1))}>-</button>
                      <input type="number" value={guests} readOnly />
                      <button type="button" onClick={() => setGuests(g => Math.min((selectedRoomToBook.maxGuests || 4) * quantity, g+1))}>+</button>
                    </div>
                  </div>
                </div>

                <div className="dr-dw-summary">
                  <div className="sum-row">
                    <span>Base Price ({quantity} room)</span>
                    <span>₹{(selectedRoomToBook.basePrice * quantity).toLocaleString()}</span>
                  </div>
                  <div className="sum-row">
                    <span>Taxes & Fees</span>
                    <span>₹{Math.round((calculateTotal() * 0.18)).toLocaleString()}</span>
                  </div>
                  <div className="sum-total">
                    <span>Total Amount</span>
                    <strong>₹{calculateTotal() > 0 ? (calculateTotal() + Math.round((calculateTotal() * 0.18))).toLocaleString() : 0}</strong>
                  </div>
                </div>

                <button type="submit" className="dr-dw-submit" disabled={bookLoading || calculateTotal() <= 0}>
                  {bookLoading ? 'Processing Request...' : 'Proceed to Payment (Razorpay)'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
