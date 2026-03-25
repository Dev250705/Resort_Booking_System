import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ResortCard from "../components/ResortCard";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import "./home.css";

function Home() {
  const [resorts, setResorts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/api/resorts")
      .then((res) => res.json())
      .then((data) => setResorts(data))
      .catch((err) => console.log(err));
  }, []);
  return (
    <>
      <Navbar />
      <Hero />

      <div className="resort-section">
        <h2>Featured Resorts</h2>

        <div className="grid">
          {resorts.slice(0, 9).map((resort, index) => (
            <ResortCard key={index} resort={resort} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;
