import { useState, useEffect } from "react";
import API from "../../api/axios";
import { Link } from "react-router-dom";
import GridScan from "../../components/React-Bits-UI/GridScan";

/**
 * Page: /forgot-password
 * POSTs { email } to the backend endpoint that sends a reset link.
 * Expected backend endpoint: POST /api/forgot-password  (adjust if your API differs)
 */

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // success message
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      // Adjust endpoint path if your backend uses a different route name.
      const res = await API.post("/forgot-password", { email });
      // Many backends return message: "We have emailed your password reset link!"
      setStatus(res.data?.message || "If that email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send reset email. Try again.");
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
        <h2>Reset your password</h2>

        {status ? (
          <div className="alert alert-success">
            {status} <div style={{ marginTop: 8 }}><Link to="/login">Back to login</Link></div>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}

            <p>Enter the email associated with your account and we'll send a link to reset your password.</p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
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