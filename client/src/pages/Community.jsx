import React from "react";
import "./Community.css";

export default function Community() {
  const posts = [
    {
      id: 1,
      username: "math_wizard",
      title: "Chaos Patterns in Logistic Maps",
      content:
        "Exploring how r > 3.57 leads to chaotic oscillations. Attached graph below.",
      comments: [
        { user: "sigma_guy", text: "Bro this is insane 🔥" },
        { user: "fractalgirl", text: "Love this visualization!" }
      ]
    },
    {
      id: 2,
      username: "neural_goat",
      title: "Fourier Transform of Bird Sounds",
      content: "Just converted a sparrow sound into a frequency map.",
      comments: [
        { user: "mathmage", text: "This is so PatternCraft-coded." }
      ]
    }
  ];

  return (
    <div className="community-container">
      <div className="floating-math">
        {["π", "φ", "∞", "∑", "σ", "ψ", "λ", "β", "Ω"].map((sym, i) => (
          <span
            key={i}
            className="float-symbol"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      <div className="community-layout">
        {/* LEFT SIDE - CARDS */}
        <div className="community-left">
          {posts.map((post) => (
            <div className="post-card" key={post.id}>
              <div className="post-header">
                <span className="user-name">@{post.username}</span>
              </div>

              <div className="post-body">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-content">{post.content}</p>
              </div>

              <div className="post-comments">
                <h4>Comments</h4>
                {post.comments.map((c, idx) => (
                  <p key={idx} className="comment">
                    <strong>@{c.user}</strong>: {c.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - PROFILE + COMMENT BOX */}
        <div className="community-right">
          <div className="profile-box">
            <h3>Your Profile</h3>
            <textarea
              placeholder="Write your bio or description..."
              className="profile-textarea"
            />
          </div>

          <div className="new-comment-box">
            <h3>New Comment</h3>
            <textarea
              placeholder="Write something..."
              className="comment-input"
            />
            <button className="comment-btn">Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
