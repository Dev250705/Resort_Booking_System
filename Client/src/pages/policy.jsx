import "./policy.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Policy() {
    return (
        <>
            <Navbar />

            <section className="policy-hero">
                <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                    alt="Serena Hotel"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/1500x420?text=Policy+Banner"; }}
                />
                <div className="policy-hero-text">
                    <p>Gilgit Serena Hotel</p>
                    <h1>Privacy Policy</h1>
                </div>
            </section>

            <main className="policy-page">
                <div className="policy-container">
                    <p className="policy-subtitle">SERENA HOTELS • SAFARI LODGES • CAMPS • RESORTS • FORTS • PALACES</p>
                    <a href="/policy.pdf" className="policy-download" target="_blank" rel="noreferrer" >
                        Download Privacy Policy Document
                    </a>
                    <section className="policy-content">
                        <h2>Introduction</h2>
                        <p>
                            Your privacy is important to us, and we are committed to protecting your personal data. This policy shows how we use your personal data when you interact with us, when we welcome you as our guest and when you visit our website.
                        </p>

                        <h2>How we collect your data?</h2>
                        <p>
                            We collect and receive data in different ways. Here is an explanation of how we do it.
                            When you are a guest at any of our hotels you may give us data in person when you:
                        </p>
                        <ul>
                            <li>check-in and check-out</li>
                            <li>give us your business card</li>
                            <li>make use of our accommodation, facilities and services including out-sourced and 3rd party services</li>
                            <li>attend our events</li>
                            <li>interact with our staff and other guests</li>
                            <li>log in to our wireless network</li>
                        </ul>

                        <p>
                            You may also provide data when you interact with us remotely via this website, by post, phone or email, or through chat or social media when you:
                        </p>
                        <ul>
                            <li>sign up to receive our newsletter or other direct marketing</li>
                            <li>make enquiries or request information, or correspond with us</li>
                            <li>make accommodation, hospitality services or spa treatment bookings</li>
                            <li>engage with us on social media</li>
                            <li>register for Prestige Club</li>
                        </ul>

                        <h2>Personal Data We Collect From You</h2>
                        <p>
                            Personal data includes but is not limited to name, address, phone, email and payment details. We may also collect data from providers of payment, analytics, and feedback partners. We will not collect sensitive personal data (e.g. race, health) unless explicitly consented and required by law.
                        </p>

                        <h2>How we use your personal information</h2>
                        <p>
                            We use your personal data to fulfill contracts, to comply with legal obligations, for our legitimate business interests, and with consent where required. This includes booking management, security, marketing and service improvement.
                        </p>

                        <h2>Your rights</h2>
                        <p>
                            You can request correction or deletion of your data, withdraw consent, and lodge a complaint with a supervisory authority. Contact our privacy team at privacy@serena.com for support.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Policy;