import React, { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import PatternVisualization from "../components/PatternVisualization";

const GLYPHS = ["φ", "π", "∑", "∞", "ψ", "∂", "√", "≡", "∫", "λ"];

// Avatar options
const AVATAR_CHARS = [
  { id: 1, char: "φ", name: "Phi" },
  { id: 2, char: "π", name: "Pi" },
  { id: 3, char: "∑", name: "Sigma" },
  { id: 4, char: "∞", name: "Infinity" },
  { id: 5, char: "ψ", name: "Psi" },
  { id: 6, char: "∂", name: "Partial" },
  { id: 7, char: "√", name: "Root" },
  { id: 8, char: "≡", name: "Identity" },
  { id: 9, char: "∫", name: "Integral" },
  { id: 10, char: "λ", name: "Lambda" },
  { id: 11, char: "Σ", name: "Sum" },
  { id: 12, char: "Δ", name: "Delta" },
];

const AVATAR_COLORS = [
  "#7BA591", "#C9A961", "#8B7BA8", "#B85C5C", 
  "#5C8BB8", "#B88B5C", "#5CB88B", "#8B5CB8"
];

const THEMES = [
  { id: "green", name: "Forest", color: "#7BA591" },
  { id: "gold", name: "Golden", color: "#C9A961" },
  { id: "purple", name: "Mystic", color: "#8B7BA8" },
  { id: "blue", name: "Ocean", color: "#5C8BB8" },
];

const ACHIEVEMENTS = [
  { id: 1, name: "First Discovery", icon: "🌟", unlocked: true, desc: "Upload your first pattern" },
  { id: 2, name: "Pattern Hunter", icon: "🎯", unlocked: true, desc: "Find 10 patterns" },
  { id: 3, name: "Golden Eye", icon: "👁️", unlocked: false, desc: "Discover 5 golden ratios" },
  { id: 4, name: "Fibonacci Master", icon: "🌀", unlocked: false, desc: "Find 10 Fibonacci sequences" },
];

export default function Dashboard() {
  const [username, setUsername] = useState("PatternSeeker");
  const [bio, setBio] = useState("Exploring the mathematical beauty in data...");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_CHARS[0]);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [trails, setTrails] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Pattern analysis state
  const [analyzedData, setAnalyzedData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [patternTitle, setPatternTitle] = useState(""); // ← MOVED INSIDE!

  // Sample collection data
  const [myCollection, setMyCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(true);

  // Stats
  const stats = {
    patternsFound: 47,
    daysActive: 23,
    totalUploads: 12,
  };

  /* 
      LOAD PROFILE ON MOUNT
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const user = res.data.user;
          
          setUsername(user.username || "PatternSeeker");
          setBio(user.bio || "Exploring the mathematical beauty in data...");
          
          if (user.avatar) {
            const avatarChar = AVATAR_CHARS.find(a => a.id === user.avatar.charId);
            if (avatarChar) setSelectedAvatar(avatarChar);
            if (user.avatar.color) setAvatarColor(user.avatar.color);
          }
          
          if (user.theme) {
            const userTheme = THEMES.find(t => t.id === user.theme.id);
            if (userTheme) setTheme(userTheme);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, []);

  /* 
      SAVE PROFILE FUNCTION
   */
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.put('/auth/profile', {
        username,
        bio,
        avatar: {
          char: selectedAvatar.char,
          charId: selectedAvatar.id,
          color: avatarColor
        },
        theme: {
          id: theme.id,
          name: theme.name,
          color: theme.color
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Profile saved successfully! ✨');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(error.response?.data?.message || 'Failed to save changes');
    }
  };

  /* 
      SAVE AVATAR AND CLOSE MODAL
   */
  const handleAvatarSave = async () => {
    setShowAvatarModal(false);
    await handleSaveProfile();
  };
/* 
    HELPER: Get pattern thumbnail
*/
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

/* 
    FETCH USER'S PATTERNS FROM DATABASE
*/
const fetchMyPatterns = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await api.get('/patterns/my-patterns', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data.success) {
      const transformedPatterns = res.data.patterns.map(pattern => ({
        id: pattern._id,
        title: pattern.title,
        type: pattern.patternType || 'other',
        date: new Date(pattern.createdAt).toLocaleDateString(),
        thumbnail: getPatternThumbnail(pattern.patternType),
        analysisData: pattern.analysisData
      }));
      setMyCollection(transformedPatterns);
    }
    setLoadingCollection(false);
  } catch (error) {
    console.error('Failed to fetch patterns:', error);
    setLoadingCollection(false);
  }
};

  /* Mount animation trigger */
  /* Mount animation trigger */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Fetch user's patterns on mount */
  useEffect(() => {
    fetchMyPatterns();
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

  /* 
      FILE UPLOAD & ANALYSIS
 */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await api.post('/patterns/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('Analyzed Data:', response.data.data)
        setAnalyzedData(response.data.data);
        setShowVisualization(true);
        setAnalyzing(false);
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      alert(error.response?.data?.message || 'Failed to analyze dataset');
      setAnalyzing(false);
    }
  };

  /* Drag and drop handlers */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadedFile(file);
      setAnalyzing(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await api.post('/patterns/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          console.log('Analyzed Data:', response.data.data)
          setAnalyzedData(response.data.data);
          setShowVisualization(true);
          setAnalyzing(false);
        }

      } catch (error) {
        console.error('Analysis failed:', error);
        alert(error.response?.data?.message || 'Failed to analyze dataset');
        setAnalyzing(false);
      }
    }
  };

  /* 
      PUBLISH HANDLER
  */
  const handlePublish = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await api.post('/patterns/publish', {
      title: patternTitle || uploadedFile.name.replace('.csv', ''),
      caption: caption,
      datasetName: uploadedFile.name,
      patternType: analyzedData.dataset_type || 'other',
      analysisData: {
        patterns: analyzedData.patterns,
        visualization_data: analyzedData.visualization_data,
        insights: analyzedData.insights
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert('Pattern published to community! ✨');
      
      //  INSTEAD OF RELOAD, REFETCH THE PATTERNS
      await fetchMyPatterns();
      
      // Reset states
      setShowPublishModal(false);
      setPatternTitle('');
      setCaption('');
      setUploadedFile(null);
      setAnalyzedData(null);
      setShowVisualization(false);
    }
  } catch (error) {
    console.error('Publish failed:', error);
    alert('Failed to publish pattern');
  }
};

  /* 
      FLOATING GLYPH BACKGROUND
   */
  const glyphs = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        left: Math.random() * 95,
        top: Math.random() * 95,
        opacity: 0.015 + Math.random() * 0.035,
        size: 40 + Math.random() * 60,
        rotate: Math.random() * 40 - 20,
        delay: i * 0.12,
        parallaxSpeed: 0.2 + Math.random() * 0.5,
      })),
    []
  );

  return (
    <div 
      className="relative w-full min-h-screen bg-paper text-ink overflow-y-auto pb-24"
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
              '--rotate': `${g.rotate}deg`,
              '--delay': `${g.delay}s`,
              transform: `translateY(${scrollY * g.parallaxSpeed * 0.3}px) rotate(${g.rotate}deg)`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-10 px-10 pt-14 pb-6">
        <h1 className="font-serif text-[46px] tracking-wide">
          My Space
        </h1>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-10 space-y-8">

        {/* TOP SECTION: PROFILE + THEME */}
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-3 gap-6
            transition-all duration-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          {/* PROFILE CARD */}
          <div
            className="
              bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
              shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
            "
          >
            {/* AVATAR */}
            <div className="flex flex-col items-center mb-6">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="
                  relative w-28 h-28 rounded-full flex items-center justify-center
                  font-serif text-5xl transition-all hover:scale-105
                  border-4 border-white shadow-lg
                "
                style={{ backgroundColor: avatarColor }}
              >
                {selectedAvatar.char}
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
                  <EditIcon />
                </div>
              </button>
              <h3 className="font-serif text-xl mt-3">{username}</h3>
            </div>

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
                mt-1 w-full h-24 border border-ink/25 rounded-sm px-3 py-2
                resize-none bg-white/70 outline-none
                focus:border-ink
              "
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button
              onClick={handleSaveProfile}
              className="
                mt-4 w-full border border-ink rounded-sm px-6 py-2 text-sm
                hover:bg-ink hover:text-paper transition
              "
            >
              Save Changes
            </button>
          </div>

          {/* STATS + ACHIEVEMENTS */}
          <div className="md:col-span-2 space-y-6">
            {/* STATS */}
            <div
              className="
                bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
                shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
              "
            >
              <h2 className="font-serif text-2xl mb-4">Your Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard value={stats.patternsFound} label="Patterns Found" />
                <StatCard value={stats.daysActive} label="Days Active" />
                <StatCard value={stats.totalUploads} label="Total Uploads" />
              </div>
            </div>

            {/* THEME SELECTOR */}
            <div
              className="
                bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
                shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
              "
            >
              <h2 className="font-serif text-2xl mb-4">Theme</h2>
              <div className="flex gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`
                      px-4 py-2 rounded-sm border-2 transition-all
                      ${theme.id === t.id ? 'border-ink scale-105' : 'border-ink/20'}
                    `}
                    style={{ backgroundColor: t.color + '40' }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div
              className="
                bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
                shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
              "
            >
              <h2 className="font-serif text-2xl mb-4">Achievements</h2>
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`
                      p-3 rounded-sm border transition-all
                      ${achievement.unlocked 
                        ? 'bg-white/70 border-ink/20' 
                        : 'bg-white/30 border-ink/10 opacity-50'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="text-sm font-semibold">{achievement.name}</div>
                    <div className="text-xs opacity-60">{achievement.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div 
          className={`
            transition-all duration-700 delay-150
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div
            className="
              bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
              shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
            "
          >
            <h2 className="font-serif text-[28px] mb-4">Upload Dataset</h2>

            {/* DRAG & DROP ZONE */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-sm p-8 text-center transition-all
                ${isDragging 
                  ? 'border-accent-green bg-accent-green/10 scale-[1.02]' 
                  : 'border-ink/25 bg-white/40'
                }
              `}
            >
              <UploadIcon className="mx-auto mb-3" />
              <p className="text-sm opacity-70 mb-2">
                {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-xs opacity-50 mb-4">or</p>
              
              <label className="
                inline-block border border-ink rounded-sm px-6 py-2 text-sm
                hover:bg-ink hover:text-paper transition cursor-pointer
              ">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* ANALYZING STATE */}
            {analyzing && (
              <div className="mt-6 p-6 bg-white/70 rounded-sm border border-ink/15 text-center">
                <div className="text-4xl mb-3 animate-pulse">⚡</div>
                <p className="text-lg font-serif mb-1">Analyzing patterns...</p>
                <p className="text-xs opacity-60">Detecting Fibonacci levels, golden ratios, and market cycles</p>
              </div>
            )}

            {/* FILE UPLOADED */}
            {uploadedFile && !analyzing && !showVisualization && (
              <div className="mt-6 p-4 bg-white/70 rounded-sm border border-ink/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="text-sm font-semibold">{uploadedFile.name}</p>
                      <p className="text-xs opacity-60">Ready to analyze</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VISUALIZATION RESULTS */}
          {showVisualization && analyzedData && (
            <div className="mt-8 bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15 shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6">
              <h2 className="font-serif text-[32px] mb-6">Pattern Analysis Results</h2>
              
              {/* Insights Panel */}
              <div className="bg-gradient-to-r from-accent-green/10 to-accent-gold/10 p-6 rounded-sm mb-6 border border-ink/10">
                <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
                  <span>🔍</span> Key Discoveries
                </h3>
                <div className="space-y-2">
                  {analyzedData.insights.map((insight, i) => (
                    <p key={i} className="text-sm leading-relaxed">{insight}</p>
                  ))}
                </div>
              </div>

              {/* 3D Visualization */}
              <PatternVisualization data={analyzedData} />

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="
                    flex-1 border border-ink rounded-sm px-6 py-3 text-sm font-medium
                    hover:bg-ink hover:text-paper transition
                  "
                >
                  📤 Publish to Community
                </button>
                <button
                  onClick={() => {
                    setShowVisualization(false);
                    setAnalyzedData(null);
                    setUploadedFile(null);
                  }}
                  className="
                    border border-ink/30 rounded-sm px-6 py-3 text-sm
                    hover:bg-ink/5 transition
                  "
                >
                  Upload Another Dataset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MY COLLECTION */}
        <div 
          className={`
            transition-all duration-700 delay-300
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div
            className="
              bg-white/65 backdrop-blur-sm rounded-sm border border-ink/15
              shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6
            "
          >
            <h2 className="font-serif text-[28px] mb-6">My Collection</h2>

            {loadingCollection ? (
              <div className="text-center py-12 opacity-60">
                <div className="text-5xl mb-3 animate-pulse">⏳</div>
                <p className="font-serif text-lg">Loading your patterns...</p>
              </div>
            ) : myCollection.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {myCollection.map((item, index) => (
                  <CollectionCard key={item.id} item={item} delay={index * 0.1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-60">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-serif text-lg">No patterns yet</p>
                <p className="text-sm">Upload your first dataset to begin!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AVATAR SELECTION MODAL */}
      {showAvatarModal && (
        <div
          className="
            fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm
            flex justify-center items-center z-[999] px-6
            animate-fade-in
          "
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="
              bg-white/80 backdrop-blur-md border border-ink/20 p-8 rounded-sm
              shadow-[0_8px_32px_rgba(0,0,0,0.22)]
              max-w-[520px] w-full
              animate-slide-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-[26px] mb-6 text-center">
              Choose Your Avatar
            </h3>

            {/* CHARACTER SELECTION */}
            <div className="mb-6">
              <p className="text-sm opacity-70 mb-3">Character</p>
              <div className="grid grid-cols-6 gap-3">
                {AVATAR_CHARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`
                      aspect-square rounded-full flex items-center justify-center
                      font-serif text-2xl transition-all border-2
                      ${selectedAvatar.id === avatar.id 
                        ? 'border-ink scale-110' 
                        : 'border-ink/20 hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: avatarColor + '40' }}
                  >
                    {avatar.char}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SELECTION */}
            <div className="mb-6">
              <p className="text-sm opacity-70 mb-3">Background Color</p>
              <div className="flex gap-3 flex-wrap">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className={`
                      w-10 h-10 rounded-full transition-all border-2
                      ${avatarColor === color 
                        ? 'border-ink scale-110' 
                        : 'border-white hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* PREVIEW */}
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm opacity-70 mb-3">Preview</p>
              <div
                className="
                  w-24 h-24 rounded-full flex items-center justify-center
                  font-serif text-4xl border-4 border-white shadow-lg
                "
                style={{ backgroundColor: avatarColor }}
              >
                {selectedAvatar.char}
              </div>
            </div>

            <button
              onClick={handleAvatarSave}
              className="
                w-full border border-ink rounded-sm px-6 py-3 text-sm
                hover:bg-ink hover:text-paper transition
              "
            >
              Save Avatar
            </button>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showPublishModal && (
        <div
          className="
            fixed inset-0 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm
            flex justify-center items-center z-[999] px-6
            animate-fade-in
          "
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="
              bg-white/80 backdrop-blur-md border border-ink/20 p-6 rounded-sm
              shadow-[0_8px_32px_rgba(0,0,0,0.22)]
              max-w-[480px] w-full
              animate-slide-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-[26px] mb-4">
              Publish to Community
            </h3>

            <div className="mb-4 p-4 bg-white/70 rounded-sm">
              <p className="text-sm font-semibold mb-1">📊 {uploadedFile?.name}</p>
              <p className="text-xs opacity-60">Pattern analysis complete!</p>
            </div>

            {/* Title Input */}
            <input
              type="text"
              className="
                w-full border border-ink/25 rounded-sm px-3 py-2 mb-3
                bg-white/70 outline-none focus:border-ink
              "
              placeholder="Give your discovery a title..."
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
            />

            {/* Caption Input */}
            <textarea
              className="
                w-full h-24 border border-ink/25 rounded-sm px-3 py-2 resize-none
                bg-white/70 outline-none focus:border-ink
              "
              placeholder="Add a caption or description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPublishModal(false)}
                className="
                  px-5 py-2 rounded-sm text-sm border border-ink/30
                  hover:bg-ink/5 transition
                "
              >
                Cancel
              </button>

              <button
                onClick={handlePublish}
                className="
                  border border-ink px-6 py-2 rounded-sm text-sm
                  hover:bg-ink hover:text-paper transition
                "
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* 
      STAT CARD COMPONENT
 */
function StatCard({ value, label }) {
  const [count, setCount] = useState(0);
  const cardRef = React.useRef(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = value / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
              setCount(value);
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
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [value, hasAnimated]);

  return (
    <div ref={cardRef} className="text-center p-4 bg-white/50 rounded-sm">
      <div className="font-serif text-3xl text-accent-green mb-1">
        {count}
      </div>
      <div className="text-xs opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* 
      COLLECTION CARD COMPONENT
 */
function CollectionCard({ item, delay }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white/70 rounded-sm border border-ink/15 p-4
        hover:shadow-lg transition-all duration-500 cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transitionDelay: isVisible ? `${delay}s` : '0s',
      }}
    >
      {/* Thumbnail */}
      <div className="text-5xl text-center mb-3">{item.thumbnail}</div>
      
      {/* Info */}
      <h4 className="font-serif text-sm mb-1 line-clamp-2">{item.title}</h4>
      <p className="text-xs opacity-60 mb-1">{item.type}</p>
      <p className="text-xs opacity-40">{item.date}</p>

      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute inset-0 bg-ink/90 rounded-sm flex items-center justify-center gap-3 animate-fade-in">
          <button className="text-white text-xs px-3 py-1.5 border border-white/30 rounded-sm hover:bg-white/10 transition">
            View
          </button>
          <button className="text-white text-xs px-3 py-1.5 border border-white/30 rounded-sm hover:bg-white/10 transition">
            Edit
          </button>
          <button className="text-white text-xs px-3 py-1.5 border border-white/30 rounded-sm hover:bg-white/10 transition">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* 
      ICON COMPONENTS
 */
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);