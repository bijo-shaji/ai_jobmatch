import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Analysis() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchResumes = async () => {
    try {
      const response = await api.get("/resumes/");
      setResumes(response.data);

      if (response.data.length > 0) {
        setSelectedResume(String(response.data[0].id));
      }
    } catch (err) {
      setError("Unable to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchAnalysis = async (resumeId) => {
    if (!resumeId) {
      setAnalysis(null);
      return;
    }

    try {
      setError("");

      const response = await api.get(
        `/ai-analysis/resume/${resumeId}/result/`
      );

      setAnalysis(response.data);
    } catch (err) {
      setAnalysis(null);

      if (err.response?.status !== 404) {
        setError("Unable to load resume analysis.");
      }
    }
  };

  useEffect(() => {
    if (selectedResume) {
      fetchAnalysis(selectedResume);
    }
  }, [selectedResume]);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError("Please select a resume first.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const response = await api.post(
        `/ai-analysis/resume/${selectedResume}/`
      );

      setAnalysis(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Resume analysis failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-main">
          <p className="empty-text">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              AI-Powered Insights
            </p>

            <h1>Resume Analysis</h1>

            <p>
              Understand your resume with AI-powered analysis.
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="empty-state">
            <div>📄</div>

            <h3>No resume available</h3>

            <p>
              Upload a resume before starting AI analysis.
            </p>

            <a
              href="/resumes"
              className="analysis-action-button"
            >
              Upload Resume →
            </a>
          </div>
        ) : (
          <>
            <div className="analysis-control-card">
              <div>
                <h2>Select Resume</h2>

                <p>
                  Choose a resume to analyze with AI.
                </p>
              </div>

              <div className="analysis-controls">
                <select
                  value={selectedResume}
                  onChange={(event) =>
                    setSelectedResume(event.target.value)
                  }
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

                <button
                  className="analysis-action-button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing
                    ? "Analyzing..."
                    : analysis
                    ? "Re-analyze Resume"
                    : "Analyze Resume →"}
                </button>
              </div>
            </div>

            {analysis && (
              <div className="analysis-content">

                {/* Summary */}
                <section className="analysis-card analysis-summary">
                  <div className="analysis-card-heading">
                    <span>🧠</span>

                    <div>
                      <h2>AI Summary</h2>
                      <p>Overall analysis of your resume</p>
                    </div>
                  </div>

                  <p className="summary-text">
                    {analysis.summary}
                  </p>
                </section>

                {/* Experience */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>💼</span>

                    <div>
                      <h2>Experience Level</h2>
                      <p>AI-estimated professional level</p>
                    </div>
                  </div>

                  <div className="experience-badge">
                    {analysis.experience_level}
                  </div>
                </section>

                {/* Skills */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>🛠️</span>

                    <div>
                      <h2>Skills</h2>
                      <p>Skills detected in your resume</p>
                    </div>
                  </div>

                  <div className="skill-list">
                    {analysis.skills?.map((skill, index) => (
                      <span
                        className="skill-tag"
                        key={index}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Strengths */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>⭐</span>

                    <div>
                      <h2>Strengths</h2>
                      <p>Your strongest areas</p>
                    </div>
                  </div>

                  <ul className="analysis-list">
                    {analysis.strengths?.map(
                      (strength, index) => (
                        <li key={index}>
                          {strength}
                        </li>
                      )
                    )}
                  </ul>
                </section>

                {/* Missing Skills */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>📈</span>

                    <div>
                      <h2>Skills to Improve</h2>
                      <p>Recommended areas for improvement</p>
                    </div>
                  </div>

                  <div className="skill-list">
                    {analysis.missing_skills?.map(
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
                </section>

                {/* Education */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>🎓</span>

                    <div>
                      <h2>Education</h2>
                      <p>Education information detected</p>
                    </div>
                  </div>

                  <ul className="analysis-list">
                    {analysis.education?.map(
                      (education, index) => (
                        <li key={index}>
                          {education}
                        </li>
                      )
                    )}
                  </ul>
                </section>

                {/* Suggestions */}
                <section className="analysis-card">
                  <div className="analysis-card-heading">
                    <span>💡</span>

                    <div>
                      <h2>AI Suggestions</h2>
                      <p>Ways to improve your resume</p>
                    </div>
                  </div>

                  <ul className="analysis-list">
                    {analysis.suggestions?.map(
                      (suggestion, index) => (
                        <li key={index}>
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                </section>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Analysis;