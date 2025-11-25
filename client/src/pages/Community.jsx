import React, { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import PatternVisualization from "../components/PatternVisualization";
import CommentSection from '../components/CommentSection';
const GLYPHS = ["φ","π","∑","∞","ψ","∂","√","≡","∫","λ"];

// Pattern type configurations
const PATTERN_TYPES = {
  fibonacci: { label: "Fibonacci", color: "#7BA591", icon: "🌀" },
  golden: { label: "Golden Ratio", color: "#C9A961", icon: "✨" },
  exponential: { label: "Exponential", color: "#B85C5C", icon: "🔺" },
  wave: { label: "Sine Wave", color: "#5C8BB8", icon: "〰️" },
  chaos: { label: "Chaos", color: "#8B7BA8", icon: "🌪️" },
  fourier: { label: "Fourier", color: "#5CB88B", icon: "📊" },
  bitcoin: { label: "Bitcoin", color: "#F7931A", icon: "₿" },
  stock: { label: "Stock Market", color: "#5C8BB8", icon: "📈" },
  other: { label: "Other", color: "#7BA591", icon: "✨" },
};

// User badges
const USER_BADGES = {
  fibonacci_master: { name: "Fibonacci Master", icon: "🌀" },
  golden_eye: { name: "Golden Eye", icon: "👁️" },
  pattern_hunter: { name: "Pattern Hunter", icon: "🎯" },
  first_discovery: { name: "First Discovery", icon: "🌟" },
};

// Helper function to get time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
};

// Helper function to get pattern thumbnail
const getPatternThumbnail = (type) => {
  const thumbnails = {
    bitcoin: '₿',
    stock: '📈',
    fibonacci: '🌀',
    golden: '✨',
    exponential: '🔺',
    wave: '〰️',
    chaos: '🌪️',
    fourier: '📊',
    other: '✨'
  };
  return thumbnails[type] || '✨';
};

