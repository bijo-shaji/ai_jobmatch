import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchResumes = async () => {
    try {
      const response = await api.get("/resumes/");
      setResumes(response.data);
    } catch (err) {
      setError("Unable to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are allowed.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/resumes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);

      document.getElementById("resume-file").value = "";

      await fetchResumes();
    } catch (err) {
      const data = err.response?.data;

      if (data?.file) {
        setError(
          Array.isArray(data.file)
            ? data.file.join(" ")
            : data.file
        );
      } else {
        setError("Resume upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/resumes/${id}/`);

      setResumes((current) =>
        current.filter((resume) => resume.id !== id)
      );
    } catch (err) {
      setError("Unable to delete resume.");
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              Resume Management
            </p>

            <h1>My Resume</h1>

            <p>
              Upload your resume and let AI analyze your
              skills and experience.
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="resume-upload-card">
          <div className="upload-icon">📄</div>

          <h2>Upload your resume</h2>

          <p>
            PDF or DOCX files only · Maximum size 5 MB
          </p>

          <input
            id="resume-file"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="selected-file">
              <span>📎 {selectedFile.name}</span>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Upload Resume"}
              </button>
            </div>
          )}
        </div>

        <section className="resume-list-section">
          <h2>Uploaded Resumes</h2>

          {loading ? (
            <p className="empty-text">
              Loading resumes...
            </p>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <div>📂</div>
              <h3>No resumes yet</h3>
              <p>
                Upload your first resume to start AI analysis.
              </p>
            </div>
          ) : (
            <div className="resume-list">
              {resumes.map((resume) => (
                <div
                  className="resume-item"
                  key={resume.id}
                >
                  <div className="resume-info">
                    <div className="resume-file-icon">
                      📄
                    </div>

                    <div>
                      <h3>{resume.file_name}</h3>

                      <p>
                        Uploaded{" "}
                        {new Date(
                          resume.uploaded_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    className="delete-resume"
                    onClick={() =>
                      handleDelete(resume.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Resumes;