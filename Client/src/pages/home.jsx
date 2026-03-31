import Navbar from "../components/Navbar";
import ResortCard from "../components/ResortCard";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import "./home.css";

function Home() {
  const [resorts, setResorts] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/resorts")
      .then((res) => res.json())
      .then((data) => setResorts(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <Navbar />
      {/* <Hero /> */}

      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-copy">
            <span>Rooms & Suites</span>
            <h1>Hello. Salut. Hola.</h1>
            <p>
              Serena Hotels & Resorts blends modern luxury, inspired design, and
              unforgettable hospitality. Create your next escape with curated
              stays and exceptional service.
            </p>
            <div className="hero-actions">
              <button>Explore Rooms</button>
              <button className="ghost-btn">View Destinations</button>
            </div>

            <div className="hero-stat-grid">
              <div>
                <strong>120+</strong>
                <p>Luxury suites</p>
              </div>
              <div>
                <strong>35</strong>
                <p>Exclusive resorts</p>
              </div>
              <div>
                <strong>24/7</strong>
                <p>Guest service</p>
              </div>
            </div>
          </div>

          <div className="hero-aside">
            <div className="hero-card">
              <span className="eyebrow">Plan your stay</span>
              <h2>Search availability</h2>

              <div className="booking-widget">
                <div className="booking-topbar">
                  <div>
                    <h3>Best Rate Finder</h3>
                    <p>Secure unforgettable stays with premium amenities.</p>
                  </div>
                  <span>Special</span>
                </div>

                <div className="booking-container">
                  <div className="booking-item destination-item">
                    <span>Destination</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where are you going?"
                    />
                  </div>

                  <div className="date-bar">
                    <div className="date-pill">
                      <small>Check-in</small>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div className="date-pill">
                      <small>Check-out</small>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="booking-item counter-item">
                    <span>Adults</span>
                    <div className="counter">
                      <button type="button" onClick={() => setAdults((prev) => Math.max(prev - 1, 1))}>-</button>
                      <span>{adults}</span>
                      <button type="button" onClick={() => setAdults((prev) => prev + 1)}>+</button>
                    </div>
                  </div>

                  <div className="booking-item counter-item">
                    <span>Children</span>
                    <div className="counter">
                      <button type="button" onClick={() => setChildren((prev) => Math.max(prev - 1, 0))}>-</button>
                      <span>{children}</span>
                      <button type="button" onClick={() => setChildren((prev) => prev + 1)}>+</button>
                    </div>
                  </div>

                  <div className="booking-item counter-item">
                    <span>Rooms</span>
                    <div className="counter">
                      <button type="button" onClick={() => setRooms((prev) => Math.max(prev - 1, 1))}>-</button>
                      <span>{rooms}</span>
                      <button type="button" onClick={() => setRooms((prev) => prev + 1)}>+</button>
                    </div>
                  </div>

                  <div className="booking-action">
                    <button className="enquire-btn" type="button">Check Availability</button>
                    <button className="link-btn" type="button">Special Offers</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="welcome-section">
        <div className="welcome-grid">
          <div className="welcome-media">
            <div className="welcome-card large">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                alt="Hotel view"
              />
            </div>
            <div className="welcome-row">
              <div className="welcome-card small">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80"
                  alt="Resort pool"
                />
              </div>
              <div className="welcome-card small">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
                  alt="Dining area"
                />
              </div>
            </div>
          </div>

          <div className="welcome-copy">
            <p className="eyebrow">Raising comfort to the highest level</p>
            <h2>Welcome to Serena Hotel</h2>
            <p>
              Our blend of warm hospitality, refined design, and local culture
              makes every stay memorable. Discover thoughtful experiences,
              elevated dining, and beautifully styled spaces for your next
              getaway.
            </p>
            <button className="primary-btn">Read More</button>
          </div>
        </div>
      </section>

      <section className="featured-resorts">
        <div className="section-header">
          <p>Featured Resorts</p>
          <h2>Selected Escape Experiences</h2>
        </div>

        <div className="grid">
          {resorts.slice(0, 8).map((resort, index) => (
            <ResortCard key={index} resort={resort} />
          ))}
        </div>

        <div className="cta-row">
          <button className="primary-btn">Browse All Resorts</button>
        </div>
      </section>

      <section className="prestige-club">
        <div className="section-header">
          <p>Prestige Club</p>
          <h2>Earn. Redeem. Experience.</h2>
        </div>

        <div className="club-grid">
          <article>
            <h3>Priority Reservations</h3>
            <p>Lock in premium rooms before they sell out.</p>
          </article>
          <article>
            <h3>Member-only Rates</h3>
            <p>Enjoy exclusive savings across all properties.</p>
          </article>
          <article>
            <h3>Special Amenities</h3>
            <p>Receive curated welcome surprises in every stay.</p>
          </article>
          <article>
            <h3>Complimentary Experiences</h3>
            <p>Access local adventures and elite wellness services.</p>
          </article>
        </div>

        <div className="cta-row">
          <button className="secondary-btn">Join Prestige Club</button>
        </div>
      </section>

      <section className="destinations">
        <div className="section-header">
          <p>Unique Africa Destinations</p>
          <h2>Curated Safari & Journey Escapes</h2>
        </div>

        <div className="destination-grid">
          <article>
            <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" alt="Kenya Safari" />
            <div>
              <h3>Journey into Kenya’s Wild Heart</h3>
              <button>Book Safari</button>
            </div>
          </article>
          <article>
            <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801" alt="Tanzania" />
            <div>
              <h3>Safari through Tanzania’s Timeless Beauty</h3>
              <button>Book Safari</button>
            </div>
          </article>
        </div>
      </section>

      <section className="offers">
        <div className="section-header">
          <p>Special Offers</p>
          <h2>Unlock Limited-Time Luxury Packages</h2>
        </div>

        <div className="offers-grid">
          <article>
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80" alt="Package" />
            <div>
              <h4>Serena Beach Escape</h4>
              <p>Book 5 nights, get 2 nights complimentary.</p>
              <button>Book Offer</button>
            </div>
          </article>
          <article>
            <img src="https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=900&q=80" alt="Package" />
            <div>
              <h4>Wellness Detox Retreat</h4>
              <p>Stay 4 nights and enjoy a free spa treatment.</p>
              <button>Book Offer</button>
            </div>
          </article>
          <article>
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0" alt="Package" />
            <div>
              <h4>Gourmet Journey</h4>
              <p>Complimentary dinner for two in our signature restaurant.</p>
              <button>Book Offer</button>
            </div>
          </article>
        </div>
      </section>

      <section className="news-map">
        <div className="news-section">
          <div className="section-header">
            <p>Serena News</p>
            <h2>Latest Updates & Announcements</h2>
          </div>

          <div className="news-grid">
            <article>
              <h3>New Luxury Suite Launch in Islamabad</h3>
              <p>Experience world-class comfort and elegant design in our newest property.</p>
            </article>
            <article>
              <h3>Community Empowerment Initiative</h3>
              <p>Empowering local artisans through sustainable partnerships.</p>
            </article>
            <article>
              <h3>Eco-Friendly Hospitality Awards</h3>
              <p>Serena Hotels recognized for industry-leading sustainability.</p>
            </article>
          </div>
        </div>

        <div className="map-section">
          <div className="map-box">
            <h3>Find Serena Hotels</h3>
            <p>Explore our properties across Africa and Asia on the interactive map.</p>
            <img src="https://images.unsplash.com/photo-1518659526055-9bca04fb1a53?auto=format&fit=crop&w=1200&q=80" alt="Map" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
