import React, { useState, useMemo } from "react";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Dashboard() {
  const [username, setUsername] = useState("YourUsername");
  const [bio, setBio] = useState("Write something about yourself...");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [caption, setCaption] = useState("");

  function handleFileUpload(e) {
    const file = e.target.files[0];
    setUploadedFile(file);
    setPreviewImage("/placeholder_visual.png"); // TEMP
  }

  /* ───────────────────────────────
      FLOATING GLYPH BACKGROUND
  ─────────────────────────────── */
  const glyphs = useMemo(
    () =>
      Array.from({ length: 30 }).map(() => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 95,
        top: Math.random() * 95,
        opacity: 0.015 + Math.random() * 0.035,
        size: 40 + Math.random() * 60,
        rotate: Math.random() * 40 - 20
      })),
    []
  );

  return (
    <div className="relative w-full min-h-screen bg-paper text-ink overflow-y-auto pb-24">

      {/* ───────────────────────────────
          BACKGROUND DECOR
      ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {glyphs.map((g, i) => (
          <span
            key={i}
            className="absolute font-serif math-float"
            style={{
              left: `${g.left}%`,
              top: `${g.top}%`,
              opacity: g.opacity,
              fontSize: `${g.size}px`,
              transform: `rotate(${g.rotate}deg)`
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* ───────────────────────────────
          HEADER
      ─────────────────────────────── */}
      <header className="relative z-10 px-10 pt-14 pb-6">
        <h1 className="font-serif text-[46px] tracking-wide">
          My Space
        </h1>
      </header>

      {/* ───────────────────────────────
          MAIN GRID
      ─────────────────────────────── */}
      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-10">

        {/* LEFT PROFILE CARD */}
        <div
          className="
            bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
            shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
          "
        >
          <h2 className="font-serif text-[28px] mb-4">Profile</h2>

          <label className="text-sm opacity-70">Username</label>
          <input
            className="
              mt-1 w-full border border-ink/25 rounded-sm px-3 py-2
              focus:border-ink outline-none bg-white/70
              transition
            "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="text-sm opacity-70 mt-4 block">Bio</label>
          <textarea
            className="
              mt-1 w-full h-32 border border-ink/25 rounded-sm px-3 py-2
              resize-none bg-white/70 outline-none
              focus:border-ink
            "
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            className="
              mt-5 border border-ink rounded-sm px-6 py-2 text-sm
              hover:bg-ink hover:text-paper transition
            "
          >
            Save Changes
          </button>
        </div>

        {/* RIGHT UPLOAD AREA */}
        <div
          className="
            md:col-span-2 bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
            shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
          "
        >
          <h2 className="font-serif text-[28px] mb-4">Upload Dataset</h2>

          <input
            type="file"
            accept=".csv"
            className="text-sm opacity-80 mb-3"
            onChange={handleFileUpload}
          />

          {uploadedFile && (
            <div>
              <p className="mt-1 mb-4 text-[15px] opacity-80">
                Selected: <strong>{uploadedFile.name}</strong>
              </p>

              {previewImage && (
                <img
                  src={previewImage}
                  className="w-full rounded-sm border border-ink/15 mb-5"
                />
              )}

              <button
                onClick={() => setShowPublishModal(true)}
                className="
                  border border-ink rounded-sm px-6 py-2 text-sm
                  hover:bg-ink hover:text-paper transition
                "
              >
                Publish to Community
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────
          MODAL
      ─────────────────────────────── */}
      {showPublishModal && (
        <div
          className="
            fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm
            flex justify-center items-center z-[999]
            px-6
          "
        >
          <div
            className="
              bg-white/70 border border-ink/20 p-6 rounded-sm
              shadow-[0_8px_32px_rgba(0,0,0,0.22)]
              max-w-[480px] w-full
            "
          >
            <h3 className="font-serif text-[26px] mb-3">
              Publish Preview
            </h3>

            {previewImage && (
              <img
                src={previewImage}
                className="w-full rounded-sm border border-ink/15 mb-4"
              />
            )}

            <textarea
              className="
                w-full h-24 border border-ink/25 rounded-sm px-3 py-2 resize-none
                bg-white/70 outline-none focus:border-ink
              "
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">

              <button
                className="
                  border border-ink px-5 py-1.5 rounded-sm text-sm
                  hover:bg-ink hover:text-paper transition
                "
              >
                Publish
              </button>

              <button
                onClick={() => setShowPublishModal(false)}
                className="
                  px-5 py-1.5 rounded-sm text-sm border border-[#b44] text-[#b44]
                  hover:bg-[#b44] hover:text-white transition
                "
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
