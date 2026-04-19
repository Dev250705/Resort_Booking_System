import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  const [resorts, setResorts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showGuests, setShowGuests] = useState(false);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1920&q=80",
      title: "Enjoy A Luxury\nExperience"
    },
    {
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80",
      title: "Stay Safely\nWith Us"
    }
  ];

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5000/api/resorts`)
      .then((res) => res.json())
      .then((data) => {
        // Backend already sorts by newest first (_id: -1), just limit to top 9
        const recentNine = data.slice(0, 6);
        setResorts(recentNine);
      })
      .catch((err) => console.log(err));
  }, []);

  // Auto Slider Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500); // changes every 4.5 seconds
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar />
      <main className="theme-orange-home">

        {/* HERO SECTION MATCHING MOCKUP */}
        <section className="theme-hero">
          <div
            key={currentSlide}
            className="theme-hero-bg"
            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
          >
            <div className="theme-overlay"></div>
          </div>

          <button className="theme-arrow left-arrow" onClick={handlePrev}>&lang;</button>

          <div className="theme-hero-content">
            <h1>{heroSlides[currentSlide].title}</h1>
            {/* <button className="theme-book-btn">BOOK NOW</button> */}
            <Link to="/resorts" className="theme-book-btn">BOOK NOW</Link>
          </div>

          <button className="theme-arrow right-arrow" onClick={handleNext}>&rang;</button>
        </section>

        {/* BOOKING SEARCH BAR */}
        <div className="home-search-wrapper">
          <form className="home-search-form" onSubmit={(e) => {
            e.preventDefault();
            navigate('/resorts', { state: { checkIn, checkOut, guests: adults + children, locationQuery } });
          }}>
            <div className="search-field">
              <label>Location</label>
              <input type="text" placeholder="Where do you want to go?" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} />
            </div>
            <div className="search-field">
              <label>Check-in</label>
              <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div className="search-field">
              <label>Check-out</label>
              <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>

            <div className="search-field guest-field" style={{ position: 'relative' }}>
              <label>Guests</label>
              <div
                className="guest-selector-display"
                onClick={() => setShowGuests(!showGuests)}
              >
                {adults} Adult{adults !== 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}
              </div>

              {showGuests && (
                <div className="guest-dropdown">
                  <div className="guest-row">
                    <div className="guest-info">
                      <strong>Adults</strong>
                      <span>Ages 13+</span>
                    </div>
                    <div className="guest-controls">
                      <button type="button" onClick={() => adults > 1 && setAdults(adults - 1)}>-</button>
                      <span>{adults}</span>
                      <button type="button" onClick={() => setAdults(adults + 1)}>+</button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <div className="guest-info">
                      <strong>Children</strong>
                      <span>Ages 2-12</span>
                    </div>
                    <div className="guest-controls">
                      <button type="button" onClick={() => children > 0 && setChildren(children - 1)}>-</button>
                      <span>{children}</span>
                      <button type="button" onClick={() => setChildren(children + 1)}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="search-submit-btn">CHECK AVAILABILITY</button>
          </form>
        </div>

        {/* FEATURED RESORTS SECTION */}
        <section className="popular-rooms-section">
          <h2>Available Resorts</h2>

          <div className="popular-grid">
            {resorts.map((resort, index) => {
              // Calculate starting price if rooms exist
              const prices = resort.roomTypes?.map(r => r.basePrice) || [];
              const startingPrice = prices.length > 0 ? Math.min(...prices) : null;

              const imageUrl = resort.images?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";

              return (
                <div className="popular-card" key={resort._id || index}>
                  <div 
                    className="popular-card-img" 
                    onClick={() => navigate(`/resort/${resort._id}`, { state: { checkIn, checkOut, guests: adults + children } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={imageUrl} alt={resort.name} />
                    {startingPrice && <div className="price-tag">From ₹{startingPrice}</div>}
                  </div>
                  <div className="popular-card-content">
                    <h3>{resort.name}</h3>
                    <div className="stars">
                      {'★'.repeat(Math.max(1, Math.round(resort.rating || 5)))}{'☆'.repeat(5 - Math.max(1, Math.round(resort.rating || 5)))}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                      📍 {resort.location?.city || "Unknown Location"}
                    </div>
                    <div className="card-footer-flex">
                      <div className="duration">🚪 {resort.roomTypes?.length || 0} Room Types</div>
                      <button
                        type="button"
                        className="learn-more-btn"
                        onClick={() => navigate(`/resort/${resort._id}`, { state: { checkIn, checkOut, guests: adults + children } })}
                      >
                        VIEW RESORT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PREMIUM EXPERIENCES SECTION */}
        <section className="experiences-section">
          <div className="experiences-header">
            <h2>Unforgettable Experiences</h2>
            <p>Elevate your stay with our world-class amenities</p>
          </div>
          <div className="experiences-grid">
            <div className="experience-card">
              <span className="exp-icon">🍷</span>
              <h4>Gourmet Dining</h4>
              <p>Savor culinary masterpieces crafted by top chefs.</p>
            </div>
            <div className="experience-card">
              <span className="exp-icon">🧘‍♀️</span>
              <h4>Spa & Wellness</h4>
              <p>Rejuvenate your mind and body in our luxury spas.</p>
            </div>
            <div className="experience-card">
              <span className="exp-icon">🏊‍♂️</span>
              <h4>Private Pools</h4>
              <p>Infinity pools with breathtaking scenic views.</p>
            </div>
            <div className="experience-card">
              <span className="exp-icon">🚠</span>
              <h4>Adventure</h4>
              <p>Thrilling outdoor activities curated just for you.</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

export default Home;
