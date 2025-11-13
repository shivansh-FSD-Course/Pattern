import React, { useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [username, setUsername] = useState("YourUsername");
  const [bio, setBio] = useState("Write something about yourself...");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [caption, setCaption] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);

    // temporary fake visual preview
    setPreviewImage("/placeholder_visual.png");
  };

  return (
    <div className="dashboard-container">
      {/* CRT effect layer */}
      <div className="dashboard-crt"></div>

      {/* PAGE HEADER */}
      <header className="dashboard-header">
        <h1 className="dash-logo">MY SPACE</h1>
      </header>

      <div className="dashboard-content">

        {/* ---------------- LEFT SIDEBAR (Profile) ---------------- */}
        <div className="profile-card">
          <h2 className="section-title">Profile</h2>

          <label className="label">Username</label>
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Bio</label>
          <textarea
            className="bio-field"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button className="save-btn">Save Changes</button>
        </div>

        {/* ---------------- RIGHT SIDE (Upload + Visuals) ---------------- */}
        <div className="upload-card">
          <h2 className="section-title">Upload Dataset</h2>

          <input
            type="file"
            accept=".csv"
            className="file-input"
            onChange={handleFileUpload}
          />

          {uploadedFile && (
            <>
              <p className="file-label">
                Selected: <strong>{uploadedFile.name}</strong>
              </p>

              {/* TEMPORARY VISUAL PREVIEW */}
              {previewImage && (
                <div className="visual-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}

              <button
                className="publish-btn"
                onClick={() => setShowPublishModal(true)}
              >
                Publish to Community
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------------- PUBLISH MODAL ---------------------- */}
      {showPublishModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Publish Preview</h3>

            {previewImage && (
              <img className="modal-preview" src={previewImage} alt="preview" />
            )}

            <textarea
              className="caption-box"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>

            <div className="modal-buttons">
              <button className="modal-btn confirm">Publish</button>
              <button
                className="modal-btn cancel"
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
