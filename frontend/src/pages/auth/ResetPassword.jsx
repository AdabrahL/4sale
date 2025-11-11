import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import GridScan from "../../components/React-Bits-UI/GridScan";

/**
 * Page: /reset-password?token=... or route /reset-password/:token
 * Submits { token, email, password, password_confirmation } to backend endpoint.
 * Expected backend endpoint: POST /api/reset-password
 */

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromQuery);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const payload = { token, email, password, password_confirmation: passwordConfirmation };
      const res = await API.post("/reset-password", payload);
      setStatus(res.data?.message || "Password updated. You can now login.");
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      console.error("Reset password error:", err);
      const msg = err.response?.data?.message || "Failed to reset password. Check token and try again.";
      setError(msg);
    } finally {
      setLoading(false);
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
        <h2>Set a new password</h2>

        {status ? (
          <div className="alert alert-success">
            {status} <div style={{ marginTop: 8 }}><Link to="/login">Go to login</Link></div>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Reset token (from email)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Set new password"}</button>
            </form>
            <p style={{ marginTop: 12 }}>
              <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}