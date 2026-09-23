import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Applications() {
  const { user } = useAuth();
  const location = useLocation();
  const isCandidate = user?.role === "candidate";

  const [applications, setApplications] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState(
    location.state?.filterJobId ? String(location.state.filterJobId) : "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState({});
  const [updateError, setUpdateError] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/jobs/applications/");
      setApplications(response.data);
    } catch (err) {
      setError("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    setUpdateSuccess((prev) => ({ ...prev, [appId]: "" }));
    setUpdateError((prev) => ({ ...prev, [appId]: "" }));

    try {
      const response = await api.patch(`/jobs/applications/${appId}/`, {
        status: newStatus,
      });

      setApplications((current) =>
        current.map((app) => (app.id === appId ? response.data : app))
      );
      setUpdateSuccess((prev) => ({
        ...prev,
        [appId]: `Status updated to ${newStatus.toUpperCase()}`,
      }));
    } catch (err) {
      setUpdateError((prev) => ({
        ...prev,
        [appId]:
          err.response?.data?.detail || "Failed to update application status.",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "shortlisted":
        return "badge-good";
      case "selected":
        return "badge-strong";
      case "rejected":
        return "badge-low";
      default:
        return "badge-moderate";
    }
  };

  const uniqueJobsMap = {};
  applications.forEach((app) => {
    const jId = app.job_details?.id || app.job;
    if (jId && !uniqueJobsMap[jId]) {
      uniqueJobsMap[jId] = app.job_details?.title || `Job #${jId}`;
    }
  });

  const filteredApplications = applications.filter((app) => {
    if (selectedJobFilter === "all") return true;
    const jId = app.job_details?.id || app.job;
    return String(jId) === String(selectedJobFilter);
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <main className="dashboard-main">
          <div className="page-loading">Loading applications...</div>
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
              {isCandidate ? "Candidate Portal" : "Recruiter Portal"}
            </p>

            <h1>{isCandidate ? "My Applications" : "Candidate Applications"}</h1>

            <p>
              {isCandidate
                ? "Track the real-time status of all your submitted job applications."
                : "Review candidate profiles, resumes, AI match scores, and update application statuses."}
            </p>
          </div>
        </header>

        {error && <div className="auth-error">{error}</div>}

        {!isCandidate && applications.length > 0 && (
          <div className="job-control-card filter-card">
            <div>
              <h2>Filter Applications by Job Posting</h2>
              <p>Select a job to view candidates who applied to that specific role.</p>
            </div>

            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
            >
              <option value="all">All Jobs ({applications.length} Applications)</option>
              {Object.entries(uniqueJobsMap).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div>📋</div>

            <h3>
              {isCandidate
                ? "You haven't applied to any jobs yet"
                : selectedJobFilter !== "all"
                ? "No applications for this specific job yet"
                : "No applications received yet"}
            </h3>

            <p>
              {isCandidate
                ? "Browse recruiter job opportunities and apply directly from the job card."
                : "Applications submitted by candidates for your job postings will appear here."}
            </p>

            {isCandidate && (
              <Link to="/jobs" className="analysis-action-button">
                Browse Jobs →
              </Link>
            )}
          </div>
        ) : isCandidate ? (
          /* CANDIDATE VIEW */
          <section className="applications-list-section">
            <div className="job-list">
              {filteredApplications.map((app) => {
                const job = app.job_details || {};
                const resume = app.resume_details || {};
                const match = app.match_details;

                return (
                  <article className="application-card" key={app.id}>
                    <div className="application-card-header">
                      <div>
                        <h3>{job.title || "Job Application"}</h3>
                        {job.company && (
                          <p className="job-company">{job.company}</p>
                        )}
                      </div>

                      <div className="app-status-badge-container">
                        <span
                          className={`status-pill ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="application-details-grid">
                      <div className="app-detail-item">
                        <span className="detail-label">Applied Date</span>
                        <span className="detail-value">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="app-detail-item">
                        <span className="detail-label">Selected Resume</span>
                        <span className="detail-value">
                          {resume.file_name || "Resume File"}
                        </span>
                      </div>

                      {match && (
                        <div className="app-detail-item">
                          <span className="detail-label">AI Match Score</span>
                          <span className="detail-value score-highlight">
                            {Math.round(match.match_score)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <div className="app-job-summary">
                        <strong>Job Summary:</strong>
                        <p>{job.description}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          /* RECRUITER VIEW */
          <section className="applications-list-section">
            <div className="job-list">
              {filteredApplications.map((app) => {
                const candidate = app.candidate_details || {};
                const job = app.job_details || {};
                const resume = app.resume_details || {};
                const match = app.match_details;
                const isUpdating = updatingId === app.id;
                const succMsg = updateSuccess[app.id];
                const errMsg = updateError[app.id];

                return (
                  <article className="recruiter-app-card" key={app.id}>
                    <div className="recruiter-app-header">
                      <div>
                        <div className="candidate-info-primary">
                          <h2>
                            {candidate.first_name || candidate.last_name
                              ? `${candidate.first_name || ""} ${
                                  candidate.last_name || ""
                                }`.trim()
                              : candidate.username}
                          </h2>
                          <span className="candidate-username">
                            @{candidate.username}
                          </span>
                        </div>

                        <p className="candidate-email">✉ {candidate.email}</p>

                        <div className="applied-for-tag">
                          Applied for: <strong>{job.title}</strong>{" "}
                          {job.company && `at ${job.company}`}
                        </div>
                      </div>

                      <div className="app-header-right">
                        <span className="app-date">
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        {resume.file_url ? (
                          <a
                            href={resume.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resume-download-btn"
                          >
                            📄 View Resume ({resume.file_name})
                          </a>
                        ) : (
                          <span className="resume-filename-tag">
                            📄 {resume.file_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {succMsg && (
                      <div className="card-success-banner">{succMsg}</div>
                    )}
                    {errMsg && (
                      <div className="auth-error inline-error">{errMsg}</div>
                    )}

                    {/* AI Match Info Section */}
                    {match ? (
                      <div className="recruiter-match-box">
                        <div className="recruiter-match-header">
                          <span className="dashboard-eyebrow">AI Analysis Fit</span>
                          <div className="match-score-badge">
                            <strong>{Math.round(match.match_score)}%</strong> Match Score
                          </div>
                        </div>

                        <div className="in-card-skills-grid">
                          <div className="in-card-skills-col">
                            <h4>✓ Candidate Matched Skills</h4>
                            <div className="skill-list">
                              {match.matched_skills?.length > 0 ? (
                                match.matched_skills.map((skill, i) => (
                                  <span className="skill-tag" key={i}>
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="no-skills">None identified</span>
                              )}
                            </div>
                          </div>

                          <div className="in-card-skills-col">
                            <h4>+ Missing Skills</h4>
                            <div className="skill-list">
                              {match.missing_skills?.length > 0 ? (
                                match.missing_skills.map((skill, i) => (
                                  <span className="missing-skill-tag" key={i}>
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="no-skills">None identified</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {match.recommendation && (
                          <div className="recruiter-recommendation">
                            <strong>🤖 AI Recommendation:</strong>
                            <p>{match.recommendation}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-match-notice">
                        ℹ Candidate applied directly without running AI Job Match.
                      </div>
                    )}

                    {/* Application Status Controls */}
                    <div className="status-control-section">
                      <div className="status-control-label">
                        <strong>Current Status:</strong>
                        <span className={`status-pill ${getStatusClass(app.status)}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="status-action-buttons">
                        <span>Update Status:</span>
                        {["pending", "shortlisted", "selected", "rejected"].map(
                          (st) => (
                            <button
                              key={st}
                              className={`status-opt-btn status-btn-${st} ${
                                app.status === st ? "active-status" : ""
                              }`}
                              onClick={() => handleStatusChange(app.id, st)}
                              disabled={isUpdating || app.status === st}
                            >
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Applications;
