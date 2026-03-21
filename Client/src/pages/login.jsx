import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css"; // 👈 same CSS use kar

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok && data.user) {
        alert("Login successful");
        navigate("/home");
      } else {
        alert(data.message || "Invalid email or password");
      }

    } catch (error) {
      alert("Login failed");
    }
  };

  return (
   <div className="container login-bg">
      <div className="form-box">
        <h2>Welcome</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <Link to="/register">Create new account</Link>
      </div>
    </div>
  );
}

export default Login;