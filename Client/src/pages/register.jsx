import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.phone.match(/^\d{10}$/))
      newErrors.phone = "Enter a valid 10-digit phone number";
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
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "user",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setErrors({ success: data.message || "Registered successfully!" });
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: form.email } });
        }, 1500);
      } else {
        setErrors({ api: data.message || "Registration failed. Try again." });
      }
    } catch {
      setErrors({ api: "Server unreachable. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      type: "text",
      placeholder: "Full Name",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email Address",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      toggle: () => setShowPassword(!showPassword),
      toggleIcon: showPassword,
    },
    {
      name: "confirmPassword",
      type: showConfirm ? "text" : "password",
      placeholder: "Confirm Password",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      toggle: () => setShowConfirm(!showConfirm),
      toggleIcon: showConfirm,
    },
    {
      name: "phone",
      type: "tel",
      placeholder: "Phone Number",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
  ];

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
    <div className="register-page">
      <div className="register-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="noise-overlay" />

        <div className="register-card">
          {/* Header */}
          <div className="card-header">
            <h1>Create Account</h1>
            <p>Join the experience. It only takes a moment.</p>
          </div>

          {/* Global Messages */}
          {errors.api && <div className="msg msg-error">{errors.api}</div>}
          {errors.success && (
            <div className="msg msg-success">{errors.success}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {fields.map((field, i) => (
              <div
                key={field.name}
                className={`field-wrap ${focused === field.name ? "field-focused" : ""} ${errors[field.name] ? "field-error" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="field-icon">{field.icon}</div>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocused(field.name)}
                  onBlur={() => setFocused("")}
                  autoComplete="off"
                />
                {field.toggle && (
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={field.toggle}
                    tabIndex={-1}
                  >
                    <EyeIcon open={field.toggleIcon} />
                  </button>
                )}
                {errors[field.name] && (
                  <span className="field-error-msg">{errors[field.name]}</span>
                )}
              </div>
            ))}

            {/* Password Strength */}
            {form.password && (
              <div className="strength-bar">
                <div
                  className={`strength-fill strength-${
                    form.password.length < 6
                      ? "weak"
                      : form.password.length < 10
                        ? "medium"
                        : "strong"
                  }`}
                />
                <span>
                  {form.password.length < 6
                    ? "Weak"
                    : form.password.length < 10
                      ? "Medium"
                      : "Strong"}
                </span>
              </div>
            )}

            <button
              type="submit"
              className={`submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <span>Create Account</span>
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

          <p className="login-link">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
