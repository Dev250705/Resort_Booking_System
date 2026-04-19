import { useNavigate } from "react-router-dom";
import "./about.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            <Navbar />

            {/* HERO */}
            <section className="about-hero">
                {/* A high-end luxury resort image from Unsplash */}
                <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80"
                    alt="Luxury Resort Horizon"
                />
                <div className="about-hero-overlay">
                    <h1>Our Heritage</h1>
                    <p>The Pinnacle of Luxury Hospitatlity</p>
                </div>
            </section>

            {/* INTRO OVERLAP */}
            <section className="about-intro">
                <h2>Redefining the Art of Travel</h2>
                <p>
                    Since our inception, we have set out to create more than just places to stay.
                    We curate immersive experiences that blend breathtaking architecture,
                    flawless service, and profound emotional connection. Whether nestled
                    on pristine private islands or perched high above majestic valleys,
                    our resorts remain completely dedicated to exceeding your highest expectations.
                </p>
            </section>

            {/* STORY SPLIT */}
            <section className="about-story">
                <div className="about-story-img">
                    <img
                        src="https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=1000&q=80"
                        alt="Resort Architecture"
                    />
                </div>
                <div className="about-story-content">
                    <h3>The Heart of Our Resorts</h3>
                    <p>
                        At the center of every resort lies an unwavering commitment to timeless elegance.
                        We believe that true luxury is found in the details—from the thread count of our
                        artisanal linens to the locally-sourced ingredients prepared by Michelin-star culinary
                        visionaries. Every element is thoughtfully designed so your journey becomes a memory
                        worth returning to.
                    </p>
                    <button className="btn-gold" onClick={() => navigate("/resorts")}>Explore Our Resorts</button>
                </div>
            </section>

            {/* FEATURE GRID */}
            <section className="about-features">
                <article className="feature-box">
                    <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" alt="Bespoke Service" />
                    <div className="feature-box-text">
                        <h4>Bespoke Details</h4>
                        <p>Signature arrivals, express VIP check-in, and uncompromising personalized attention.</p>
                    </div>
                </article>

                <article className="feature-box">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80" alt="Private Escapes" />
                    <div className="feature-box-text">
                        <h4>Private Escapes</h4>
                        <p>Secluded suites featuring private infinity pools and dedicated concierge service.</p>
                    </div>
                </article>

                <article className="feature-box">
                    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80" alt="Culinary Journeys" />
                    <div className="feature-box-text">
                        <h4>Culinary Mastery</h4>
                        <p>Curated culinary journeys featuring renowned international and local flavors.</p>
                    </div>
                </article>

                <article className="feature-box">
                    <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80" alt="Spa & Wellness" />
                    <div className="feature-box-text">
                        <h4>Holistic Harmony</h4>
                        <p>World-class therapeutic spa retreats intended to restore youth and vigor.</p>
                    </div>
                </article>
            </section>

            {/* ZIG-ZAG SECTIONS */}
            <section className="about-zigzag">
                {/* Row 1 */}
                <div className="zigzag-row">
                    <div className="zigzag-img">
                        <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80" alt="Sustainable Travel" />
                    </div>
                    <div className="zigzag-text">
                        <h3>Sustainable Purity</h3>
                        <p>
                            We are fiercely devoted to ecological mindfulness. Our modern building practices minimize
                            environmental impact while integrating seamlessly into the local flora. From zero-waste
                            initiatives to 100% renewable energy integration in our newest developments, choosing
                            us means investing in a greener tomorrow without sacrificing luxury today.
                        </p>
                    </div>
                </div>

                {/* Row 2 (Reverse) */}
                <div className="zigzag-row reverse">
                    <div className="zigzag-img">
                        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80" alt="Global Community" />
                    </div>
                    <div className="zigzag-text">
                        <h3>A Global Family</h3>
                        <p>
                            We embrace the cultural heritage of every location we touch. By partnering with
                            local artisans, guides, and agricultural producers, our resorts act as a gateway
                            to authentic community connection. Allow our local experts to guide you into the
                            pulse of the destination and experience the unseen marvels of local living.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default About;