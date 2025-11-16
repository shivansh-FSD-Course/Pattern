import React, { useMemo } from "react";

const GLYPHS = ["φ","π","∑","∞","ψ","∂","√","≡","∫","λ"];

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
      ],
    },
    {
      id: 2,
      username: "neural_goat",
      title: "Fourier Transform of Bird Sounds",
      content: "Just converted a sparrow sound into a frequency map.",
      comments: [
        { user: "mathmage", text: "This is so PatternCraft-coded." }
      ],
    },
  ];

  /* ──────────────────────────────────────────────
      FLOATING GLYPH BACKGROUND
  ────────────────────────────────────────────── */
  const mathGlyphs = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: 0.015 + Math.random() * 0.045,
        size: 40 + Math.random() * 60,
        rotate: Math.random() * 40 - 20,
      })),
    []
  );

  return (
    <div className="relative min-h-screen w-full bg-paper text-ink overflow-y-auto pb-32">

      {/* ──────────────────────────────────────────────
          BACKGROUND DECOR
      ────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {mathGlyphs.map((g, i) => (
          <span
            key={i}
            className="absolute math-float font-serif"
            style={{
              left: `${g.left}%`,
              top: `${g.top}%`,
              opacity: g.opacity,
              transform: `rotate(${g.rotate}deg)`,
              fontSize: `${g.size}px`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* ──────────────────────────────────────────────
          PAGE TITLE
      ────────────────────────────────────────────── */}
      <header className="relative z-20 px-12 pt-16 pb-10">
        <h1 className="font-serif text-[46px] tracking-wide">
          Community
        </h1>
        <p className="text-[15px] opacity-65 mt-1">
          Explore discoveries, discuss patterns, and share your findings.
        </p>
      </header>

      {/* ──────────────────────────────────────────────
          MAIN 2-COLUMN LAYOUT
      ────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col lg:flex-row gap-12 px-12 max-w-[1400px]">

        {/* ───────────── LEFT: POSTS ───────────── */}
        <div className="flex flex-col gap-10 flex-[2]">

          {posts.map((post) => (
            <div
              key={post.id}
              className="
                bg-white/65 backdrop-blur-sm border border-ink/20
                rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                p-6
              "
            >
              <div className="opacity-70 text-[14px] tracking-wide mb-2">
                @{post.username}
              </div>

              <h2 className="font-serif text-[26px] mb-2">
                {post.title}
              </h2>

              <p className="opacity-80 leading-relaxed mb-5">
                {post.content}
              </p>

              <div className="">
                <h4 className="font-serif text-[18px] mb-1">Comments</h4>

                {post.comments.map((c, idx) => (
                  <p key={idx} className="text-[15px] opacity-75 mt-1">
                    <strong>@{c.user}</strong>: {c.text}
                  </p>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* ───────────── RIGHT SIDE ───────────── */}
        <div className="flex flex-col gap-10 flex-[1]">

          {/* ▸ PROFILE EDIT BOX */}
          <div
            className="
              bg-white/60 backdrop-blur-sm border border-ink/20 rounded-sm
              shadow-[0_8px_24px_rgba(0,0,0,0.07)] p-6
            "
          >
            <h3 className="font-serif text-[22px] mb-3">Your Profile</h3>

            <textarea
              placeholder="Write your bio..."
              className="
                w-full h-28 resize-none px-3 py-2 border border-ink/25
                outline-none bg-white/70 rounded-sm
                focus:border-ink
              "
            ></textarea>
          </div>

          {/* ▸ NEW COMMENT BOX */}
          <div
            className="
              bg-white/60 backdrop-blur-sm border border-ink/20 rounded-sm
              shadow-[0_8px_24px_rgba(0,0,0,0.07)] p-6
            "
          >
            <h3 className="font-serif text-[22px] mb-3">New Comment</h3>

            <textarea
              className="
                w-full h-28 resize-none px-3 py-2 border border-ink/25
                outline-none bg-white/70 rounded-sm
                focus:border-ink
              "
              placeholder="Share your thoughts..."
            ></textarea>

            <button
              className="
                mt-4 px-6 py-2 border border-ink text-sm rounded-sm
                hover:bg-ink hover:text-paper transition
              "
            >
              Post
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
