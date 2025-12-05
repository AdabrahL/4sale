import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import GridScan from "../../components/React-Bits-UI/GridScan";
import "../../styles/auth.css";

// FontAwesome icons required (see Login.jsx for note)

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
    <>
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#392e4e"
        gridScale={0.1}
        scanColor="#FF9FFC"
        scanOpacity={0.4}
        enablePost
        bloomIntensity={0.6}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
      />
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
          <button className="google" type="button">
            <i className="fab fa-google"></i>
          </button>
          <button className="facebook" type="button">
            <i className="fab fa-facebook-f"></i>
          </button>
          <button className="linkedin" type="button">
            <i className="fab fa-linkedin-in"></i>
          </button>
        </div>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <Link to="/login" className="auth-cta-btn auth-cta-secondary">
          Log In
        </Link>

        <p>© {new Date().getFullYear()} 4SALE</p>
      </div>
    </>
  );
}