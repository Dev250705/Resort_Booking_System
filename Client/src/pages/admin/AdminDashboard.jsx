import { Link } from "react-router-dom";
import "./adminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-page-content">
      <div className="admin-dashboard-inner">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="admin-lead">Welcome back. Manage your resort platform from here.</p>
        </header>
        
        <div className="admin-grid">
          <Link to="/admin/reviews" className="admin-card">
            <div className="admin-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h2>Reviews Moderation</h2>
            <p>Approve or reject guest reviews before they appear publicly.</p>
          </Link>

          <Link to="/admin/bookings" className="admin-card">
            <div className="admin-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2>Manage Bookings</h2>
            <p>View all reservations, modify status, and handle cancellations.</p>
          </Link>

          <Link to="/admin/users" className="admin-card">
            <div className="admin-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2>User Management</h2>
            <p>Manage user accounts, admin roles, and guest profiles.</p>
          </Link>

          <Link to="/admin/resorts" className="admin-card">
            <div className="admin-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6"/></svg>
            </div>
            <h2>Resorts Database</h2>
            <p>Add new resorts, configure rooms, set pricing and inventory.</p>
          </Link>

          <Link to="/admin/contacts" className="admin-card">
            <div className="admin-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <h2>Inbox & Messages</h2>
            <p>Read and reply to user queries from the Contact page.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
