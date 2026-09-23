import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              {isCandidate
                ? "Candidate Portal"
                : "Recruiter Portal"}
            </p>

            <h1>
              Welcome back, {user?.username} 👋
            </h1>

            <p>
              {isCandidate
                ? "Find the right opportunities with AI-powered job matching."
                : "Create job opportunities and manage your hiring workflow."}
            </p>
          </div>

          <div className="profile-badge">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt="Profile"
              />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </div>
        </header>

        {isCandidate ? (
          <section className="dashboard-cards">
            <Link
              to="/resumes"
              className="dashboard-card dashboard-card-link"
            >
              <span>📄</span>
              <h3>My Resume</h3>
              <p>
                Upload and manage your resumes.
              </p>
            </Link>

            <Link
              to="/analysis"
              className="dashboard-card dashboard-card-link"
            >
              <span>🤖</span>
              <h3>AI Analysis</h3>
              <p>
                Get AI-powered insights about your resume.
              </p>
            </Link>

            <Link
              to="/jobs"
              className="dashboard-card dashboard-card-link"
            >
              <span>💼</span>
              <h3>Find Jobs</h3>
              <p>
                Explore jobs posted by recruiters.
              </p>
            </Link>

            <Link
              to="/applications"
              className="dashboard-card dashboard-card-link"
            >
              <span>📋</span>
              <h3>My Applications</h3>
              <p>
                Track your job application status.
              </p>
            </Link>

            <Link
              to="/jd-analyzer"
              className="dashboard-card dashboard-card-link"
            >
              <span>🔍</span>
              <h3>Job Description Analyzer</h3>
              <p>
                Paste any job description and check your match.
              </p>
            </Link>

            <Link
              to="/matches"
              className="dashboard-card dashboard-card-link"
            >
              <span>🎯</span>
              <h3>Job Matches</h3>
              <p>
                Review your previous AI matching results.
              </p>
            </Link>
          </section>
        ) : (
          <section className="dashboard-cards">
            <Link
              to="/jobs"
              className="dashboard-card dashboard-card-link"
            >
              <span>💼</span>
              <h3>My Jobs</h3>
              <p>
                View and manage your job postings.
              </p>
            </Link>

            <Link
              to="/jobs/create"
              className="dashboard-card dashboard-card-link"
            >
              <span>➕</span>
              <h3>Create Job</h3>
              <p>
                Post a new opportunity for candidates.
              </p>
            </Link>

            <Link
              to="/applications"
              className="dashboard-card dashboard-card-link"
            >
              <span>👥</span>
              <h3>Applications</h3>
              <p>
                Manage candidate job applications and update statuses.
              </p>
            </Link>

            <Link
              to="/matches"
              className="dashboard-card dashboard-card-link"
            >
              <span>🎯</span>
              <h3>Matching Results</h3>
              <p>
                Review candidate matching results.
              </p>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
