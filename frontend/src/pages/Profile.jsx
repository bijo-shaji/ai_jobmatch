import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
    profile_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile/");
      setProfile(response.data);

      if (response.data.profile_image) {
        setImagePreview(response.data.profile_image);
      }
    } catch (err) {
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("full_name", profile.full_name);
      formData.append("phone", profile.phone);
      formData.append("location", profile.location);
      formData.append("bio", profile.bio);

      if (selectedImage) {
        formData.append("profile_image", selectedImage);
      }

      const response = await api.patch("/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(response.data);

      if (response.data.profile_image) {
        setImagePreview(response.data.profile_image);
      }

      setSelectedImage(null);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data
          ? "Unable to update profile. Please check your details."
          : "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <div className="route-loading">
            <div className="loading-spinner" />
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your personal information and profile details.</p>
          </div>
        </div>

        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2>Profile Information</h2>
                <p>
                  Keep your profile updated for a better job matching
                  experience.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="profile-image-section">
                <div className="profile-image-wrapper">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      {profile.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>

                <div className="profile-image-actions">
                  <label
                    htmlFor="profile-image"
                    className="secondary-button"
                  >
                    Change Photo
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />

                  <p>JPG, PNG or other image formats. Maximum 5 MB.</p>
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={profile.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={profile.location}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </div>

                <div className="form-group profile-full-width">
                  <label htmlFor="bio">Bio</label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows="6"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="profile-form-footer">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;