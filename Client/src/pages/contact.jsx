import "./contact.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact(){
    return(
        <>
        <Navbar/>

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
                <p>+254 732 123 333</p>
              </article>
              <article>
                <h3>DEV DALWADI</h3>
                <p>+92 111 133 133</p>
              </article>
              <article>
                <h3>PRINCE AKBARI</h3>
                <p>+91 562 445 978</p>
              </article>
            </div>
          </section>

          <section className="contact-form-section">
            <h2>Contact / E-Concierge Form</h2>
            <form className="contact-form">
              <div className="form-row">
                <select name="title" required>
                  <option value="">Select Title</option>
                  <option value="mr">Mr</option>
                  <option value="ms">Ms</option>
                  <option value="mrs">Mrs</option>
                </select>
                <input type="text" name="firstName" placeholder="First Name" required />
                <input type="text" name="lastName" placeholder="Last Name" required />
              </div>

              <div className="form-row">
                <input type="email" name="email" placeholder="Email Address" required />
                <input type="tel" name="phone" placeholder="Phone Number" required />
                <select name="country" required>
                  <option value="">Country</option>
                  <option value="india">India</option>
                  <option value="kenya">Kenya</option>
                  <option value="pakistan">Pakistan</option>
                </select>
              </div>

              <div className="form-row form-full">
                <textarea name="comments" placeholder="Comments" rows="5" required></textarea>
              </div>

              <div className="checkbox-grid">
                <label><input type="checkbox" name="updates" /> Notify me about special offers.</label>
                <label><input type="checkbox" name="privacy" required /> I have read and agree to the Privacy Policy.</label>
              </div>

              <button type="submit">Submit</button>
            </form>
          </section>

          <section className="faq-section">
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
          </section>
        </main>

        <Footer/>
        </>
    )
}

export default Contact;