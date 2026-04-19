import { useEffect, useState } from "react";
import "./adminReviews.css";

function getAuthToken() {
  const t = sessionStorage.getItem("token");
  return t ? t.trim() : "";
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadPending = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/reviews/admin/pending`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        setError(data.message || "Not authorized");
        setReviews([]);
        return;
      }
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approve = async (reviewId) => {
    setActionId(reviewId);
    try {
      const res = await fetch(
        `http://${window.location.hostname}:5000/api/reviews/admin/${reviewId}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approve failed");
      await loadPending();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  const reject = async (reviewId) => {
    if (!window.confirm("Reject and delete this review? The guest can submit again.")) return;
    setActionId(reviewId);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/reviews/admin/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reject failed");
      await loadPending();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-page-content">
      <div className="admin-reviews-inner">
        <h1>Review Moderation</h1>
        <p className="admin-reviews-lead">
          Manage guest feedback. Approve reviews to display them publicly on resort pages, or reject inappropriate ones to clear them from pending.
        </p>

        {loading && <p className="admin-reviews-status">Loading…</p>}
        {error && <p className="admin-reviews-error">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="admin-reviews-empty">No pending reviews.</p>
        )}

        {!loading && reviews.length > 0 && (
          <ul className="admin-review-list">
            {reviews.map((r) => (
              <li key={r._id} className="admin-review-item">
                <div className="admin-review-meta">
                  <strong>{r.resortName}</strong>
                  <span className="admin-review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="admin-review-user">
                    {r.userName} · {r.userEmail}
                  </span>
                  <time className="admin-review-time">
                    {new Date(r.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="admin-review-comment">{r.comment}</p>
                <div className="admin-review-actions">
                  <button
                    type="button"
                    className="admin-btn-approve"
                    disabled={actionId === r._id}
                    onClick={() => approve(r._id)}
                  >
                    {actionId === r._id ? "…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-reject"
                    disabled={actionId === r._id}
                    onClick={() => reject(r._id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
