import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function JobDescriptionAnalyzer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");

  const [description, setDescription] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("/resumes/");

        setResumes(response.data);

        if (response.data.length > 0) {
          setSelectedResume(String(response.data[0].id));
        }
      } catch (err) {
        setError("Unable to load your resumes.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError("Please select a resume.");
      return;
    }

    if (!description.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post("/jobs/jd-match/", {
        resume: Number(selectedResume),
        description: description.trim(),
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Job description analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar />

        <main className="dashboard-main">
          <div className="page-loading">
            Loading resumes...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              AI Job Matching
            </p>

            <h1>Job Description Analyzer</h1>

            <p>
              Paste any job description and see how
              well your resume matches it.
            </p>
          </div>
        </header>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="empty-state">
            <div>📄</div>

            <h3>Upload a resume first</h3>

            <p>
              Upload and analyze your resume before
              matching a job description.
            </p>

            <Link
              to="/resumes"
              className="analysis-action-button"
            >
              Upload Resume →
            </Link>
          </div>
        ) : (
          <>
            <div className="jd-analyzer-card">
              <div className="form-group">
                <label htmlFor="resume">
                  Select Resume
                </label>

                <select
                  id="resume"
                  value={selectedResume}
                  onChange={(event) => {
                    setSelectedResume(event.target.value);
                    setResult(null);
                  }}
                >
                  {resumes.map((resume) => (
                    <option
                      key={resume.id}
                      value={resume.id}
                    >
                      {resume.file_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="job-description">
                  Job Description
                </label>

                <textarea
                  id="job-description"
                  className="job-description-textarea"
                  rows="16"
                  placeholder="Paste the complete job description here..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>

              <button
                className="analysis-action-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? "Analyzing..."
                  : "Analyze Job Match →"}
              </button>
            </div>

            {result && (
              <section className="match-result-card">
                <div className="match-result-header">
                  <div>
                    <p className="dashboard-eyebrow">
                      AI Match Result
                    </p>

                    <h2>
                      Resume vs Job Description
                    </h2>
                  </div>

                  <div className="match-score">
                    <strong>
                      {Math.round(result.match_score)}
                    </strong>

                    <span>% Match</span>
                  </div>
                </div>

                <div className="match-result-grid">
                  <div className="match-result-section">
                    <h3>✓ Matched Skills</h3>

                    <div className="skill-list">
                      {result.matched_skills?.map(
                        (skill, index) => (
                          <span
                            className="skill-tag"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="match-result-section">
                    <h3>+ Skills to Improve</h3>

                    <div className="skill-list">
                      {result.missing_skills?.map(
                        (skill, index) => (
                          <span
                            className="missing-skill-tag"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="recommendation-box">
                  <h3>🤖 AI Recommendation</h3>

                  <p>{result.recommendation}</p>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default JobDescriptionAnalyzer;