import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// Make sure you have FontAwesome loaded in your HTML or in your main JS file
// For example, in public/index.html: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(null);

    try {
      await login(form);
      setSuccess("Login successful!");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(Object.values(err.response.data.errors).flat());
      } else {
        setErrors([err.response?.data?.message || "Invalid credentials"]);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {success && <div className="alert alert-success">{success}</div>}
      {errors.length > 0 && (
        <div className="error">
          <ul>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoFocus
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
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

      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
      <p>© {new Date().getFullYear()} 4SALE</p>
    </div>
  );
}