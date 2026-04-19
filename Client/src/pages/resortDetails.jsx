import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Heart } from 'lucide-react';
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
  const { guests: searchedGuests } = location.state || {};

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [searchDates, setSearchDates] = useState({
    checkIn: location.state?.checkIn || today,
    checkOut: location.state?.checkOut || tomorrow,
    guests: searchedGuests || 2
  });
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.user && data.user.wishlist) {
          setIsWishlisted(data.user.wishlist.includes(id));
        }
      } catch (err) { }
    };
    fetchWishlistStatus();
  }, [id]);

  const toggleWishlist = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/resort/${id}` } });
      return;
    }
    setIsWishlistLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resortId: id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.wishlist.includes(id));
      }
    } catch (err) { }
    finally {
      setIsWishlistLoading(false);
    }
  };

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

  const [reviewsBlock, setReviewsBlock] = useState({
    loading: true,
    reviews: [],
    averageRating: null,
    reviewCount: 0,
    error: null,
  });

  const [reviewWrite, setReviewWrite] = useState({
    loading: true,
    eligible: false,
    bookingId: null,
    pendingReview: false,
  });
  const [rwRating, setRwRating] = useState(5);
  const [rwComment, setRwComment] = useState("");
  const [rwError, setRwError] = useState("");
  const [rwSubmitting, setRwSubmitting] = useState(false);

  const loadReviewsData = useCallback(async () => {
    if (!id) return;
    setReviewsBlock((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetch(`http://localhost:5000/api/reviews/resort/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed to load reviews");
      setReviewsBlock({
        loading: false,
        reviews: d.reviews || [],
        averageRating: d.averageRating,
        reviewCount: d.reviewCount ?? 0,
        error: null,
      });
    } catch (e) {
      setReviewsBlock({
        loading: false,
        reviews: [],
        averageRating: null,
        reviewCount: 0,
        error: e.message || "Could not load reviews",
      });
    }
  }, [id]);

  const loadReviewEligibility = useCallback(async () => {
    if (!id) return;
    const token = sessionStorage.getItem("token")?.trim();
    if (!token) {
      setReviewWrite({
        loading: false,
        eligible: false,
        bookingId: null,
        pendingReview: false,
      });
      return;
    }
    setReviewWrite((s) => ({ ...s, loading: true }));
    try {
      const r = await fetch(`http://localhost:5000/api/reviews/eligibility/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (r.status === 401) {
        setReviewWrite({
          loading: false,
          eligible: false,
          bookingId: null,
          pendingReview: false,
        });
        return;
      }
      setReviewWrite({
        loading: false,
        eligible: Boolean(d.eligible && d.bookingId),
        bookingId: d.bookingId || null,
        pendingReview: Boolean(d.pendingReview),
      });
    } catch {
      setReviewWrite({
        loading: false,
        eligible: false,
        bookingId: null,
        pendingReview: false,
      });
    }
  }, [id]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  useEffect(() => {
    loadReviewEligibility();
  }, [loadReviewEligibility]);

  const submitResortPageReview = async (e) => {
    e.preventDefault();
    if (!reviewWrite.bookingId) return;
    setRwError("");
    const text = rwComment.trim();
    if (text.length < 3) {
      setRwError("Please write at least 3 characters.");
      return;
    }
    const token = sessionStorage.getItem("token")?.trim();
    if (!token) {
      navigate("/login", { state: { from: `/resort/${id}` } });
      return;
    }
    setRwSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reviewWrite.bookingId,
          rating: rwRating,
          comment: text,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        navigate("/login", { state: { from: `/resort/${id}` } });
        return;
      }
      if (!response.ok) throw new Error(data.message || "Could not submit review");
      setRwComment("");
      setRwRating(5);
      await loadReviewsData();
      await loadReviewEligibility();
      alert(data.message || "Thank you! Your review has been published.");
    } catch (err) {
      setRwError(err.message);
    } finally {
      setRwSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchResort = async () => {
      try {
        setLoading(true);
        const qs =
          searchDates.checkIn && searchDates.checkOut
            ? `?checkIn=${encodeURIComponent(searchDates.checkIn)}&checkOut=${encodeURIComponent(searchDates.checkOut)}`
            : "";
        const response = await fetch(
          `http://localhost:5000/api/resorts/${id}${qs}`
        );
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
    window.scrollTo(0, 0);
  }, [id, searchDates.checkIn, searchDates.checkOut]);

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !selectedRoomToBook) return 0;
    const cin = new Date(checkInDate);
    const cout = new Date(checkOutDate);
    const nights = (cout - cin) / (1000 * 60 * 60 * 24);
    if (nights <= 0) return 0;
    return nights * quantity * selectedRoomToBook.basePrice;
  };

  /** No rooms left for selected dates, or property has zero inventory of this type */
  const isRoomSoldOut = (room) => {
    if (searchDates.checkIn && searchDates.checkOut) {
      return (room.availableInventory ?? 0) <= 0;
    }
    return (room.inventoryCount ?? 0) <= 0;
  };

  const handleBookNow = (room) => {
    if (!searchDates.checkIn || !searchDates.checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (searchDates.checkIn === searchDates.checkOut) {
      alert("Enter valid dates: Check-in and Check-out cannot be the same day.");
      return;
    }
    const checkInD = new Date(searchDates.checkIn);
    const checkOutD = new Date(searchDates.checkOut);
    if (checkOutD <= checkInD) {
      alert("Enter valid dates: Check-out must be logically after Check-in.");
      return;
    }
    if (isRoomSoldOut(room)) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname + location.search, searchState: location.state } });
      return;
    }
    navigate("/payment", { state: { resort, room, checkIn: searchDates.checkIn, checkOut: searchDates.checkOut, guests: searchDates.guests } });
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
      const token = sessionStorage.getItem("token");
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
          } catch (err) { setBookError("Network error during verification."); } finally { setBookLoading(false); }
        },
        theme: { color: "#f7a02d" }
      };

      const razorpayObj = new window.Razorpay(options);
      razorpayObj.on('payment.failed', function (res) { setBookError(res.error.description || "Payment Failed."); });
      razorpayObj.open();

    } catch (err) {
      setBookError(err.message);
    } finally {
      if (!bookSuccess && !String(bookError).includes("MOCK")) setBookLoading(false);
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
  const authToken = sessionStorage.getItem("token")?.trim() ?? "";

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{resort.name}</h1>
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: isWishlisted ? '#fee2e2' : '#f1f5f9',
                transition: 'all 0.2s ease',
              }}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={24}
                color={isWishlisted ? '#ef4444' : '#64748b'}
                fill={isWishlisted ? '#ef4444' : 'none'}
              />
            </button>
          </div>
          <p className="resort-location-text">📍 {mapQuery}</p>
          {!reviewsBlock.loading && reviewsBlock.reviewCount > 0 && (
            <p className="resort-review-summary" aria-label="Guest rating summary">
              <span className="rrs-stars" aria-hidden>
                {"★".repeat(Math.round(reviewsBlock.averageRating || 0))}
                {"☆".repeat(5 - Math.round(reviewsBlock.averageRating || 0))}
              </span>
              <span className="rrs-num">{reviewsBlock.averageRating?.toFixed(1)}</span>
              <span className="rrs-count">
                ({reviewsBlock.reviewCount} guest{reviewsBlock.reviewCount === 1 ? "" : "s"})
              </span>
            </p>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Available Rooms</h2>

            <div style={{ display: 'flex', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={searchDates.checkIn}
                  onChange={e => setSearchDates(s => ({ ...s, checkIn: e.target.value }))}
                  style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Check-out</label>
                <input
                  type="date"
                  min={searchDates.checkIn || today}
                  value={searchDates.checkOut}
                  onChange={e => setSearchDates(s => ({ ...s, checkOut: e.target.value }))}
                  style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>

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

                    {room.amenities && room.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {room.amenities.map((feat, idx) => (
                          <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', color: '#475569', fontSize: '11px', fontWeight: '600' }}>{feat}</span>
                        ))}
                      </div>
                    )}

                    <div className="rooms-left-badge" style={{ color: '#d9534f', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#d9534f', borderRadius: '50%' }}></span>
                      {searchDates.checkIn && searchDates.checkOut ? (
                        <>
                          {(room.availableInventory ?? room.inventoryCount ?? 0)} room
                          {(room.availableInventory ?? room.inventoryCount ?? 0) === 1 ? "" : "s"} available for your dates
                        </>
                      ) : (
                        <>
                          {room.inventoryCount ?? 2} room{(room.inventoryCount ?? 2) === 1 ? "" : "s"} total
                        </>
                      )}
                    </div>

                    <div className="room-card-footer">
                      <div className="room-card-price">
                        <strong>₹{(room.basePrice || 0).toLocaleString()}</strong>
                        <span>+ ₹{Math.round(room.basePrice * 0.18).toLocaleString()} taxes/night</span>
                      </div>
                      <button
                        type="button"
                        className="book-room-btn"
                        disabled={isRoomSoldOut(room)}
                        onClick={() => handleBookNow(room)}
                      >
                        {isRoomSoldOut(room) ? "Sold out" : "Select Room"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-rooms-msg">No room types available for this resort.</div>
            )}
          </div>
        </section>

        <section className="resort-reviews-section" aria-labelledby="guest-reviews-heading">
          <div className="resort-review-write-card">
            <h2 className="review-write-title">Reviews</h2>
            <p className="review-write-sub">
              Everyone can read <strong>approved</strong> guest reviews below. Sign in to submit your
              own after a completed stay — new reviews are checked by our team before they appear
              publicly.
            </p>

            {!reviewWrite.loading && reviewWrite.pendingReview && (
              <p className="review-pending-banner" role="status">
                Thanks — your review is <strong>waiting for admin approval</strong>. It will show here
                once approved.
              </p>
            )}

            {!reviewWrite.loading && !authToken && (
              <div className="review-guest-cta">
                <p className="review-guest-note">
                  Sign in to rate this resort after your visit. Submission is only available to guests
                  with a completed stay.
                </p>
                <Link
                  className="review-signin-btn"
                  to="/login"
                  state={{ from: `/resort/${id}` }}
                >
                  Sign in to submit a review
                </Link>
              </div>
            )}

            {!reviewWrite.loading &&
              authToken &&
              !reviewWrite.eligible &&
              !reviewWrite.pendingReview && (
                <p className="review-policy-inline">
                  You can submit a review here after a <strong>confirmed</strong> stay at this resort,
                  once check-out has passed (11:00 AM on your check-out day).
                </p>
              )}

            {!reviewWrite.loading && reviewWrite.eligible && reviewWrite.bookingId && (
              <form className="review-write-form" onSubmit={submitResortPageReview}>
                <h3 className="review-form-inner-title">Write your review</h3>
                <label className="review-write-label">Rating</label>
                <div className="review-write-stars" role="group" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`review-write-star ${n <= rwRating ? "on" : ""}`}
                      onClick={() => setRwRating(n)}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <label className="review-write-label" htmlFor="resort-review-comment">
                  Your review
                </label>
                <textarea
                  id="resort-review-comment"
                  className="review-write-textarea"
                  rows={4}
                  value={rwComment}
                  onChange={(e) => setRwComment(e.target.value)}
                  placeholder="What did you love? Anything others should know?"
                  maxLength={2000}
                  required
                />
                {rwError && <p className="review-write-error">{rwError}</p>}
                <button type="submit" className="review-write-submit" disabled={rwSubmitting}>
                  {rwSubmitting ? "Submitting…" : "Submit for approval"}
                </button>
              </form>
            )}
          </div>

          <h3 id="guest-reviews-heading" className="guest-reviews-heading">
            Guest reviews
          </h3>
          {reviewsBlock.loading && (
            <p className="reviews-loading">Loading reviews…</p>
          )}
          {!reviewsBlock.loading && reviewsBlock.error && (
            <p className="reviews-error">{reviewsBlock.error}</p>
          )}
          {!reviewsBlock.loading && !reviewsBlock.error && reviewsBlock.reviewCount === 0 && (
            <p className="reviews-empty">
              No published reviews yet. Approved guest reviews will appear here.
            </p>
          )}
          {!reviewsBlock.loading && !reviewsBlock.error && reviewsBlock.reviewCount > 0 && (
            <>
              <div className="reviews-summary-bar">
                <span className="reviews-avg">{reviewsBlock.averageRating?.toFixed(1)}</span>
                <span className="reviews-avg-stars">
                  {"★".repeat(Math.round(reviewsBlock.averageRating || 0))}
                  {"☆".repeat(5 - Math.round(reviewsBlock.averageRating || 0))}
                </span>
                <span className="reviews-total">
                  Based on {reviewsBlock.reviewCount} verified stay
                  {reviewsBlock.reviewCount === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="reviews-list">
                {reviewsBlock.reviews.map((rev) => (
                  <li key={rev._id} className="review-card">
                    <div className="review-card-top">
                      <strong className="review-author">{rev.userName}</strong>
                      <span className="review-stars" aria-label={`${rev.rating} out of 5`}>
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <time className="review-date" dateTime={rev.createdAt}>
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <p className="review-text">{rev.comment}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
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

              <h3>Room Features</h3><br></br>
              <div className="go-modal-specs">
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                  selectedRoom.amenities.map((feat, idx) => {
                    const t = feat.toLowerCase();
                    let icon = '✨';
                    if (t.includes('wifi') || t.includes('internet')) icon = '📶';
                    else if (t.includes('tv') || t.includes('television')) icon = '📺';
                    else if (t.includes('ac') || t.includes('air conditioning') || t.includes('cool')) icon = '❄️';
                    else if (t.includes('bath') || t.includes('shower') || t.includes('toiletries')) icon = '🛁';
                    else if (t.includes('coffee') || t.includes('tea')) icon = '☕';
                    else if (t.includes('bed')) icon = '🛏️';
                    else if (t.includes('service') || t.includes('desk')) icon = '🛎️';
                    else if (t.includes('view') || t.includes('balcony')) icon = '🌅';
                    else if (t.includes('pool')) icon = '🏊';

                    return (
                      <div className="spec-item" key={idx}>
                        <span className="spec-icon">{icon}</span>
                        <span className="spec-text">{feat}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="spec-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="spec-icon">✨</span>
                    <span className="spec-text">Standard premium amenities are included. Specific room features will be updated by the administration shortly.</span>
                  </div>
                )}

                {selectedRoom.maxGuests && (
                  <div className="spec-item">
                    <span className="spec-icon">👪</span>
                    <span className="spec-text">Accommodates up to {selectedRoom.maxGuests} Guests</span>
                  </div>
                )}
              </div>

              <div className="go-modal-section">
                {/* <p className="go-modal-desc">{selectedRoom.description || "This luxurious room offers premium comfort, stunning views, and top-tier amenities to ensure a relaxing stay."}</p> */}
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
              <button className="dr-dw-close" onClick={() => setShowDrawer(false)}><Icons.Cross /></button>
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
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                      <input type="number" value={quantity} readOnly />
                      <button type="button" onClick={() => setQuantity(q => Math.min((selectedRoomToBook.availableInventory ?? selectedRoomToBook.inventoryCount ?? 10), q + 1))}>+</button>
                    </div>
                  </div>
                  <div className="dr-dw-input">
                    <label>Guests</label>
                    <div className="dr-stepper">
                      <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}>-</button>
                      <input type="number" value={guests} readOnly />
                      <button type="button" onClick={() => setGuests(g => Math.min((selectedRoomToBook.maxGuests || 4) * quantity, g + 1))}>+</button>
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
