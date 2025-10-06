// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(null);

    try {
      await login(form);
      setSuccess("Login successful!");
      navigate("/"); // redirect after login
    } catch (err) {
      // Laravel usually returns { errors: { email: [...], password: [...] } }
      if (err.response?.data?.errors) {
        setErrors(Object.values(err.response.data.errors).flat());
      } else {
        setErrors([err.response?.data?.message || "Invalid credentials"]);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header text-center">
              <h3>Login</h3>
            </div>

            <div className="card-body">
              {success && (
                <div className="alert alert-success">{success}</div>
              )}

              {errors.length > 0 && (
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </div>

            <div className="card-footer text-center">
              <small>© {new Date().getFullYear()} 4SALE</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
