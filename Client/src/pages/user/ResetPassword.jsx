import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./resetPassword.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "Please enter new password";
    else if (newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleReset = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("success");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setMessage("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
      {open ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="reset-root">
      <div className="reset-orb reset-orb-1" />
      <div className="reset-orb reset-orb-2" />

      <div className="reset-card">
        <div className="reset-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>

        {message === "success" && (
          <div className="reset-msg reset-msg-success">Password reset successful! Redirecting...</div>
        )}
        {message && message !== "success" && (
          <div className="reset-msg reset-msg-error">{message}</div>
        )}

        {/* New Password */}
        <div className={`reset-field-wrap ${focused === "new" ? "reset-field-focused" : ""} ${errors.newPassword ? "reset-field-error" : ""}`}>
          <div className="reset-field-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: "" }); }}
            onFocus={() => setFocused("new")}
            onBlur={() => setFocused("")}
          />
          <button type="button" className="reset-eye-btn" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
            <EyeIcon open={showNew} />
          </button>
          {errors.newPassword && <span className="reset-field-error-msg">{errors.newPassword}</span>}
        </div>

        {/* Password Strength */}
        {newPassword && (
          <div className="reset-strength-bar">
            <div className={`reset-strength-fill reset-strength-${newPassword.length < 6 ? "weak" : newPassword.length < 10 ? "medium" : "strong"}`} />
            <span>{newPassword.length < 6 ? "Weak" : newPassword.length < 10 ? "Medium" : "Strong"}</span>
          </div>
        )}

        {/* Confirm Password */}
        <div className={`reset-field-wrap ${focused === "confirm" ? "reset-field-focused" : ""} ${errors.confirmPassword ? "reset-field-error" : ""}`}>
          <div className="reset-field-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: "" }); }}
            onFocus={() => setFocused("confirm")}
            onBlur={() => setFocused("")}
          />
          <button type="button" className="reset-eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
            <EyeIcon open={showConfirm} />
          </button>
          {errors.confirmPassword && <span className="reset-field-error-msg">{errors.confirmPassword}</span>}
        </div>

        <button onClick={handleReset} disabled={loading} className="reset-submit-btn">
          {loading ? (
            <span className="reset-spinner" />
          ) : (
            <>
              <span>Reset Password</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;