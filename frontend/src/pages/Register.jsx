import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await register(form);
      setSuccess("Registration successful! You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && (
        <div className="error">
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>

      <div className="social-login">
        <button className="google" type="button">Google</button>
        <button className="facebook" type="button">Facebook</button>
        <button className="linkedin" type="button">LinkedIn</button>
      </div>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      <p>© {new Date().getFullYear()} EstateRealtor</p>
    </div>
  );
}