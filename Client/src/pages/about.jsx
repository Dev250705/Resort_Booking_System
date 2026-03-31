import "./about.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

function About() {
    return (
        <>
            <Navbar />
            <div className="about">

                {/* HERO */}
                <section className="hero">
                    <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945" width="100px" height="100px" />
                    <div className="hero-overlay">
                        <h1>About Us</h1>
                        <p>Our Collection of Luxury Resorts</p>
                    </div>
                </section>

                {/* INTRO CENTER TEXT */}
                <section className="intro">
                    <h2>OUR COLLECTION OF UNIQUE HOTELS</h2>
                    <p>
                        Our platform brings together a handpicked collection of exceptional resorts
                        and luxury stays from around the world. Each destination is carefully selected
                        to offer a perfect blend of comfort, elegance, and authentic experiences.
                        Whether you seek serene beaches, mountain retreats, or cultural escapes,
                        we ensure every stay creates unforgettable memories.
                    </p>
                </section>

                {/* IMAGE LEFT TEXT RIGHT */}
                <section className="split">
                    <div className="split-img">
                        <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" />
                    </div>
                    <div className="split-text">
                        <h3>The Heart of Our Resorts</h3>
                        <p>
                            At the heart of every resort lies a commitment to exceptional hospitality
                            and timeless elegance. From tranquil beachfront escapes to breathtaking
                            mountain retreats, each destination is thoughtfully designed to offer
                            comfort, serenity, and unforgettable experiences. Every detail is crafted
                            to ensure your stay is not just a visit, but a journey of relaxation and indulgence.
                        </p>
                        <button>Explore Destinations</button>
                    </div>
                </section>

                {/* FEATURE GRID */}
                <section className="features">
                    <article className="feature-card">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945" alt="Welcome Amenities" />
                        <div className="feature-details">
                            <h3>Welcome Amenities</h3>
                            <p>Signature gifts, express check-in, and seamless arrival service.</p>
                        </div>
                    </article>

                    <article className="feature-card">
                        <img src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1" alt="Laundry Services" />
                        <div className="feature-details">
                            <h3>Laundry Services</h3>
                            <p>Doorstep laundry with same-day returns for effortless travel.</p>
                        </div>
                    </article>

                    <article className="feature-card">
                        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0" alt="Dining Experience" />
                        <div className="feature-details">
                            <h3>Dining Experience</h3>
                            <p>Curated culinary journeys with local and international flavors.</p>
                        </div>
                    </article>

                    <article className="feature-card">
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Exclusive Offers" />
                        <div className="feature-details">
                            <h3>Exclusive Offers</h3>
                            <p>Member-only packages and seasonal escape promotions.</p>
                        </div>
                    </article>
                </section>

                {/* RESPONSIBLE BUSINESS - ALTERNATING LAYOUT */}
                <section className="features-alternating">
                    <article className="feature-row reverse">
                        <div className="feature-image">
                            <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" alt="Responsible Business" />
                        </div>
                        <div className="feature-text">
                            <h3>Responsible Business</h3>
                            <p>We are deeply committed to sustainable and responsible tourism practices that respect both nature and local communities. Our resorts are designed to minimize environmental impact while promoting eco-friendly initiatives such as energy conservation, waste reduction, and support for local culture and traditions. By choosing us, you contribute to a greener future.</p>
                            <button>Discover More</button>
                        </div>
                    </article>
                </section>

                {/* SPA & WELLNESS - ALTERNATING LAYOUT */}
                <section className="features-alternating">
                    <article className="feature-row">
                        <div className="feature-image">
                            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Spa & Wellness" />
                        </div>
                        <div className="feature-text">
                            <h3>Spa & Wellness</h3>
                            <p>Indulge in a rejuvenating journey where relaxation meets luxury. Our spa and wellness centers offer a range of holistic treatments, from therapeutic massages to revitalizing therapies designed to refresh your body and mind. Surrounded by serene environments, every experience is crafted to restore balance, reduce stress, and elevate your overall well-being.</p>
                            <button>Discover Wellness</button>
                        </div>
                    </article>
                </section>

                {/* FOOTER CTA */}
                {/* <section className="cta">
                    <h2>Subscribe to News & Offers</h2>
                    <button>Subscribe</button>
                </section> */}

            </div>
            <Footer />
        </>
    )
}

export default About;