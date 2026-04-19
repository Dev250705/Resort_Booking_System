import { Navigate, useLocation } from "react-router-dom";

function isAdminFromToken() {
  const t = sessionStorage.getItem("token")?.trim();
  if (!t) return false;
  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.role === "admin";
  } catch {
    return false;
  }
}

export default function AdminRoute({ children }) {
  const location = useLocation();
  if (!sessionStorage.getItem("token")?.trim()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isAdminFromToken()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
