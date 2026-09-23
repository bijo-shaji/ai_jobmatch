import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(formData.username, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid username or password."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side: Brand Showcase */}
        <div className="auth-hero-section">
          <div className="auth-hero-brand">
            <div className="brand-icon">✦</div>
            <span>AI JobMatch</span>
          </div>

          <div className="auth-hero-content">
            <h2>Find Your Perfect Fit with Artificial Intelligence</h2>
            <p>
              AI JobMatch connects top talent with recruiter opportunities through instant resume analysis, match scoring, and seamless one-click applications.
            </p>

            <div className="auth-hero-features">
              <div className="hero-feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <strong>AI Match Score</strong>
                  <p>Compare your skills directly against job requirements.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Instant Applications</strong>
                  <p>Apply directly inside job cards with one click.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Real-time Tracking</strong>
                  <p>Track your shortlist, selection, and application status live.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-card">
          <div className="auth-heading">
            <h1>Welcome back 👋</h1>
            <p>Sign in to access your dashboard and matching results.</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;