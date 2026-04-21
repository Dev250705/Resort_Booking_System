import { useEffect, useState } from "react";

function getAuthToken() {
  const t = sessionStorage.getItem("token");
  return t ? t.trim() : "";
}

export default function AdminResorts() {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    basePrice: "",
    inventory: "",
    description: "",
    amenities: "",
    coverImage: null,
    galleryImages: []
  });

  const [editingResort, setEditingResort] = useState(null);
  const [newRoom, setNewRoom] = useState({ title: "", description: "", basePrice: "", inventoryCount: "", maxGuests: 2, amenities: "", roomImages: [] });

  const getImageUrl = (url) => url?.startsWith('/uploads') ? `http://${window.location.hostname}:5000${url}` : url;

  const loadResorts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/`);
      const data = await res.json();
      setResorts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResorts();
  }, []);

  const handleDelete = async (resortId) => {
    if (!window.confirm("Delete this resort?")) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${resortId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (res.ok) await loadResorts();
    } catch (e) {
      alert("Error deleting resort");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.basePrice) return alert("Fill required fields");

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("city", formData.city);
    payload.append("description", formData.description || "");
    if (formData.amenities) payload.append("amenities", formData.amenities);
    payload.append("basePrice", formData.basePrice);
    payload.append("inventory", formData.inventory);

    if (formData.coverImage) {
      payload.append("coverImage", formData.coverImage);
    }

    if (formData.galleryImages.length > 0) {
      Array.from(formData.galleryImages).forEach(file => {
        payload.append("galleryImages", file);
      });
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: payload
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: "", city: "", basePrice: "", inventory: "", description: "", amenities: "", coverImage: null, galleryImages: [] });
        await loadResorts();
      } else {
        alert("Failed to create resort");
      }
    } catch (e) {
      alert("Error creating resort");
    }
  };

  const addRoom = async (resortId) => {
    if (!newRoom.title || !newRoom.basePrice) return alert("Room title and price required");

    const payload = new FormData();
    payload.append("title", newRoom.title);
    payload.append("description", newRoom.description || "");
    payload.append("basePrice", newRoom.basePrice);
    payload.append("inventoryCount", newRoom.inventoryCount);
    payload.append("maxGuests", newRoom.maxGuests);
    if (newRoom.amenities) payload.append("amenities", newRoom.amenities);

    if (newRoom.roomImages.length > 0) {
      Array.from(newRoom.roomImages).forEach(file => {
        payload.append("roomImages", file);
      });
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${resortId}/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: payload
      });
      if (res.ok) {
        setNewRoom({ title: "", description: "", basePrice: "", inventoryCount: "", maxGuests: 2, amenities: "", roomImages: [] });
        const updatedResort = await res.json();
        setResorts(resorts.map(r => r._id === resortId ? updatedResort.resort : r));
        setEditingResort(updatedResort.resort);
      }
    } catch (e) {
      alert("Error adding room");
    }
  };

  const deleteRoom = async (resortId, roomId) => {
    if (!window.confirm("Remove this room type?")) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${resortId}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const updatedResort = await res.json();
        setResorts(resorts.map(r => r._id === resortId ? updatedResort.resort : r));
        setEditingResort(updatedResort.resort);
      }
    } catch (e) {
      alert("Error deleting room");
    }
  };

  const updateRoomFeatures = async (resortId, roomId, currentAmenities) => {
    const currentStr = currentAmenities && currentAmenities.length > 0 ? currentAmenities.join(', ') : "";
    const newFeatures = window.prompt("Update Room Features (Comma separated):", currentStr);

    if (newFeatures === null) return; // User cancelled

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${resortId}/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ amenities: newFeatures })
      });
      if (res.ok) {
        const updatedResort = await res.json();
        setResorts(resorts.map(r => r._id === resortId ? updatedResort.resort : r));
        setEditingResort(updatedResort.resort);
      } else {
        alert("Failed to update features");
      }
    } catch (e) {
      alert("Error updating room features");
    }
  };

  const removeImage = async (resortId, imageUrl) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${resortId}/images?imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const updatedResort = await res.json();
        setResorts(resorts.map(r => r._id === resortId ? updatedResort.resort : r));
        setEditingResort(updatedResort.resort);
      } else {
        alert("Failed to remove image");
      }
    } catch (e) {
      alert("Error removing image");
    }
  };

  if (editingResort) {
    return (
      <div className="admin-page-content">
        <div className="admin-page-header" style={{ padding: "0 0 2rem 0", display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ marginBottom: "0.25rem" }}>Manage Resort: {editingResort.name}</h1>
            <p style={{ color: "#a0a5b5" }}>{editingResort.location?.city}</p>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={() => setEditingResort(null)}>Back to Resorts</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem" }}>
          <h2>Resort Images</h2>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
            {editingResort.images?.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={getImageUrl(img)} alt={`Resort ${idx}`} style={{ height: "100px", borderRadius: "8px", objectFit: "cover" }} />
                <button
                  onClick={() => removeImage(editingResort._id, img)}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(248,113,113,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', lineHeight: '1' }}>
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: "#a0a5b5" }}>Add More Gallery Images (You can select multiple)</label>
            <input type="file" multiple accept="image/*" onChange={async (e) => {
              const files = e.target.files;
              if (!files.length) return;
              const payload = new FormData();
              Array.from(files).forEach(f => payload.append("newImages", f));
              try {
                const res = await fetch(`http://${window.location.hostname}:5000/api/resorts/admin/${editingResort._id}/images`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
                  body: payload
                });
                if (res.ok) {
                  const data = await res.json();
                  setResorts(resorts.map(r => r._id === editingResort._id ? data.resort : r));
                  setEditingResort(data.resort);
                } else {
                  alert("Failed to add images");
                }
              } catch (err) {
                alert("Error adding images");
              }
            }} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", width: "fit-content" }} />
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem" }}>
          <h2>Resort Room Types</h2>
          <div className="rooms-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {editingResort.roomTypes?.map(rt => (
              <div key={rt._id} style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#c9a96b", fontSize: "1.1rem" }}>{rt.title}</strong>
                  <div style={{ color: "#a0a5b5", fontSize: "0.9rem", marginTop: "4px" }}>₹{rt.basePrice} | Guests: {rt.maxGuests} | Total Inventory: {rt.inventoryCount}</div>
                  {rt.amenities?.length > 0 && <div style={{ color: "#a0a5b5", fontSize: "0.85rem", marginTop: "2px", opacity: 0.8 }}>Features: {rt.amenities.join(', ')}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="admin-btn" onClick={() => updateRoomFeatures(editingResort._id, rt._id, rt.amenities)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>Edit Features</button>
                  <button className="admin-btn-outline" onClick={() => deleteRoom(editingResort._id, rt._id)} style={{ padding: "0.4rem 0.8rem", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>Add New Room Type</h3>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr", marginTop: "1rem" }}>
            <input type="text" placeholder="Title (e.g. Presidential Suite)" value={newRoom.title} onChange={e => setNewRoom({ ...newRoom, title: e.target.value })} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            <input type="number" placeholder="Base Price (₹)" value={newRoom.basePrice} onChange={e => setNewRoom({ ...newRoom, basePrice: e.target.value })} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            <input type="number" placeholder="Max Guests" value={newRoom.maxGuests} onChange={e => setNewRoom({ ...newRoom, maxGuests: e.target.value })} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            <input type="number" placeholder="Inventory Count" value={newRoom.inventoryCount} onChange={e => setNewRoom({ ...newRoom, inventoryCount: e.target.value })} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            <textarea placeholder="Room Amenities & Features (Comma separated)" value={newRoom.amenities} onChange={e => setNewRoom({ ...newRoom, amenities: e.target.value })} style={{ gridColumn: "1 / -1", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", minHeight: "60px" }} />
            <label style={{ gridColumn: "1 / -1", color: "#a0a5b5" }}>Room Images (Select Multiple)</label>
            <input type="file" multiple accept="image/*" onChange={e => setNewRoom({ ...newRoom, roomImages: e.target.files })} style={{ gridColumn: "1 / -1", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            {newRoom.roomImages && newRoom.roomImages.length > 0 && (
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {Array.from(newRoom.roomImages).map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt={`Room Preview ${idx}`} style={{ height: "80px", borderRadius: "6px", objectFit: "cover" }} />
                ))}
              </div>
            )}
            <button className="admin-btn" onClick={() => addRoom(editingResort._id)} style={{ gridColumn: "1 / -1", padding: "1rem" }}>+ Add Room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-content">
      <div className="admin-page-header" style={{ padding: "0 0 2rem 0", display: 'flex', justifyContent: 'space-between' }}>
        <h1>Resorts Management</h1>
        <button className="admin-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add New Resort"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} style={{ background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem", display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a5b5" }}>Resort Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a5b5" }}>City</label>
            <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a5b5" }}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", minHeight: "80px" }} placeholder="Escape to this luxury resort..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#c9a96b" }}>Cover Image (Required)</label>
            <input type="file" accept="image/*" required onChange={e => setFormData({ ...formData, coverImage: e.target.files[0] })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            {formData.coverImage && (
              <img src={URL.createObjectURL(formData.coverImage)} alt="Cover Preview" style={{ marginTop: "1rem", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
            )}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#c9a96b" }}>Gallery Images (Select Multiple, Max 10)</label>
            <input type="file" multiple accept="image/*" onChange={e => setFormData({ ...formData, galleryImages: e.target.files })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
            {formData.galleryImages && formData.galleryImages.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                {Array.from(formData.galleryImages).map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt={`Gallery Preview ${idx}`} style={{ height: "100px", borderRadius: "6px", objectFit: "cover" }} />
                ))}
              </div>
            )}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#c9a96b" }}>Amenities (Comma Separated)</label>
            <textarea value={formData.amenities || ""} onChange={e => setFormData({ ...formData, amenities: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", minHeight: "80px" }} placeholder="Pool, Spa, Gym, WiFi" />
          </div>

          <h3 style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem" }}>Initial Room Setup</h3>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a5b5" }}>Standard Room Base Price (₹)</label>
            <input type="number" required value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a5b5" }}>Standard Room Inventory Count</label>
            <input type="number" required value={formData.inventory} onChange={e => setFormData({ ...formData, inventory: e.target.value })} style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px" }} />
          </div>
          <button type="submit" className="admin-btn" style={{ gridColumn: "1 / -1", padding: "1rem" }}>Create Resort</button>
        </form>
      )}

      {loading ? (
        <p>Loading resorts...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Resort</th>
                <th>City</th>
                <th>Stats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resorts.map(r => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <img 
                        src={r.images?.[0] ? getImageUrl(r.images[0]) : "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=100"} 
                        alt={r.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=100";
                        }}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }} 
                      />
                      <div>
                        <strong>{r.name}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#a0a5b5" }}>{r.images?.length || 0} Images</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.location?.city}</td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>
                      {r.roomTypes?.length || 0} Room Types<br />
                      {r.amenities?.length || 0} Amenities
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="admin-btn" onClick={() => setEditingResort(r)} style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}>
                        Manage
                      </button>
                      <button className="admin-btn admin-btn-outline" onClick={() => handleDelete(r._id)} style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
                        Delete
                      </button>
                    </div>
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
