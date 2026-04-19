import { useState } from "react";
import "./contact.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    title: "", firstName: "", lastName: "", email: "", phone: "", country: "", comments: ""
  });
  const [statusMsg, setStatusMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("Submitting...");
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        setFormData({ title: "", firstName: "", lastName: "", email: "", phone: "", country: "", comments: "" });
      } else {
        setStatusMsg(data.message || "Failed to submit.");
      }
    } catch (err) {
      setStatusMsg("Error submitting form.");
    }
  };

  return (
    <>
      <Navbar />

      <section className="contact-hero">
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          alt="Concierge Service"
        />
        <div className="contact-hero-overlay">
          <p>Contact for our Concierge services</p>
        </div>
      </section>

      <main className="contact-page">
        <section className="contact-intro">
          <h1>Contact Us</h1>
          <p>
            Get in touch with Serena Hotels, Resorts, Lodges, Camps, Forts &
            Palaces. Our team is ready to assist with booking, group stays and
            bespoke travel experiences.
          </p>
          <div className="contact-locations">
            <article>
              <h3>BHAVIN HALPATI</h3>
              <p>+91 6356 438 525</p>
            </article>
            <article>
              <h3>DEV DALWADI</h3>
              <p>+91 7874 811 012</p>
            </article>
            <article>
              <h3>PRINCE AKBARI</h3>
              <p>+91 6353 550 989</p>
            </article>
          </div>
        </section>

        <section className="contact-form-section">
          <h2>Contact / E-Concierge Form</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <select name="title" required value={formData.title} onChange={handleInputChange}>
                <option value="">Select Title</option>
                <option value="mr">Mr</option>
                <option value="ms">Ms</option>
                <option value="mrs">Mrs</option>
              </select>
              <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
              <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
            </div>

            <div className="form-row">
              <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} />
              <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} />
              <select name="country" required value={formData.country} onChange={handleInputChange}>
                <option value="">Country</option>
                <option value="india">India</option>
                <option value="kenya">Kenya</option>
                <option value="pakistan">Pakistan</option>
              </select>
            </div>

            <div className="form-row form-full">
              <textarea name="comments" placeholder="Comments" rows="5" required value={formData.comments} onChange={handleInputChange}></textarea>
            </div>

            <div className="checkbox-grid">
              <label><input type="checkbox" name="updates" /> Notify me about special offers.</label>
              <label><input type="checkbox" name="privacy" required /> I have read and agree to the Privacy Policy.</label>
            </div>

            <button type="submit">Submit</button>
            {statusMsg && <p style={{ marginTop: "10px", color: statusMsg.includes("Error") || statusMsg.includes("Failed") ? "red" : "green", fontWeight: "bold" }}>{statusMsg}</p>}
          </form>
        </section>

        {/* <section className="faq-section">
          <h2>FAQs</h2>
          <p>Frequently Asked Questions</p>
          <div className="faq-list">
            <details>
              <summary>What is Serena Hotels known for?</summary>
              <p>Serena Hotels is renowned for its unique blend of hospitality, cultural heritage, and sustainable tourism across Asia and Africa.</p>
            </details>
            <details>
              <summary>In which countries does Serena Hotels operate?</summary>
              <p>Serena operates in Kenya, Tanzania, Uganda, Rwanda, Pakistan, Afghanistan and more.</p>
            </details>
            <details>
              <summary>How can I make a reservation at Serena Hotels?</summary>
              <p>Use our booking form, contact the regional phone numbers, or email our concierge desk via the form above.</p>
            </details>
            <details>
              <summary>Is Serena Hotels eco-friendly?</summary>
              <p>Yes—sustainability is embedded in our operations, from energy management to community engagement.</p>
            </details>
          </div>
        </section> */}
      </main>

      <Footer />
    </>
  )
}

export default Contact;