import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isCandidate = user?.role === "candidate";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesResponse, jobsResponse, appsResponse] =
          await Promise.all([
            api.get("/jobs/matches/"),
            api.get("/jobs/"),
            api.get("/jobs/applications/").catch(() => ({ data: [] })),
          ]);

        setMatches(matchesResponse.data);
        setJobs(jobsResponse.data);
        setApplications(appsResponse.data);

        if (isCandidate) {
          const resumesResponse = await api.get("/resumes/");
          setResumes(resumesResponse.data);
        }
      } catch (err) {
        setError("Unable to load matching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCandidate]);

  const getJob = (jobId) =>
    jobs.find((job) => job.id === (typeof jobId === "object" ? jobId.id : jobId));

  const getResume = (resumeId) =>
    resumes.find(
      (resume) => resume.id === (typeof resumeId === "object" ? resumeId.id : resumeId)
    );

  const getApplicationForMatch = (jobId) => {
    return applications.find((app) => {
      const appJobId = typeof app.job === "object" ? app.job.id : app.job;
      const targetId = typeof jobId === "object" ? jobId.id : jobId;
      return appJobId === targetId;
    });
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <main className="dashboard-main">
          <div className="page-loading">Loading matching results...</div>
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
            <p className="dashboard-eyebrow">AI Job Matching</p>

            <h1>{isCandidate ? "Job Matches" : "Matching Results"}</h1>

            <p>
              {isCandidate
                ? "Review your saved AI job matching results and application status."
                : "Review candidate matching activity for your job postings."}
            </p>
          </div>
        </header>

        {error && <div className="auth-error">{error}</div>}

        {matches.length === 0 ? (
          <div className="empty-state">
            <div>🎯</div>

            <h3>No matching results yet</h3>

            <p>
              {isCandidate
                ? "Analyze a recruiter job to create your first match."
                : "Candidates have not matched with your jobs yet."}
            </p>
          </div>
        ) : (
          <div className="match-history-list">
            {matches.map((match) => {
              const job = getJob(match.job);
              const resume = getResume(match.resume);
              const application = getApplicationForMatch(match.job);

              return (
                <article className="match-history-card" key={match.id}>
                  <div className="match-history-main">
                    <div>
                      <p className="dashboard-eyebrow">
                        {job?.company || "Recruiter Job"}
                      </p>

                      <h2>{job?.title || `Job #${match.job}`}</h2>

                      <p className="match-history-resume">
                        Resume: {resume?.file_name || `Resume #${match.resume}`}
                      </p>

                      {application && (
                        <div className="match-app-status-row">
                          <span className="app-status-label">Application:</span>
                          <span
                            className={`status-pill ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {application.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="match-score small">
                      <strong>{Math.round(match.match_score)}</strong>
                      <span>% Match</span>
                    </div>
                  </div>

                  <div className="match-result-grid">
                    <div className="match-result-section">
                      <h3>✓ Matched Skills</h3>

                      <div className="skill-list">
                        {match.matched_skills?.map((skill, index) => (
                          <span className="skill-tag" key={index}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="match-result-section">
                      <h3>+ Skills to Improve</h3>

                      <div className="skill-list">
                        {match.missing_skills?.map((skill, index) => (
                          <span className="missing-skill-tag" key={index}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {match.recommendation && (
                    <div className="recommendation-box">
                      <h3>🤖 AI Recommendation</h3>
                      <p>{match.recommendation}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Matches;
