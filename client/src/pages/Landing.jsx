import { useNavigate } from "react-router-dom";
import { useMemo, useEffect, useRef, useState } from "react";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Landing() {
  const navigate = useNavigate();

  // Check if token exists (user logged in)
  const token = localStorage.getItem("token");

  // Button click handlers based on auth state
  const handleStartExploring = () => {
    if (!token) {
      navigate("/login", { state: { from: "/community" } });
    } else {
      navigate("/community");
    }
  };

  const handleViewGallery = () => {
    if (!token) {
      navigate("/login", { state: { from: "/myspace" } });
    } else {
      navigate("/myspace");
    }
  };

  /* ───────────────────────────────
      RANDOM BACKGROUND ELEMENTS
  ─────────────────────────────── */
  const mathDecor = useMemo(() => {
    return {
      glyphs: Array.from({ length: 34 }).map((_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 46 + Math.random() * 65,
        opacity: 0.012 + Math.random() * 0.035,
        rotate: Math.random() * 40 - 20,
        delay: i * 0.15,
      })),
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-paper text-ink overflow-hidden">
      {/* BACKGROUND FLOATING DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        {mathDecor.glyphs.map((g, i) => (
          <span
            key={i}
            className="absolute font-serif math-float"
            style={{
              left: `${g.left}%`,
              top: `${g.top}%`,
              fontSize: `${g.size}px`,
              opacity: g.opacity,
              '--rotate': `${g.rotate}deg`,
              '--delay': `${g.delay}s`,
              transform: `rotate(${g.rotate}deg)`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-[1100px] mx-auto pt-[14vh] px-6">
        {/* HEADER */}
        <p className="uppercase tracking-[0.22em] text-xs font-semibold opacity-50 mb-4">
          PATTERNCRAFT
        </p>

        <h1 className="font-serif text-[52px] leading-tight mb-6">
          Discover <span className="italic text-accent-green">Hidden</span>
          <br />
          Patterns
        </h1>

        <p className="font-serif text-[17px] opacity-75 max-w-xl mb-10">
          Upload your data and uncover the mathematical poetry hidden within.
          From Fibonacci sequences to golden ratios, transform numbers into
          visual beauty.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-wrap gap-4 mb-24">
          <button
            onClick={handleStartExploring}
            className="btn-primary"
          >
            START EXPLORING →
          </button>

          <button
            onClick={handleViewGallery}
            className="btn-outline"
          >
            VIEW GALLERY
          </button>
        </div>

        {/* FEATURE SECTION */}
        <h2 className="font-serif text-4xl text-center mb-4">
          Mathematical Beauty in Every Dataset
        </h2>

        <div className="flex justify-center mb-14">
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-accent-gold to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28">
          <FeatureCard
            icon={<ClockIcon />}
            title="Pattern Discovery"
            desc="AI-powered algorithms detect Fibonacci sequences, exponential growth, sine waves, and hidden correlations."
            delay={0}
          />

          <FeatureCard
            icon={<BarsIcon />}
            title="Visual Transformation"
            desc="Watch your patterns come alive as 3D visualizations—spirals, fractals, galaxies, and organic motion."
            delay={0.15}
          />

          <FeatureCard
            icon={<InfinityIcon />}
            title="Share & Explore"
            desc="Join a community of pattern explorers. Remix findings and contribute knowledge."
            delay={0.3}
          />
        </div>

        {/* BOTTOM CTA */}
        <h3 className="font-serif text-3xl text-center mb-6">
          Begin Your Discovery
        </h3>

        <div className="flex justify-center">
          <button
            onClick={handleStartExploring}
            className="btn-outline px-10 py-3"
          >
            Enter Community →
          </button>
        </div>

        <div className="h-[120px]" /> {/* Bottom spacer */}
      </div>
    </div>
  );
}

/* ───────────────────────────────
      FEATURE CARD COMPONENT
────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        feature-card
        p-10 bg-white/60 backdrop-blur-sm rounded-sm
        border border-ink/15
        hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)]
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transitionDelay: isVisible ? `${delay}s` : '0s',
      }}
    >
      <div className="mb-6">{icon}</div>
      <h3 className="font-serif text-lg mb-2">{title}</h3>
      <p className="text-sm opacity-70 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ───────────────────────────────
      INLINE SVG ICONS
────────────────────────────── */
const ClockIcon = () => (
  <svg width="38" height="38" stroke="#7BA591" fill="none" strokeWidth="2">
    <circle cx="19" cy="19" r="16" />
    <path d="M19 8v11l7 4" />
  </svg>
);
const BarsIcon = () => (
  <svg width="38" height="38" stroke="#7BA591" fill="none" strokeWidth="2">
    <rect x="6" y="20" width="6" height="10" rx="1" />
    <rect x="16" y="14" width="6" height="16" rx="1" />
    <rect x="26" y="8" width="6" height="22" rx="1" />
  </svg>
);
const InfinityIcon = () => (
  <svg width="46" height="38" stroke="#7BA591" fill="none" strokeWidth="2">
    <path d="M10 19c8-14 16 14 24 0s-16-14-24 0Z" />
  </svg>
);