import "./SearchBar.css";

export default function SearchBar() {
  return (
    <div className="search-bar">
      <input type="date" />
      <input type="date" />
      <input type="number" placeholder="Guests" />
      <button>Search</button>
    </div>
  );
}