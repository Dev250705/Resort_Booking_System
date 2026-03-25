import "./ResortCard.css";

export default function ResortCard({ resort }) {
  return (
    <div className="card">
      {/* <img src={resort.image?.[0]} alt={resort.name} /> */}
      <img src={`http://localhost:3000${resort.images?.[0]}`} />
      <h3>{resort.name}</h3>
      <p>₹{resort.price}</p>
      <p>⭐ {resort.rating}</p>
    </div>
  );
}