// src/pages/Register.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header text-center">
              <h3>Register</h3>
            </div>
            <div className="card-body">
              {success && <div className="alert alert-success">{success}</div>}
              {error && (
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    <li>{error}</li>
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="password_confirmation"
                    className="form-label"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Register
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <small>© {new Date().getFullYear()} EstateRealtor</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
