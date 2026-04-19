import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./policy.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Shield, FileText, CreditCard, Ban, Bell } from "lucide-react";
import heroBg from "../assets/hero_bg.png";

function Policy() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("terms");

    useEffect(() => {
        if (location.hash) {
            const hash = location.hash.replace("#", "");
            if (["terms", "privacy", "cancellation", "payment", "stay"].includes(hash)) {
                setActiveTab(hash);
            }
        }
    }, [location]);

    const policies = [
        { id: "terms", label: "Terms & Conditions", icon: <FileText size={20} /> },
        { id: "privacy", label: "Privacy Policy", icon: <Shield size={20} /> },
        { id: "cancellation", label: "Cancellation & Refund", icon: <Ban size={20} /> },
        { id: "payment", label: "Payment & Security", icon: <CreditCard size={20} /> },
        { id: "stay", label: "Resort Stay Rules", icon: <Bell size={20} /> },
    ];

    return (
        <div className="policy-page">
            <Navbar />

            <section className="policy-hero">
                <img
                    src={heroBg}
                    alt="Resort View"
                />
                <div className="policy-hero-text">
                    <p>Transparent & Secure</p>
                    <h1>Our Policies</h1>
                </div>
            </section>

            <main className="policy-container">
                <aside className="policy-sidebar">
                    {policies.map(policy => (
                        <button
                            key={policy.id}
                            className={`policy-tab ${activeTab === policy.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab(policy.id);
                                window.history.replaceState(null, "", `#${policy.id}`);
                            }}
                        >
                            <span className="policy-tab-icon">{policy.icon}</span>
                            {policy.label}
                        </button>
                    ))}
                </aside>

                <section className="policy-content-wrapper">
                    {/* TERMS AND CONDITIONS */}
                    <div className={`policy-section ${activeTab === "terms" ? "active" : ""}`}>
                        <h2>Terms & Conditions</h2>
                        <p>Welcome to H Resort. By accessing our website and making a reservation, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before proceeding with your booking.</p>
                        
                        <h3>1. Agreement Context</h3>
                        <p>These terms and conditions apply to all guests and visitors of H Resort properties. The use of our website signifies your acceptance of these policies.</p>
                        
                        <h3>2. User Representations</h3>
                        <ul>
                            <li>You are at least 18 years of age and hold legal capacity to make a transaction.</li>
                            <li>The information you provide during booking is accurate, current, and complete.</li>
                            <li>You will not use our platform for any fraudulent or speculative bookings.</li>
                        </ul>

                        <h3>3. Liability Limitations</h3>
                        <p>H Resort shall not be liable for any indirect, incidental, special, or consequential damages arising out of your stay or use of our booking platform, including loss of data, income, or personal property during your visit.</p>
                    </div>

                    {/* PRIVACY POLICY */}
                    <div className={`policy-section ${activeTab === "privacy" ? "active" : ""}`}>
                        <h2>Privacy Policy</h2>
                        <p>Your privacy is of critical importance to us. This policy dictates how we collect, process, and safeguard your personal data.</p>
                        
                        <h3>Data Collection</h3>
                        <p>We may collect the following information when you visit our website or make a booking:</p>
                        <ul>
                            <li><strong>Identity Data:</strong> First name, last name, username, and date of birth.</li>
                            <li><strong>Contact Data:</strong> Billing address, email address, and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> Securely tokenized payment details handled fully by certified payment gateways.</li>
                        </ul>

                        <h3>How We Use Your Data</h3>
                        <p>Your data is used to successfully process your reservations, communicate pre-arrival instructions, enhance user experience, and for strictly relevant promotional communications (which you can opt out of at any time).</p>

                        <h3>Data Security</h3>
                        <p>We implement top-tier encryption and restrictive access controls to ensure your data is secure from unauthorized access or alterations.</p>
                    </div>

                    {/* CANCELLATION */}
                    <div className={`policy-section ${activeTab === "cancellation" ? "active" : ""}`}>
                        <h2>Cancellation & Refund</h2>
                        <p>We understand that plans can change. Our cancellation policy is designed to be fair to our guests while protecting our operational capacity.</p>
                        
                        <h3>Standard Cancellation Policy</h3>
                        <ul>
                            <li><strong>14+ Days Notice:</strong> 100% full refund of the booking amount.</li>
                            <li><strong>7-14 Days Notice:</strong> 50% refund of the booking amount.</li>
                            <li><strong>Less than 7 Days Notice:</strong> No refund possible, but specific date modifications may be permitted subject to availability and surcharges.</li>
                        </ul>

                        <h3>No Shows & Early Departures</h3>
                        <p>If a guest fails to arrive without prior notice ("No Show"), the total price of the reservation will be charged. Early departures are treated as cancellations for the remaining nights and are non-refundable.</p>

                        <h3>Refund Processing Time</h3>
                        <p>All approved refunds are processed within 5-7 business days to the original instrument of payment.</p>
                    </div>

                    {/* PAYMENT AND SECURITY */}
                    <div className={`policy-section ${activeTab === "payment" ? "active" : ""}`}>
                        <h2>Payment & Security</h2>
                        <p>At H Resort, ensuring the security of your transactions is our utmost priority.</p>
                        
                        <h3>Accepted Payment Methods</h3>
                        <p>We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and seamless digital wallets (Apple Pay, Google Pay). All transactions are processed in the local currency unless explicitly displayed otherwise.</p>

                        <h3>Payment Security</h3>
                        <p>Our payment infrastructure is completely PCI-DSS compliant. Payment information is securely encrypted during transmission via SSL (Secure Sockets Layer). <strong>We never temporarily or permanently store your complete credit card details on our local servers.</strong></p>

                        <h3>Taxes & Additional Fees</h3>
                        <p>Rates quoted on the website generally exclude state and local taxes, unless explicitly stated. Resort fees and incidental deposits may be collected upon check-in.</p>
                    </div>

                    {/* STAY RULES */}
                    <div className={`policy-section ${activeTab === "stay" ? "active" : ""}`}>
                        <h2>Resort Stay Rules</h2>
                        <p>To ensure a pleasant and safe environment for all our guests, we enforce the following house rules at all H Resort properties.</p>
                        
                        <h3>Timings</h3>
                        <ul>
                            <li><strong>Check-in Time:</strong> 2:00 PM onwards</li>
                            <li><strong>Check-out Time:</strong> 11:00 AM strictly</li>
                            <li>Early check-in and late check-out are subject to availability and additional fees.</li>
                        </ul>

                        <h3>General Conduct</h3>
                        <ul>
                            <li><strong>Quiet Hours:</strong> Between 10:00 PM and 7:00 AM, noise must be kept to a minimum in shared hallways and adjacent rooms.</li>
                            <li><strong>Smoking Policy:</strong> All indoor spaces, including guest rooms and balconies, are strictly non-smoking. Designated outdoor smoking zones are provided.</li>
                            <li><strong>Pets:</strong> We are generally not a pet-friendly property, unless a specific pet-friendly room is exclusively booked. Guide dogs are always welcome.</li>
                        </ul>

                        <h3>Damage To Property</h3>
                        <p>Guests are fully liable for any damage howsoever caused to the allocated room or to the Resort premises. H Resort reserves the right to charge guests the cost of rectifying damage or replacing items.</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Policy;