import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "candidate",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const setRole = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const messages = Object.entries(data)
          .map(([field, message]) => {
            const value = Array.isArray(message)
              ? message.join(" ")
              : message;

            return `${field}: ${value}`;
          })
          .join(" ");

        setError(messages || "Registration failed. Please try again.");
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
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
            <h2>Start Your AI-Powered Recruitment Journey</h2>
            <p>
              Whether you are a job seeker seeking career opportunities or a recruiter looking for top-tier tech candidates, AI JobMatch streamlines the hiring process.
            </p>

            <div className="auth-hero-features">
              <div className="hero-feature-item">
                <span className="feature-icon">👤</span>
                <div>
                  <strong>For Candidates</strong>
                  <p>Upload resumes, run AI match scoring, and apply instantly.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <span className="feature-icon">💼</span>
                <div>
                  <strong>For Recruiters</strong>
                  <p>Post jobs, review candidate resumes, and manage hiring statuses.</p>
                </div>
              </div>

              <div className="hero-feature-item">
                <span className="feature-icon">🤖</span>
                <div>
                  <strong>Gemini AI Intelligence</strong>
                  <p>Automated skill gap analysis and hiring recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-card">
          <div className="auth-heading">
            <h1>Create account ✨</h1>
            <p>Join as a candidate or recruiter to get started.</p>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Registering as a</label>
              <div className="role-selector-toggle">
                <button
                  type="button"
                  className={`role-toggle-btn ${
                    formData.role === "candidate" ? "active" : ""
                  }`}
                  onClick={() => setRole("candidate")}
                >
                  <span>👤 Candidate</span>
                </button>
                <button
                  type="button"
                  className={`role-toggle-btn ${
                    formData.role === "recruiter" ? "active" : ""
                  }`}
                  onClick={() => setRole("recruiter")}
                >
                  <span>💼 Recruiter</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
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
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password2"
                  type="password"
                  name="password2"
                  placeholder="Confirm your password"
                  value={formData.password2}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;