export default function Community() {
  const [trails, setTrails] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live activity feed
  const [activities] = useState([
    { user: "data_sage", action: "discovered", pattern: "Golden Ratio", time: "Just now" },
    { user: "wave_rider", action: "published", pattern: "Sine Wave", time: "2 min ago" },
    { user: "chaos_king", action: "liked", pattern: "Chaos Pattern", time: "5 min ago" },
    { user: "fib_fan", action: "commented on", pattern: "Fibonacci", time: "8 min ago" },
  ]);

  /* 
      FETCH PATTERNS FROM API
  */
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await api.get('/patterns/community');
        if (response.data.success) {
          // Transform the data to match our post structure
          const transformedPosts = response.data.patterns.map(pattern => ({
            id: pattern._id,
            username: pattern.user.username,
            avatar: pattern.user.avatar || { char: "φ", color: "#7BA591" },
            badges: [], // Can add badges based on user achievements later
            title: pattern.title,
            content: pattern.caption || "Check out this amazing pattern discovery!",
            patternType: pattern.patternType || 'other',
            timestamp: getTimeAgo(pattern.createdAt),
            views: pattern.views,
            likes: pattern.likes,
            thumbnail: getPatternThumbnail(pattern.patternType),
            comments: pattern.comments.map(c => ({
              user: c.user?.username || 'Anonymous',
              avatar: c.user?.avatar || { char: "λ", color: "#5C8BB8" },
              text: c.text,
              timestamp: getTimeAgo(c.timestamp)
            })),
            isLiked: false, // TODO: Check if current user liked it
            isSaved: false,
            analysisData: pattern.analysisData
          }));
          setPosts(transformedPosts);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch patterns:', error);
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  /* Mount animation trigger */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Scroll handler for parallax */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Cursor trail handler */
  const handleMouseMove = (e) => {
    const newTrail = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    };
    
    setTrails(prev => [...prev.slice(-15), newTrail]);
  };

  /* Like post */
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/patterns/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: response.data.likes, 
                isLiked: response.data.isLiked 
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  /* Save post */
  const handleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  /* Filter and sort posts */
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "all" || post.patternType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return 0; // Keep original order
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "views") return b.views - a.views;
      return 0;
    });

  /* 
      FLOATING GLYPH BACKGROUND
  */
  const mathGlyphs = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: 0.015 + Math.random() * 0.045,
        size: 40 + Math.random() * 60,
        rotate: Math.random() * 40 - 20,
        delay: i * 0.12,
        parallaxSpeed: 0.2 + Math.random() * 0.5,
      })),
    []
  );

  return (
    <div 
      className="relative min-h-screen w-full bg-paper text-ink overflow-y-auto pb-32"
      onMouseMove={handleMouseMove}
    >
      {/* CURSOR TRAIL */}
      {trails.map(trail => (
        <span
          key={trail.id}
          className="fixed pointer-events-none text-accent-green/30 text-sm animate-trail-fade z-50"
          style={{ 
            left: trail.x - 10, 
            top: trail.y - 10,
            fontFamily: 'serif',
          }}
        >
          {trail.char}
        </span>
      ))}

      {/* BACKGROUND DECOR WITH PARALLAX */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {mathGlyphs.map((g, i) => (
          <span
            key={i}
            className="absolute math-float font-serif"
            style={{
              left: `${g.left}%`,
              top: `${g.top}%`,
              opacity: g.opacity,
              fontSize: `${g.size}px`,
              '--rotate': `${g.rotate}deg`,
              '--delay': `${g.delay}s`,
              transform: `translateY(${scrollY * g.parallaxSpeed * 0.3}px) rotate(${g.rotate}deg)`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* PAGE TITLE */}
      <header className="relative z-20 px-12 pt-16 pb-6">
        <h1 className="font-serif text-[46px] tracking-wide">
          Community
        </h1>
        <p className="text-[15px] opacity-65 mt-1">
          Explore discoveries, discuss patterns, and share your findings.
        </p>
      </header>

      {/* SEARCH & FILTER BAR */}
      <div className="relative z-20 px-12 mb-8">
        <div 
          className={`
            bg-white/65 backdrop-blur-sm border border-ink/15 rounded-sm p-4
            shadow-[0_6px_20px_rgba(0,0,0,0.06)]
            transition-all duration-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="Search patterns, users, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 border border-ink/25 rounded-sm
                  bg-white/70 outline-none focus:border-ink transition
                "
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="
                px-4 py-2 border border-ink/25 rounded-sm
                bg-white/70 outline-none focus:border-ink transition
              "
            >
              <option value="all">All Patterns</option>
              {Object.entries(PATTERN_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                px-4 py-2 border border-ink/25 rounded-sm
                bg-white/70 outline-none focus:border-ink transition
              "
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="relative z-20 flex flex-col lg:flex-row gap-8 px-12 max-w-[1400px] mx-auto">

        {/* LEFT: POSTS */}
        <div className="flex flex-col gap-6 flex-[2]">

          {/* CREATE POST BUTTON */}
          <button
            onClick={() => setShowCreatePost(true)}
            className={`
              bg-gradient-to-r from-accent-green/20 to-accent-gold/20
              backdrop-blur-sm border-2 border-dashed border-ink/30
              rounded-sm p-8 text-center
              hover:border-ink/50 hover:scale-[1.01]
              transition-all duration-300
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-serif text-xl mb-1">Share Your Discovery</h3>
            <p className="text-sm opacity-60">Upload a dataset or visualization</p>
          </button>

          {/* LOADING STATE */}
          {loading && (
            <div className="text-center py-20">
              <div className="text-5xl mb-3 animate-pulse">⚡</div>
              <p className="font-serif text-lg">Loading patterns...</p>
            </div>
          )}

          {/* POSTS */}
          {!loading && filteredPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              delay={index * 0.1}
              isExpanded={expandedPost === post.id}
              onExpand={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              onLike={handleLike}
              onSave={handleSave}
            />
          ))}

          {/* NO RESULTS */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-20 opacity-60">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-serif text-lg">No patterns found</p>
              <p className="text-sm">
                {posts.length === 0 
                  ? "Be the first to share a pattern discovery!" 
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="flex flex-col gap-6 flex-[1] lg:sticky lg:top-8 lg:self-start">

          {/* LIVE ACTIVITY FEED */}
          <div
            className={`
              bg-white/60 backdrop-blur-sm border border-ink/20 rounded-sm
              shadow-[0_8px_24px_rgba(0,0,0,0.07)] p-6
              transition-all duration-700 delay-100
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <h3 className="font-serif text-[22px] mb-4 flex items-center gap-2">
              <span className="animate-pulse">🔴</span> Live Activity
            </h3>
            <div className="space-y-3">
              {activities.map((activity, i) => (
                <div key={i} className="text-sm flex items-start gap-2 opacity-75 hover:opacity-100 transition">
                  <span className="text-xs opacity-50 mt-0.5">{activity.time}</span>
                  <p>
                    <strong>@{activity.user}</strong> {activity.action} <span className="text-accent-green">{activity.pattern}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PATTERN TYPES LEGEND */}
          <div
            className={`
              bg-white/60 backdrop-blur-sm border border-ink/20 rounded-sm
              shadow-[0_8px_24px_rgba(0,0,0,0.07)] p-6
              transition-all duration-700 delay-200
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <h3 className="font-serif text-[22px] mb-4">Pattern Types</h3>
            <div className="space-y-2">
              {Object.entries(PATTERN_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xl">{type.icon}</span>
                  <span 
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TRENDING PATTERNS */}
          <div
            className={`
              bg-white/60 backdrop-blur-sm border border-ink/20 rounded-sm
              shadow-[0_8px_24px_rgba(0,0,0,0.07)] p-6
              transition-all duration-700 delay-300
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
          >
            <h3 className="font-serif text-[22px] mb-4">Trending 🔥</h3>
            <div className="space-y-3">
              <TrendingItem title="Bitcoin Analysis" count={posts.filter(p => p.patternType === 'bitcoin').length} />
              <TrendingItem title="Golden Ratio" count={posts.filter(p => p.patternType === 'golden').length} />
              <TrendingItem title="Fibonacci" count={posts.filter(p => p.patternType === 'fibonacci').length} />
            </div>
          </div>
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

/* 
      POST CARD COMPONENT
 */
function PostCard({ post, delay, isExpanded, onExpand, onLike, onSave }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showReply, setShowReply] = useState(false);
  const cardRef = React.useRef(null);

  React.useEffect(() => {
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
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 250;
    const y = (e.clientX - rect.left - rect.width / 2) / 250;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const patternType = PATTERN_TYPES[post.patternType] || PATTERN_TYPES.other;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        bg-white/65 backdrop-blur-sm border border-ink/20
        rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]
        p-6 cursor-pointer
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transitionDelay: isVisible ? `${delay}s` : '0s',
      }}
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl"
            style={{ backgroundColor: post.avatar.color }}
          >
            {post.avatar.char}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">@{post.username}</span>
              {/* Badges */}
              {post.badges && post.badges.map(badgeKey => (
                <span 
                  key={badgeKey}
                  className="text-sm"
                  title={USER_BADGES[badgeKey]?.name}
                >
                  {USER_BADGES[badgeKey]?.icon}
                </span>
              ))}
            </div>
            <div className="text-xs opacity-50">{post.timestamp}</div>
          </div>
        </div>

        {/* Pattern Type Badge */}
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
          style={{ backgroundColor: patternType.color }}
        >
          <span>{patternType.icon}</span>
          {patternType.label}
        </span>
      </div>

      {/* Thumbnail Preview - Only show if NOT expanded */}
      {!isExpanded && (
        <div className="text-6xl text-center mb-4 py-6 bg-white/40 rounded-sm">
          {post.thumbnail}
        </div>
      )}

      {/* Title */}
      <h2 className="font-serif text-[24px] mb-2">
        {post.title}
      </h2>

      {/* Content */}
      <p className={`opacity-80 leading-relaxed mb-4 ${!isExpanded && 'line-clamp-2'}`}>
        {post.content}
      </p>

      {/* SHOW INSIGHTS IF EXPANDED */}
      {isExpanded && post.analysisData && post.analysisData.insights && (
        <div className="mb-4 p-4 bg-gradient-to-r from-accent-green/10 to-accent-gold/10 rounded-sm border border-ink/10" onClick={(e) => e.stopPropagation()}>
          <h4 className="font-serif text-lg mb-3 flex items-center gap-2">
            <span>🔍</span> Key Discoveries
          </h4>
          <div className="space-y-2">
            {post.analysisData.insights.map((insight, i) => (
              <p key={i} className="text-sm leading-relaxed">{insight}</p>
            ))}
          </div>
        </div>
      )}

      {/* SHOW VISUALIZATION IF EXPANDED AND HAS DATA */}
      {isExpanded && post.analysisData && post.analysisData.visualization_data && (
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <PatternVisualization data={post.analysisData} />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm opacity-60 mb-4">
        <span className="flex items-center gap-1">
          <EyeIcon /> {post.views}
        </span>
        <span className="flex items-center gap-1">
          <CommentIcon /> {post.comments.length}
        </span>
        {isExpanded ? (
          <span className="text-xs ml-auto">👆 Click to collapse</span>
        ) : (
          <span className="text-xs ml-auto">👆 Click to expand & view visualization</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pb-4 border-b border-ink/10">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-sm border transition-all
            ${post.isLiked 
              ? 'bg-accent-green/20 border-accent-green text-accent-green' 
              : 'border-ink/20 hover:bg-ink/5'
            }
          `}
        >
          <HeartIcon filled={post.isLiked} /> {post.likes}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowReply(!showReply); }}
          className="
            flex items-center gap-2 px-4 py-2 rounded-sm border border-ink/20
            hover:bg-ink/5 transition
          "
        >
          <ReplyIcon /> Reply
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onSave(post.id); }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-sm border transition-all
            ${post.isSaved 
              ? 'bg-accent-gold/20 border-accent-gold text-accent-gold' 
              : 'border-ink/20 hover:bg-ink/5'
            }
          `}
        >
          <BookmarkIcon filled={post.isSaved} />
        </button>
      </div>

      {/* Reply Box */}
      {showReply && (
        <div className="mt-4 animate-slide-down" onClick={(e) => e.stopPropagation()}>
          <textarea
            placeholder="Write a reply..."
            className="
              w-full h-20 resize-none px-3 py-2 border border-ink/25
              outline-none bg-white/70 rounded-sm focus:border-ink text-sm
            "
          />
          <button className="
            mt-2 px-4 py-1.5 border border-ink text-sm rounded-sm
            hover:bg-ink hover:text-paper transition
          ">
            Post Reply
          </button>
        </div>
      )}

      {/* NEW COMMENT SECTION */}
      {isExpanded && (
        <CommentSection
          patternId={post.id}
          comments={post.comments}
          onCommentAdded={() => {
            window.location.reload();
          }}
        /> 
      )}
    </div>
  );
}

/* 
      TRENDING ITEM COMPONENT
*/
function TrendingItem({ title, count }) {
  return (
    <div className="flex items-center justify-between hover:bg-white/50 p-2 rounded transition">
      <span className="text-sm">{title}</span>
      <span className="text-xs opacity-50">{count} posts</span>
    </div>
  );
}

/*
      CREATE POST MODAL
*/
function CreatePostModal({ onClose }) {
  return (
    <div
      className="
        fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm
        flex justify-center items-center z-[999] px-6
        animate-fade-in
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white/80 backdrop-blur-md border border-ink/20 p-8 rounded-sm
          shadow-[0_8px_32px_rgba(0,0,0,0.22)]
          max-w-[600px] w-full
          animate-slide-up
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-[28px] mb-6">
          Share Your Discovery
        </h3>

        <p className="text-center text-sm opacity-60 mb-6">
          Go to Dashboard to upload and analyze a dataset, then publish it to the community!
        </p>

        <button
          onClick={onClose}
          className="
            w-full border border-ink px-6 py-3 rounded-sm text-sm
            hover:bg-ink hover:text-paper transition
          "
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

/* 
      ICON COMPONENTS
*/
const SearchIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);