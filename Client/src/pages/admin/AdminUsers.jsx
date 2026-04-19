import { useEffect, useState } from "react";

function getAuthToken() {
  const t = sessionStorage.getItem("token");
  return t ? t.trim() : "";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/users/admin/all`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to make this user ${newRole}?`)) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/users/admin/${userId}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        await loadUsers();
      } else {
        alert("Failed to update role");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-page-header" style={{ padding: "0 0 2rem 0" }}>
        <h1>Users Management</h1>
      </div>
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`admin-badge ${u.isVerified ? "success" : "warning"}`}>
                      {u.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.role === "admin" ? "danger" : "neutral"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="admin-btn admin-btn-outline" 
                      onClick={() => toggleRole(u._id, u.role)}
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}
                    >
                      Make {u.role === "admin" ? "User" : "Admin"}
                    </button>
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
