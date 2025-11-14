import React from "react";

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
        { user: "fractalgirl", text: "Love this visualization!" },
      ],
    },
    {
      id: 2,
      username: "neural_goat",
      title: "Fourier Transform of Bird Sounds",
      content: "Just converted a sparrow sound into a frequency map.",
      comments: [{ user: "mathmage", text: "This is so PatternCraft-coded." }],
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-[#cfffdf] font-vt overflow-y-auto">

      {/* FLOATING MATH SYMBOLS */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {["π","φ","∞","∑","σ","ψ","λ","β","Ω"].map((sym, i) => (
          <span
            key={i}
            className="
              absolute top-[110%] text-[22px] opacity-[0.15] text-[#54ff85]
              animate-[floatUp_linear_infinite]
            "
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="relative z-20 flex gap-10 p-12">

        {/* LEFT SIDE – POSTS */}
        <div className="flex flex-col flex-[2] gap-10">
          {posts.map((post) => (
            <div
              key={post.id}
              className="
                bg-[rgba(0,25,0,0.4)] border border-[#66ff99] rounded-xl p-6 
                backdrop-blur-sm shadow-[inset_0_0_18px_#004d1a,0_0_12px_#00330f]
              "
            >
              {/* HEADER */}
              <div
                className="
                  bg-[rgba(0,40,0,0.6)] p-3 rounded-md border-b border-[#66ff99]
                "
              >
                <span className="text-[#92ffbf] text-xl">@{post.username}</span>
              </div>

              {/* CONTENT */}
              <div className="mt-5">
                <h2 className="text-2xl text-[#b8ffc9]">{post.title}</h2>
                <p className="mt-2 text-[#e6ffe9] leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* COMMENTS */}
              <div className="mt-6">
                <h4 className="font-bold">Comments</h4>
                {post.comments.map((c, idx) => (
                  <p key={idx} className="text-[#ccffd6] mt-2">
                    <strong>@{c.user}</strong>: {c.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col flex-[1] gap-10">

          {/* PROFILE BIO BOX */}
          <div
            className="
              bg-[rgba(0,20,0,0.5)] border border-[#55ff99] rounded-xl p-5 
              backdrop-blur-sm
            "
          >
            <h3 className="text-xl mb-3">Your Profile</h3>
            <textarea
              placeholder="Write your bio or description..."
              className="
                w-full h-28 resize-none bg-[#001900] border border-[#55ff99]
                text-[#cfffdf] p-3 text-lg font-vt outline-none
              "
            ></textarea>
          </div>

          {/* COMMENT INPUT BOX */}
          <div
            className="
              bg-[rgba(0,20,0,0.5)] border border-[#55ff99] rounded-xl p-5 
              backdrop-blur-sm
            "
          >
            <h3 className="text-xl mb-3">New Comment</h3>
            <textarea
              placeholder="Write something..."
              className="
                w-full h-28 resize-none bg-[#001900] border border-[#55ff99]
                text-[#cfffdf] p-3 text-lg font-vt outline-none
              "
            ></textarea>

            <button
              className="
                mt-3 px-4 py-2 border-2 border-[#66ff99] 
                text-[#66ff99] font-vt transition-all
                hover:bg-[#66ff99] hover:text-black
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
