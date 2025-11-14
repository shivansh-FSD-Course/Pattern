import React, { useState } from "react";

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

    // temp fake preview
    setPreviewImage("/placeholder_visual.png");
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-[#d7ffd7] font-vt overflow-y-auto pb-20">

      {/* CRT scanline layer */}
      <div className="
        pointer-events-none absolute inset-0 z-10
        bg-[repeating-linear-gradient(to_bottom,rgba(0,255,0,0.04)_0px,rgba(0,255,0,0.04)_2px,transparent_3px)]
      "></div>

      {/* HEADER */}
      <header className="relative z-20 px-10 py-6">
        <h1 className="text-[42px] text-neonGreen drop-shadow-[0_0_12px_#8aff8a]">
          MY SPACE
        </h1>
      </header>

      {/* MAIN GRID */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-10 px-10 pb-10">

        {/* LEFT SIDE (Profile Card) */}
        <div className="
          col-span-1 bg-[rgba(0,40,0,0.4)] border border-[#00ff8c44]
          rounded-lg p-6 backdrop-blur-sm shadow-[0_0_15px_#00ff8c22]
        ">
          <h2 className="text-[28px] text-[#c8ffc8] mb-4">Profile</h2>

          <label className="block text-lg mb-1">Username</label>
          <input
            className="
              w-full p-3 text-xl bg-[#001900] border border-[#00ff8c55]
              text-[#9dff9d] outline-none
            "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="block text-lg mt-3 mb-1">Bio</label>
          <textarea
            className="
              w-full h-32 p-3 text-xl bg-[#001900] border border-[#00ff8c55]
              text-[#9dff9d] outline-none resize-none
            "
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            className="
              mt-4 px-5 py-3 text-xl border-2 border-neonGreen text-neonGreen
              hover:bg-neonGreen hover:text-black transition font-vt
            "
          >
            Save Changes
          </button>
        </div>

        {/* RIGHT (Upload + Preview) */}
        <div className="
          md:col-span-2 bg-[rgba(0,40,0,0.4)] border border-[#00ff8c44]
          rounded-lg p-6 backdrop-blur-sm shadow-[0_0_15px_#00ff8c22]
        ">
          <h2 className="text-[28px] text-[#c8ffc8] mb-4">Upload Dataset</h2>

          <input
            type="file"
            accept=".csv"
            className="mb-3 text-neonGreen text-lg"
            onChange={handleFileUpload}
          />

          {uploadedFile && (
            <div>
              <p className="text-lg mb-3">
                Selected: <strong>{uploadedFile.name}</strong>
              </p>

              {/* Preview */}
              {previewImage && (
                <div className="my-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full rounded-md border border-[#8aff8a55]"
                  />
                </div>
              )}

              <button
                className="
                  mt-4 px-5 py-3 text-xl border-2 border-neonGreen text-neonGreen
                  hover:bg-neonGreen hover:text-black transition font-vt
                "
                onClick={() => setShowPublishModal(true)}
              >
                Publish to Community
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showPublishModal && (
        <div className="
          fixed inset-0 bg-[rgba(0,0,0,0.75)] z-[9999]
          flex justify-center items-center px-4
        ">
          <div className="
            w-[450px] bg-[#002200] rounded-xl p-6 border border-[#00ff8a77]
            shadow-[0_0_30px_#00ff8a55]
          ">
            <h3 className="text-[26px] text-neonGreen mb-3">Publish Preview</h3>

            {previewImage && (
              <img
                src={previewImage}
                alt="preview"
                className="w-full rounded-md border border-[#00ff8a55] mb-4"
              />
            )}

            <textarea
              className="
                w-full h-24 resize-none bg-[#001900] border border-[#00ff8a55]
                text-neonGreen p-3 text-lg outline-none
              "
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>

            <div className="flex justify-between mt-5">
              <button
                className="
                  px-5 py-2 text-xl border-2 border-neonGreen text-neonGreen
                  hover:bg-neonGreen hover:text-black transition font-vt
                "
              >
                Publish
              </button>

              <button
                className="
                  px-5 py-2 text-xl border-2 border-[#ff6b6b] text-[#ff6b6b]
                  hover:bg-[#ff6b6b] hover:text-black transition font-vt
                "
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
