import React, { useState, useEffect } from "react";


export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/contact/admin`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
      }
    } catch (e) {
      console.error("Error fetching contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/contact/admin/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setContacts(contacts.map(c => c._id === id ? { ...c, status: newStatus } : c));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  if (loading) return <p style={{color: "white"}}>Loading messages...</p>;

  return (
    <div className="admin-page-content" style={{ padding: '2rem' }}>
      <h1 className="admin-page-title" style={{ color: '#c9a96b', marginBottom: '2rem' }}>Guest Messages & Concierge Requests</h1>
      
      {contacts.length === 0 ? <p style={{color: "#a0a5b5"}}>No messages found.</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {contacts.map((msg) => (
          <div key={msg._id} style={{ 
            background: msg.status === 'New' ? "rgba(201, 169, 107, 0.15)" : "rgba(0,0,0,0.3)", 
            padding: "1.5rem", 
            borderRadius: "12px", 
            border: msg.status === 'New' ? "1px solid #c9a96b" : "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <strong style={{ color: "#fff", fontSize: "1.2rem" }}>
                  {msg.title.toUpperCase()} {msg.firstName} {msg.lastName}
                </strong>
                <span style={{ marginLeft: "10px", padding: "3px 8px", background: msg.status==='New'?"#f59e0b":(msg.status==='Replied'?"#10b981":"#6b7280"), color: "#fff", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                  {msg.status}
                </span>
                <div style={{ color: "#a0a5b5", fontSize: "0.9rem", marginTop: "5px" }}>
                  📧 {msg.email} | 📞 {msg.phone} | 🌍 {msg.country}
                </div>
              </div>
              <div style={{ color: "#a0a5b5", fontSize: "0.85rem" }}>
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px", color: "#e2e8f0", marginBottom: "1rem" }}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{msg.comments}</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                className="admin-btn"
                onClick={() => window.location.href = `mailto:${msg.email}?subject=Reply to your inquiry at H Resort`} 
                style={{ background: "#c9a96b", color: "#000", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Reply via Email
              </button>
              
              {msg.status !== "Read" && (
                <button onClick={() => updateStatus(msg._id, "Read")} style={{ background: "transparent", color: "#a0a5b5", border: "1px solid #a0a5b5", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Mark as Read</button>
              )}
              {msg.status !== "Replied" && (
                <button onClick={() => updateStatus(msg._id, "Replied")} style={{ background: "transparent", color: "#10b981", border: "1px solid #10b981", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Mark as Replied</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
