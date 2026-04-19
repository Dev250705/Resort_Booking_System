import { useEffect, useState } from "react";

function getAuthToken() {
  const t = sessionStorage.getItem("token");
  return t ? t.trim() : "";
}

export default function AdminExplore() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null
  });

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/explore?type=${activeTab}`);
      const data = await res.json();
      if (res.ok) setContent(data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/explore/admin/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      if (res.ok) await loadContent();
    } catch (e) {
      alert("Error deleting item");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return alert("Fill required fields");

    const payload = new FormData();
    payload.append("type", activeTab);
    payload.append("title", formData.title);
    if (formData.description) payload.append("description", formData.description);
    payload.append("image", formData.image);

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/explore/admin`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${getAuthToken()}` 
        },
        body: payload
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ title: "", description: "", image: null });
        await loadContent();
      } else {
        alert("Failed to add item");
      }
    } catch (e) {
      alert("Error adding item");
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header" style={{ padding: "0 0 2rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Explore Pages Management</h1>
        <button className="admin-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : `+ Add ${activeTab}`}
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
        {["gallery", "dining", "amenity"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1.5rem",
              background: activeTab === tab ? "rgba(201, 169, 107, 0.2)" : "transparent",
              color: activeTab === tab ? "#c9a96b" : "#a0a5b5",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              textTransform: "capitalize",
              transition: "0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} style={{ background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem", display: "grid", gap: "1rem" }}>
          <div>
            <label style={{display: "block", marginBottom: "0.5rem", color: "#a0a5b5"}}>Upload Image (Required)</label>
            <input type="file" accept="image/*" required onChange={e => setFormData({...formData, image: e.target.files[0]})} style={{width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px"}}/>
          </div>
          <div>
            <label style={{display: "block", marginBottom: "0.5rem", color: "#a0a5b5"}}>Title (Required)</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px"}}/>
          </div>
          {activeTab !== "gallery" && (
            <div>
              <label style={{display: "block", marginBottom: "0.5rem", color: "#a0a5b5"}}>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", minHeight: "80px"}}/>
            </div>
          )}
          <button type="submit" className="admin-btn" style={{ padding: "1rem", marginTop: "0.5rem" }}>Create Selected Item</button>
        </form>
      )}
      
      {loading ? (
        <p>Loading {activeTab} data...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {content.map(c => (
            <div key={c._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ height: "160px", backgroundImage: `url(${c.imageUrl?.startsWith('/uploads') ? 'http://' + window.location.hostname + ':5000' + c.imageUrl : c.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div style={{ padding: "1.25rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>{c.title}</h3>
                {c.description && <p style={{ fontSize: "0.85rem", color: "#a0a5b5", margin: "0 0 1rem 0" }}>{c.description}</p>}
                <button className="admin-btn-outline" onClick={() => handleDelete(c._id)} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", background: "transparent", cursor: "pointer" }}>Delete Item</button>
              </div>
            </div>
          ))}
          {content.length === 0 && (
             <p style={{ color: "#a0a5b5", gridColumn: "1 / -1" }}>No items found for {activeTab}. Please add some!</p>
          )}
        </div>
      )}
    </div>
  );
}
