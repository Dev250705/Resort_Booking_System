import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./verifyOtp.css";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    setError("");
    setMessage("");

    const res = await fetch("http://localhost:5000/api/users/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: finalOtp }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Verification successful");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(data.message);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    const res = await fetch("http://localhost:5000/api/users/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("OTP resent");
      setTimer(60);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="otp-container">
      <h2>Verify your email</h2>
      <p>Enter the 6-digit code sent to</p>
      <span className="email">{email}</span>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            ref={(el) => (inputs.current[index] = el)}
            onChange={(e) => handleChange(e.target.value, index)}
          />
        ))}
      </div>

      <button className="verify-btn" onClick={handleVerify}>
        Verify
      </button>

      <p className="resend-text">
        Didn’t receive code?{" "}
        <span
          className={timer > 0 ? "disabled" : "resend"}
          onClick={handleResend}
        >
          Resend {timer > 0 && `(${timer}s)`}
        </span>
      </p>
    </div>
  );
}

export default VerifyOtp;