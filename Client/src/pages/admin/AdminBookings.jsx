import { useEffect, useState } from "react";

function getAuthToken() {
  const t = sessionStorage.getItem("token");
  return t ? t.trim() : "";
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings/admin/all", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data.bookings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/admin/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await loadBookings();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header" style={{ padding: "0 0 2rem 0" }}>
        <h1>Bookings Management</h1>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Resort</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td style={{ fontSize: "0.85rem", opacity: 0.8 }}>{b._id.slice(-6)}</td>
                  <td>
                    {b.user?.name}<br />
                    <small style={{ opacity: 0.7 }}>{b.user?.email}</small>
                  </td>
                  <td>
                    {b.resort?.name}<br />
                    <small style={{ opacity: 0.7 }}>{b.roomTypeTitle} x{b.quantity}</small>
                  </td>
                  <td>
                    {new Date(b.checkInDate).toLocaleDateString()} - <br />
                    {new Date(b.checkOutDate).toLocaleDateString()}
                  </td>
                  <td>₹{b.totalAmount}</td>
                  <td>
                    <span className={`admin-badge ${b.status === "Confirmed" ? "success" : b.status === "Cancelled" ? "danger" : b.status === "Completed" ? "neutral" : "warning"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value=""
                      style={{ padding: "0.25rem", borderRadius: "4px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                    >
                      <option value="" disabled>Change Status...</option>
                      <option value="Confirmed">Confirm</option>
                      <option value="Completed">Complete</option>
                      <option value="Cancelled">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
