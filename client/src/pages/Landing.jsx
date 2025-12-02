import { useNavigate } from "react-router-dom";
import { useMemo, useEffect, useRef, useState } from "react";
import { getSelectedTheme, applyTheme } from '../utils/themes';

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [trails, setTrails] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(getSelectedTheme());

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      // User is logged in - apply their theme
      applyTheme(selectedTheme);
    } else {
      // User is logged out - reset to paper colors
      document.documentElement.style.setProperty('--theme-background', '#F5F3EE');
      document.documentElement.style.setProperty('--theme-card', 'rgba(255,255,255,0.6)');
      document.documentElement.style.setProperty('--theme-primary', '#2C2C2C');
      document.documentElement.style.setProperty('--theme-text', '#2C2C2C');
      document.documentElement.style.setProperty('--theme-secondary', '#7BA591');
      document.documentElement.style.setProperty('--theme-accent', '#C9A961');
    }
  }, [selectedTheme, isLoggedIn]);

  // Scroll handler for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cursor trail handler
  const handleMouseMove = (e) => {
    const newTrail = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    };
    
    setTrails(prev => [...prev.slice(-15), newTrail]);
  };

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

  /* 
      RANDOM BACKGROUND ELEMENTS
  */
  const mathDecor = useMemo(() => {
    return {
      glyphs: Array.from({ length: 34 }).map((_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 46 + Math.random() * 95,
        opacity: 0.17 + Math.random() * 0.075,
        rotate: Math.random() * 40 - 20,
        delay: i * 0.15,
        parallaxSpeed: 0.2 + Math.random() * 0.5,
      })),
    };
  }, []);

  return (
    <div 
      className="relative w-full min-h-screen text-ink overflow-hidden"
      style={{ backgroundColor: 'var(--theme-background)' }}
      onMouseMove={handleMouseMove}
    >
      {/* CURSOR TRAIL */}
      {trails.map(trail => (
        <span
          key={trail.id}
          className="fixed pointer-events-none text-sm animate-trail-fade z-50"
          style={{ 
            left: trail.x - 10, 
            top: trail.y - 10,
            fontFamily: 'serif',
            color: 'var(--theme-primary)',
            opacity: 0.3
          }}
        >
          {trail.char}
        </span>
      ))}

      {/* BACKGROUND FLOATING DECOR WITH PARALLAX */}
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
              transform: `translateY(${scrollY * g.parallaxSpeed * 0.3}px) rotate(${g.rotate}deg)`,
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
          Turn Your Data Into <br />
          <span className="italic" style={{ color: 'var(--theme-secondary)' }}>3D Visualizations</span>
        </h1>

        <p className="font-serif text-[17px] opacity-75 max-w-xl mb-10">
          Upload any CSV file—stock prices, sensor data, measurements—and our algorithms instantly detect mathematical patterns like Fibonacci sequences and golden ratios, then transform them into weird & wacky interactive 3D visualizations.
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

        {/* HOW IT WORKS SECTION */}
        <h2 className="font-serif text-4xl text-center mb-4">
          How It Works
        </h2>

        <div className="flex justify-center mb-14">
          <div 
            className="h-[2px] w-16"
            style={{ 
              background: `linear-gradient(to right, transparent, var(--theme-accent), transparent)` 
            }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28">
          <HowItWorksStep
            number="1"
            title="Upload Your Data"
            desc="Upload any CSV dataset—stock prices, temperature readings, sales figures, or measurement data. Any numerical data works!"
            delay={0}
          />

          <HowItWorksStep
            number="2"
            title="Pattern Detection"
            desc="Our algorithms automatically scan your data for mathematical patterns: Fibonacci sequences, golden ratios, exponential trends, sine waves, and more."
            delay={0.15}
          />

          <HowItWorksStep
            number="3"
            title="3D Visualization"
            desc="Watch your patterns transform into interactive 3D visualizations—spirals, ribbons, and tunnels you can rotate, zoom, and explore."
            delay={0.3}
          />
        </div>

        {/* STATS COUNTER SECTION */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20">
          <StatCounter end={1247} label="Patterns Found" />
          <StatCounter end={89} label="Active Users" />
          <StatCounter end={342} label="Visualizations" />
        </div>

        {/* FEATURE SECTION */}
        <h2 className="font-serif text-4xl text-center mb-4">
          Features
        </h2>

        <div className="flex justify-center mb-14">
          <div 
            className="h-[2px] w-16"
            style={{ 
              background: `linear-gradient(to right, transparent, var(--theme-accent), transparent)` 
            }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28">
          <FeatureCard
            icon={<ClockIcon />}
            title="Instant Analysis"
            desc="Pattern detection algorithms analyze your data in seconds. No manual configuration needed—just upload and discover."
            delay={0}
          />

          <FeatureCard
            icon={<BarsIcon />}
            title="Interactive 3D"
            desc="Explore your data in 3D space. Rotate, zoom, and interact with your visualizations to see patterns from every angle."
            delay={0.15}
          />

          <FeatureCard
            icon={<InfinityIcon />}
            title="Community Sharing"
            desc="Share discoveries with others. Browse patterns found by the community and get inspired by their findings."
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

/* 
      HOW IT WORKS STEP COMPONENT
 */
function HowItWorksStep({ number, title, desc, delay }) {
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
        p-10 backdrop-blur-sm rounded-sm
        border
        hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)]
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        backgroundColor: 'var(--theme-card)',
        borderColor: 'rgba(44, 44, 44, 0.15)',
        transitionDelay: isVisible ? `${delay}s` : '0s',
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#7BA59130' }}
        >
          <span 
            className="font-serif text-2xl font-bold"
            style={{ color: '#7BA591' }}
          >
            {number}
          </span>
        </div>
        <h3 className="font-serif text-xl mt-3" style={{ color: 'var(--theme-text)' }}>{title}</h3>
      </div>
      <p className="text-sm opacity-70 leading-relaxed">{desc}</p>
    </div>
  );
}

/* 
      STATS COUNTER COMPONENT
 */
function StatCounter({ end, label }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [end, hasAnimated]);

  return (
    <div ref={counterRef} className="text-center">
      <div 
        className="font-serif text-4xl mb-2"
        style={{ color: 'var(--theme-secondary)' }}
      >
        {count.toLocaleString()}+
      </div>
      <div className="text-sm opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* 
      FEATURE CARD COMPONENT
 */
function FeatureCard({ icon, title, desc, delay }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 250;
    const y = (e.clientX - rect.left - rect.width / 2) / 250;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        feature-card
        p-10 backdrop-blur-sm rounded-sm
        border
        hover:shadow-[0_8px_22px_rgba(0,0,0,0.08)]
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        backgroundColor: 'var(--theme-card)',
        borderColor: 'rgba(44, 44, 44, 0.15)',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isVisible ? 'translateY(0)' : 'translateY(32px)'}`,
        transitionDelay: isVisible ? `${delay}s` : '0s',
      }}
    >
      <div className="mb-6">
        {icon}
      </div>
      <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--theme-text)' }}>{title}</h3>
      <p className="text-sm opacity-70 leading-relaxed">{desc}</p>
    </div>
  );
}
/* 
      INLINE SVG ICONS
 */
const ClockIcon = () => (
  <svg width="38" height="38" stroke="var(--theme-secondary)" fill="none" strokeWidth="2">
    <circle cx="19" cy="19" r="16" />
    <path d="M19 8v11l7 4" />
  </svg>
);
const BarsIcon = () => (
  <svg width="38" height="38" stroke="var(--theme-secondary)" fill="none" strokeWidth="2">
    <rect x="6" y="20" width="6" height="10" rx="1" />
    <rect x="16" y="14" width="6" height="16" rx="1" />
    <rect x="26" y="8" width="6" height="22" rx="1" />
  </svg>
);
const InfinityIcon = () => (
  <svg width="46" height="38" stroke="var(--theme-secondary)" fill="none" strokeWidth="2">
    <path d="M10 19c8-14 16 14 24 0s-16-14-24 0Z" />
  </svg>
);