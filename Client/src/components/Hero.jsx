import "./Hero.css";
import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <div className="hero">
      <div className="overlay">
        <h1>Find Your Perfect Stay</h1>
        <SearchBar />
      </div>
    </div>
  );
}   