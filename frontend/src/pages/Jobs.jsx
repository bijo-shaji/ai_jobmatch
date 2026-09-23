import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Jobs() {
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";

  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [matchResultsByJobId, setMatchResultsByJobId] = useState({});
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardErrors, setCardErrors] = useState({});
  const [cardSuccess, setCardSuccess] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsResponse = await api.get("/jobs/");
        setJobs(jobsResponse.data);

        const appsResponse = await api.get("/jobs/applications/").catch(() => ({ data: [] }));
        setApplications(appsResponse.data);

        if (isCandidate) {
          const [resumesResponse, matchesResponse] = await Promise.all([
            api.get("/resumes/"),
            api.get("/jobs/matches/").catch(() => ({ data: [] })),
          ]);

          setResumes(resumesResponse.data);

          if (resumesResponse.data.length > 0) {
            setSelectedResume(String(resumesResponse.data[0].id));
          }

          if (matchesResponse.data && matchesResponse.data.length > 0) {
            const initialMatches = {};
            matchesResponse.data.forEach((match) => {
              const jobId = typeof match.job === "object" ? match.job.id : match.job;
              if (jobId && !initialMatches[jobId]) {
                initialMatches[jobId] = match;
              }
            });
            setMatchResultsByJobId(initialMatches);
          }
        }
      } catch (err) {
        setError("Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCandidate]);

  const handleMatch = async (job) => {
    if (!selectedResume) {
      setCardErrors((prev) => ({
        ...prev,
        [job.id]: "Please select or upload a resume first.",
      }));
      return;
    }

    setMatchingJobId(job.id);
    setCardErrors((prev) => ({ ...prev, [job.id]: "" }));
    setCardSuccess((prev) => ({ ...prev, [job.id]: "" }));

    try {
      const response = await api.post(
        `/jobs/${job.id}/match/${selectedResume}/`
      );

      setMatchResultsByJobId((prev) => ({
        ...prev,
        [job.id]: response.data,
      }));
    } catch (err) {
      setCardErrors((prev) => ({
        ...prev,
        [job.id]:
          err.response?.data?.detail ||
          "Job matching failed. Please try again.",
      }));
    } finally {
      setMatchingJobId(null);
    }
  };

  const handleApply = async (job) => {
    if (!selectedResume) {
      setCardErrors((prev) => ({
        ...prev,
        [job.id]: "Please select a resume before applying.",
      }));
      return;
    }

    setApplyingJobId(job.id);
    setCardErrors((prev) => ({ ...prev, [job.id]: "" }));
    setCardSuccess((prev) => ({ ...prev, [job.id]: "" }));

    try {
      const response = await api.post("/jobs/applications/", {
        job: job.id,
        resume: Number(selectedResume),
      });

      setApplications((prev) => [response.data, ...prev]);
      setCardSuccess((prev) => ({
        ...prev,
        [job.id]: "Application submitted successfully!",
      }));
    } catch (err) {
      setCardErrors((prev) => ({
        ...prev,
        [job.id]:
          err.response?.data?.detail ||
          "Failed to submit application. Please try again.",
      }));
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm("Delete this job posting?");

    if (!confirmed) {
      return;
    }

    setDeletingId(jobId);
    setError("");

    try {
      await api.delete(`/jobs/${jobId}/`);

      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete this job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getMatchLevel = (score) => {
    const s = Number(score) || 0;
    if (s >= 80) return { label: "Strong Match", className: "badge-strong" };
    if (s >= 60) return { label: "Good Match", className: "badge-good" };
    if (s >= 40) return { label: "Moderate Match", className: "badge-moderate" };
    return { label: "Low Match", className: "badge-low" };
  };

  const getExistingApplication = (jobId) => {
    return applications.find((app) => {
      const id = typeof app.job === "object" ? app.job.id : app.job;
      return id === jobId;
    });
  };

  const getJobApplicationsCount = (jobId) => {
    return applications.filter((app) => {
      const id = typeof app.job === "object" ? app.job.id : app.job;
      return id === jobId;
    }).length;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <main className="dashboard-main">
          <div className="page-loading">Loading jobs...</div>
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
              {isCandidate ? "AI Job Matching" : "Recruiter Portal"}
            </p>

            <h1>{isCandidate ? "Find Jobs" : "My Jobs"}</h1>

            <p>
              {isCandidate
                ? "Explore recruiter opportunities, analyze your fit, and apply instantly."
                : "Manage the job opportunities you have posted."}
            </p>
          </div>

          {!isCandidate && (
            <Link to="/jobs/create" className="analysis-action-button">
              Create Job →
            </Link>
          )}
        </header>

        {error && <div className="auth-error">{error}</div>}

        {isCandidate && resumes.length === 0 ? (
          <div className="empty-state">
            <div>📄</div>
            <h3>Upload a resume first</h3>
            <p>
              Upload and analyze your resume before matching it with jobs.
            </p>

            <Link to="/resumes" className="analysis-action-button">
              Upload Resume →
            </Link>
          </div>
        ) : (
          isCandidate && (
            <div className="job-control-card">
              <div>
                <h2>Active Resume for Matching & Applying</h2>
                <p>
                  Select the resume to use for matching and job applications.
                </p>
              </div>

              <select
                value={selectedResume}
                onChange={(event) => setSelectedResume(event.target.value)}
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.file_name}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div>💼</div>

            <h3>
              {isCandidate
                ? "No recruiter jobs available"
                : "No jobs posted yet"}
            </h3>

            <p>
              {isCandidate
                ? "Check back later for new opportunities."
                : "Create your first job posting to get started."}
            </p>

            {!isCandidate && (
              <Link to="/jobs/create" className="analysis-action-button">
                Create Your First Job →
              </Link>
            )}
          </div>
        ) : (
          <section className="jobs-section">
            <div className="jobs-section-heading">
              <div>
                <h2>
                  {isCandidate
                    ? "Recruiter Opportunities"
                    : "Your Job Postings"}
                </h2>

                <p>
                  {isCandidate
                    ? "Match your skills with posted roles and apply in one click."
                    : "Your active job postings are listed below."}
                </p>
              </div>

              <span className="job-count">
                {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
              </span>
            </div>

            <div className="job-list">
              {jobs.map((job) => {
                const matchResult = matchResultsByJobId[job.id];
                const application = isCandidate ? getExistingApplication(job.id) : null;
                const isMatching = matchingJobId === job.id;
                const isApplying = applyingJobId === job.id;
                const cardErr = cardErrors[job.id];
                const cardSucc = cardSuccess[job.id];
                const matchLevel = matchResult ? getMatchLevel(matchResult.match_score) : null;
                const recruiterAppCount = !isCandidate ? getJobApplicationsCount(job.id) : 0;

                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <div>
                        <h3>{job.title}</h3>

                        {job.company && (
                          <p className="job-company">{job.company}</p>
                        )}
                      </div>

                      <span className="job-date">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    {cardErr && <div className="auth-error inline-error">{cardErr}</div>}
                    {cardSucc && <div className="card-success-banner">{cardSucc}</div>}

                    {isCandidate ? (
                      <div className="job-card-candidate-actions">
                        <div className="match-trigger-row">
                          <button
                            className="match-button"
                            onClick={() => handleMatch(job)}
                            disabled={isMatching || isApplying}
                          >
                            {isMatching ? "Analyzing Fit..." : matchResult ? "Re-Analyze Match 🔄" : "Analyze Match →"}
                          </button>
                        </div>

                        {/* Embedded Match Result */}
                        {matchResult && (
                          <div className="in-card-match-result">
                            <div className="in-card-match-header">
                              <div>
                                <span className="in-card-eyebrow">AI Match Score</span>
                                <div className="in-card-score-row">
                                  <span className="in-card-score">
                                    {Math.round(matchResult.match_score)}%
                                  </span>
                                  <span className={`match-level-badge ${matchLevel.className}`}>
                                    {matchLevel.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="in-card-skills-grid">
                              <div className="in-card-skills-col">
                                <h4>✓ Matched Skills</h4>
                                <div className="skill-list">
                                  {matchResult.matched_skills?.length > 0 ? (
                                    matchResult.matched_skills.map((skill, i) => (
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
                                  {matchResult.missing_skills?.length > 0 ? (
                                    matchResult.missing_skills.map((skill, i) => (
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

                            {matchResult.recommendation && (
                              <div className="in-card-recommendation">
                                <strong>🤖 AI Recommendation:</strong>
                                <p>{matchResult.recommendation}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Apply Now Section */}
                        <div className="in-card-apply-row">
                          {application ? (
                            <div className="applied-status-box">
                              <span className="applied-check">✓ Applied</span>
                              <span className={`status-pill status-${application.status.toLowerCase()}`}>
                                Status: {application.status.toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <button
                              className="apply-now-button"
                              onClick={() => handleApply(job)}
                              disabled={isApplying || !matchResult}
                              title={!matchResult ? "Please analyze your match first before applying" : ""}
                            >
                              {isApplying ? "Submitting Application..." : "Apply Now →"}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="recruiter-card-footer">
                        <div className="recruiter-app-count-tag">
                          👥 {recruiterAppCount} {recruiterAppCount === 1 ? "Application" : "Applications"} Received
                        </div>

                        <div className="recruiter-card-buttons">
                          <Link
                            to="/applications"
                            state={{ filterJobId: job.id }}
                            className="view-apps-button"
                          >
                            View Applications →
                          </Link>
                          <button
                            className="delete-resume"
                            onClick={() => handleDelete(job.id)}
                            disabled={deletingId === job.id}
                          >
                            {deletingId === job.id ? "Deleting..." : "Delete Job"}
                          </button>
                        </div>
                      </div>
                    )}
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

export default Jobs;
