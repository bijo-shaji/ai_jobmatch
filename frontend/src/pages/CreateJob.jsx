import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      await api.post("/jobs/", formData);
      navigate("/jobs", { replace: true });
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

        setError(
          messages || "Unable to create job."
        );
      } else {
        setError(
          "Unable to connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              Recruiter Portal
            </p>

            <h1>Create Job</h1>

            <p>
              Post a new opportunity for candidates.
            </p>
          </div>
        </header>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="create-job-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Job Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Python Full Stack Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">
                Company
              </label>

              <input
                id="company"
                name="company"
                type="text"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Job Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="12"
                placeholder="Enter responsibilities, required skills, qualifications and other job requirements..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-job-actions">
              <Link
                to="/jobs"
                className="secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="analysis-action-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Job →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateJob;
