import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./login.css";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setErrors({ success: "Login successful! Redirecting..." });
        const redirectPath = location.state?.from || "/home";
        const redirectState = location.state?.searchState || {};

        setTimeout(() => navigate(redirectPath, { state: redirectState }), 1500);
      } else {
        setErrors({ api: data.message || "Invalid email or password" });
      }
    } catch {
      setErrors({ api: "Server unreachable. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setForgotError("Enter a valid email address");
      return;
    }
    setIsSending(true);
    setForgotMessage("");
    setForgotError("");
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setForgotMessage("Reset link sent! Check your email.");
      } else {
        setForgotError(data.message || "Email not found.");
      }
    } catch {
      setForgotError("Something went wrong. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      style={{ width: 18, height: 18 }}
    >
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
    <div className="login-root">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card">
        {location.state?.message && (
          <div className="login-msg login-msg-error">
            {location.state.message}
          </div>
        )}
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your experience.</p>
        </div>

        {errors.api && (
          <div className="login-msg login-msg-error">{errors.api}</div>
        )}
        {errors.success && (
          <div className="login-msg login-msg-success">{errors.success}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div
            className={`login-field-wrap ${focused === "email" ? "login-field-focused" : ""} ${errors.email ? "login-field-error" : ""}`}
          >
            <div className="login-field-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              autoComplete="off"
            />
            {errors.email && (
              <span className="login-field-error-msg">{errors.email}</span>
            )}
          </div>

          <div
            className={`login-field-wrap ${focused === "password" ? "login-field-focused" : ""} ${errors.password ? "login-field-error" : ""}`}
          >
            <div className="login-field-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
              autoComplete="off"
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
            {errors.password && (
              <span className="login-field-error-msg">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: 18, height: 18 }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="login-forgot">
          <span onClick={() => setShowForgotModal(true)}>Forgot Password?</span>
        </div>

        <p className="login-bottom-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      {showForgotModal && (
        <div className="login-modal-overlay">
          <div className="login-modal-box">
            <h2>Reset Password</h2>
            <p>Enter your registered email. We'll send a reset link.</p>

            <div
              className={`login-field-wrap ${forgotError ? "login-field-error" : ""}`}
            >
              <div className="login-field-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotError("");
                }}
              />
              {forgotError && (
                <span className="login-field-error-msg">{forgotError}</span>
              )}
            </div>

            {forgotMessage && (
              <div className="login-msg login-msg-success">{forgotMessage}</div>
            )}

            <button
              onClick={handleForgotPassword}
              disabled={isSending}
              className="login-submit-btn"
            >
              {isSending ? (
                <span className="login-spinner" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotMessage("");
                setForgotEmail("");
                setForgotError("");
              }}
              className="login-modal-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
