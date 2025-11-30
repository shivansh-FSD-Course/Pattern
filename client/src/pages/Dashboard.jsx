import React, { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import PatternVisualization from "../components/PatternVisualization";
import { THEMES, applyTheme, getSelectedTheme } from '../utils/themes';
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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [trails, setTrails] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(getSelectedTheme());
  
  // Pattern analysis state
  const [analyzedData, setAnalyzedData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [patternTitle, setPatternTitle] = useState("");

  // Sample collection data
  const [myCollection, setMyCollection] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(true);

  // Stats
  const stats = {
    patternsFound: 47,
    daysActive: 23,
    totalUploads: 12,
  };

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  // Handle theme change
  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    applyTheme(themeName);
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
            setSelectedTheme(user.theme);
            applyTheme(user.theme);
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
        theme: selectedTheme
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
        
        await fetchMyPatterns();
        
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
      className="relative w-full min-h-screen text-ink overflow-y-auto pb-24"
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
        <h1 
          className="font-serif text-[46px] tracking-wide"
          style={{ color: 'var(--theme-primary)' }}
        >
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
            className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '20'
            }}
          >
            {/* AVATAR */}
            <div className="flex flex-col items-center mb-6">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="
                  relative w-28 h-28 rounded-full flex items-center justify-center
                  font-serif text-5xl transition-all hover:scale-105
                  border-4 shadow-lg
                "
                style={{ 
                  backgroundColor: avatarColor,
                  borderColor: 'var(--theme-accent)'
                }}
              >
                {selectedAvatar.char}
                <div 
                  className="absolute bottom-0 right-0 rounded-full p-1.5 shadow-md"
                  style={{ backgroundColor: 'var(--theme-card)' }}
                >
                  <EditIcon />
                </div>
              </button>
              <h3 
                className="font-serif text-xl mt-3"
                style={{ color: 'var(--theme-text)' }}
              >
                {username}
              </h3>
            </div>

            <label className="text-sm opacity-70">Username</label>
            <input
              className="
                mt-1 w-full rounded-sm px-3 py-2
                outline-none transition border
              "
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-primary)' + '40'
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--theme-primary)' + '40'}
            />

            <label className="text-sm opacity-70 mt-4 block">Bio</label>
            <textarea
              className="
                mt-1 w-full h-24 rounded-sm px-3 py-2
                resize-none outline-none border
              "
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-primary)' + '40'
              }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--theme-primary)' + '40'}
            />

            <button
              onClick={handleSaveProfile}
              className="mt-4 w-full rounded-sm px-6 py-2 text-sm transition border"
              style={{
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--theme-primary)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--theme-primary)';
              }}
            >
              Save Changes
            </button>
          </div>

          {/* STATS + ACHIEVEMENTS */}
          <div className="md:col-span-2 space-y-6">
            {/* STATS */}
            <div
              className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-primary)' + '20'
              }}
            >
              <h2 
                className="font-serif text-2xl mb-4"
                style={{ color: 'var(--theme-primary)' }}
              >
                Your Statistics
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard value={stats.patternsFound} label="Patterns Found" />
                <StatCard value={stats.daysActive} label="Days Active" />
                <StatCard value={stats.totalUploads} label="Total Uploads" />
              </div>
            </div>

            {/* THEME SELECTOR */}
            <div
              className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-primary)' + '20'
              }}
            >
              <h3 
                className="font-serif text-[22px] mb-4"
                style={{ color: 'var(--theme-primary)' }}
              >
                Theme
              </h3>
              {/* MOBILE: 2 columns, TABLET: 3 columns, DESKTOP: 4 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className="p-3 sm:p-4 rounded-sm border-2 transition-all"
                    style={{
                      borderColor: selectedTheme === key ? 'var(--theme-primary)' : '#E5E5E5',
                      transform: selectedTheme === key ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: selectedTheme === key ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <p className="text-xs sm:text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div
              className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-primary)' + '20'
              }}
            >
              <h2 
                className="font-serif text-2xl mb-4"
                style={{ color: 'var(--theme-primary)' }}
              >
                Achievements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 rounded-sm border transition-all"
                    style={{
                      backgroundColor: achievement.unlocked ? 'var(--theme-background)' : 'rgba(255,255,255,0.3)',
                      borderColor: achievement.unlocked ? 'var(--theme-primary)' + '30' : 'rgba(0,0,0,0.1)',
                      opacity: achievement.unlocked ? 1 : 0.5
                    }}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div 
                      className="text-sm font-semibold"
                      style={{ color: achievement.unlocked ? 'var(--theme-primary)' : 'inherit' }}
                    >
                      {achievement.name}
                    </div>
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
            className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '20'
            }}
          >
            <h2 
              className="font-serif text-[28px] mb-4"
              style={{ color: 'var(--theme-primary)' }}
            >
              Upload Dataset
            </h2>

            {/* DRAG & DROP ZONE */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-sm p-8 text-center transition-all"
              style={{
                borderColor: isDragging ? 'var(--theme-primary)' : 'var(--theme-primary)' + '40',
                backgroundColor: isDragging ? 'var(--theme-primary)' + '10' : 'var(--theme-background)',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <UploadIcon className="mx-auto mb-3" />
              <p className="text-sm opacity-70 mb-2">
                {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-xs opacity-50 mb-4">or</p>
              
              <label 
                className="inline-block rounded-sm px-6 py-2 text-sm transition cursor-pointer border"
                style={{
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--theme-primary)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--theme-primary)';
                }}
              >
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
              <div 
                className="mt-6 p-6 rounded-sm border text-center"
                style={{ 
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-primary)' + '30'
                }}
              >
                <div 
                  className="text-4xl mb-3 animate-pulse"
                  style={{ filter: 'hue-rotate(0deg)' }}
                >
                  ⚡
                </div>
                <p 
                  className="text-lg font-serif mb-1"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Analyzing patterns...
                </p>
                <p className="text-xs opacity-60">Detecting Fibonacci levels, golden ratios, and market cycles</p>
              </div>
            )}

            {/* FILE UPLOADED */}
            {uploadedFile && !analyzing && !showVisualization && (
              <div 
                className="mt-6 p-4 rounded-sm border"
                style={{ 
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-primary)' + '30'
                }}
              >
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
            <div 
              className="mt-8 backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-primary)' + '20'
              }}
            >
              <h2 
                className="font-serif text-[32px] mb-6"
                style={{ color: 'var(--theme-primary)' }}
              >
                Pattern Analysis Results
              </h2>
              
              {/* Insights Panel */}
              <div 
                className="p-6 rounded-sm mb-6 border"
                style={{
                  background: `linear-gradient(to right, var(--theme-primary)15, var(--theme-accent)15)`,
                  borderColor: 'var(--theme-primary)' + '20'
                }}
              >
                <h3 
                  className="font-serif text-xl mb-4 flex items-center gap-2"
                  style={{ color: 'var(--theme-primary)' }}
                >
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
                  className="flex-1 rounded-sm px-6 py-3 text-sm font-medium transition border"
                  style={{
                    borderColor: 'var(--theme-primary)',
                    color: 'var(--theme-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--theme-primary)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--theme-primary)';
                  }}
                >
                  📤 Publish to Community
                </button>
                <button
                  onClick={() => {
                    setShowVisualization(false);
                    setAnalyzedData(null);
                    setUploadedFile(null);
                  }}
                  className="border rounded-sm px-6 py-3 text-sm transition"
                  style={{
                    borderColor: 'var(--theme-primary)' + '50'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--theme-primary)' + '10';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
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
            className="backdrop-blur-sm rounded-sm border shadow-[0_8px_28px_rgba(0,0,0,0.07)] p-6"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '20'
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="font-serif text-[28px]"
                style={{ color: 'var(--theme-primary)' }}
              >
                My Collection
              </h2>
              
              {/* Delete All Button */}
              {myCollection.length > 0 && (
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ALL ${myCollection.length} patterns? This cannot be undone!`)) return;
                    
                    try {
                      const token = localStorage.getItem('token');
                      let successCount = 0;
                      let failCount = 0;
                      
                      for (const pattern of myCollection) {
                        try {
                          await api.delete(`/patterns/${pattern.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          successCount++;
                        } catch (err) {
                          console.error(`Failed to delete ${pattern.id}:`, err);
                          failCount++;
                        }
                      }
                      
                      if (successCount > 0) {
                        alert(`Deleted ${successCount} patterns!`);
                        setMyCollection([]);
                      }
                      if (failCount > 0) {
                        alert(`Failed to delete ${failCount} patterns.`);
                      }
                    } catch (error) {
                      console.error('Failed to delete all:', error);
                      alert('Failed to delete patterns');
                    }
                  }}
                  className="text-xs px-4 py-2 border border-red-500/50 text-red-600 rounded-sm hover:bg-red-500 hover:text-white transition"
                >
                  🗑️ Delete All ({myCollection.length})
                </button>
              )}
            </div>

            {loadingCollection ? (
              <div className="text-center py-12 opacity-60">
                <div className="text-5xl mb-3 animate-pulse">⏳</div>
                <p className="font-serif text-lg">Loading your patterns...</p>
              </div>
            ) : myCollection.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {myCollection.map((item, index) => (
                  <CollectionCard 
                    key={item.id} 
                    item={item} 
                    delay={index * 0.1}
                    onDelete={(deletedId) => {
                      setMyCollection(myCollection.filter(p => p.id !== deletedId));
                    }}
                  />
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
            className="backdrop-blur-md border p-8 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.22)] max-w-[520px] w-full animate-slide-up"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '40'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="font-serif text-[26px] mb-6 text-center"
              style={{ color: 'var(--theme-primary)' }}
            >
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
                    className="aspect-square rounded-full flex items-center justify-center font-serif text-2xl transition-all border-2"
                    style={{
                      backgroundColor: avatarColor + '40',
                      borderColor: selectedAvatar.id === avatar.id ? 'var(--theme-primary)' : 'rgba(0,0,0,0.2)',
                      transform: selectedAvatar.id === avatar.id ? 'scale(1.1)' : 'scale(1)'
                    }}
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
                    className="w-10 h-10 rounded-full transition-all border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: avatarColor === color ? 'var(--theme-primary)' : 'white',
                      transform: avatarColor === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* PREVIEW */}
            <div className="flex flex-col items-center mb-6">
              <p className="text-sm opacity-70 mb-3">Preview</p>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-serif text-4xl border-4 shadow-lg"
                style={{ 
                  backgroundColor: avatarColor,
                  borderColor: 'var(--theme-accent)'
                }}
              >
                {selectedAvatar.char}
              </div>
            </div>

            <button
              onClick={handleAvatarSave}
              className="w-full rounded-sm px-6 py-3 text-sm transition border"
              style={{
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--theme-primary)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--theme-primary)';
              }}
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
            className="backdrop-blur-md border p-6 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.22)] max-w-[480px] w-full animate-slide-up"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '40'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="font-serif text-[26px] mb-4"
              style={{ color: 'var(--theme-primary)' }}
            >
              Publish to Community
            </h3>

            <div 
              className="mb-4 p-4 rounded-sm"
              style={{ backgroundColor: 'var(--theme-background)' }}
            >
              <p className="text-sm font-semibold mb-1">📊 {uploadedFile?.name}</p>
              <p className="text-xs opacity-60">Pattern analysis complete!</p>
            </div>

            <input
              type="text"
              className="w-full border rounded-sm px-3 py-2 mb-3 outline-none"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-primary)' + '40'
              }}
              placeholder="Give your discovery a title..."
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--theme-primary)' + '40'}
            />

            <textarea
              className="w-full h-24 border rounded-sm px-3 py-2 resize-none outline-none"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-primary)' + '40'
              }}
              placeholder="Add a caption or description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--theme-primary)' + '40'}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2 rounded-sm text-sm border transition"
                style={{ borderColor: 'var(--theme-primary)' + '50' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--theme-primary)' + '10'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>

              <button
                onClick={handlePublish}
                className="border px-6 py-2 rounded-sm text-sm transition"
                style={{
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--theme-primary)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--theme-primary)';
                }}
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
    <div 
      ref={cardRef} 
      className="text-center p-4 rounded-sm"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div 
        className="font-serif text-3xl mb-1"
        style={{ color: 'var(--theme-primary)' }}
      >
        {count}
      </div>
      <div className="text-xs opacity-60 uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* 
      COLLECTION CARD COMPONENT
 */
/* 
      COLLECTION CARD COMPONENT - With Mobile Support
 */
function CollectionCard({ item, delay, onDelete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
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

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/patterns/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onDelete(item.id);
      alert('Pattern deleted! ✓');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.message || 'Failed to delete pattern.');
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    setShowVisualization(!showVisualization);
  };

  // Toggle buttons on click for mobile
  const handleCardClick = () => {
    setIsHovered(!isHovered);
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        className={`
          relative rounded-sm border p-4
          hover:shadow-lg transition-all duration-500 cursor-pointer
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{
          backgroundColor: 'var(--theme-background)',
          borderColor: 'var(--theme-primary)' + '30',
          transitionDelay: isVisible ? `${delay}s` : '0s',
        }}
      >
        <div className="text-4xl sm:text-5xl text-center mb-3">{item.thumbnail}</div>
        
        <h4 className="font-serif text-sm mb-1 line-clamp-2">{item.title}</h4>
        <p className="text-xs opacity-60 mb-1">{item.type}</p>
        <p className="text-xs opacity-40">{item.date}</p>

{/* Hover/Click Overlay - Better visibility */}
{isHovered && (
  <div 
    className="absolute inset-0 rounded-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 animate-fade-in"
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(4px)'
    }}
  >
    <button 
      onClick={handleView}
      className="w-full sm:w-auto text-white text-xs sm:text-sm px-4 py-2 rounded-sm transition font-medium"
      style={{
        backgroundColor: 'var(--theme-primary)',
        border: '2px solid white'
      }}
      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}
    >
       View
    </button>
    <button 
      onClick={handleDelete}
      className="w-full sm:w-auto text-white text-xs sm:text-sm px-4 py-2 bg-red-600 rounded-sm transition font-medium"
      style={{
        border: '2px solid white'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
    >
       Delete
    </button>
  </div>
)}
      </div>

      {/* Visualization Modal */}
      {showVisualization && item.analysisData && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm flex justify-center items-center z-[999] p-4 sm:p-6 animate-fade-in"
          onClick={() => setShowVisualization(false)}
        >
          <div
            className="backdrop-blur-md border rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.22)] w-full max-w-[900px] max-h-[90vh] overflow-y-auto animate-slide-up"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-primary)' + '40'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 p-4 sm:p-6 border-b flex justify-between items-start"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-primary)' + '20'
              }}
            >
              <h3 
                className="font-serif text-xl sm:text-[26px] pr-4"
                style={{ color: 'var(--theme-primary)' }}
              >
                {item.title}
              </h3>
              <button
                onClick={() => setShowVisualization(false)}
                className="text-2xl sm:text-3xl hover:opacity-70 transition flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {item.analysisData.insights && (
                <div 
                  className="p-3 sm:p-4 rounded-sm mb-4 border"
                  style={{
                    background: `linear-gradient(to right, var(--theme-primary)15, var(--theme-accent)15)`,
                    borderColor: 'var(--theme-primary)' + '20'
                  }}
                >
                  <h4 
                    className="font-serif text-base sm:text-lg mb-3 flex items-center gap-2"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    <span>🔍</span> Key Discoveries
                  </h4>
                  <div className="space-y-2">
                    {item.analysisData.insights.map((insight, i) => (
                      <p key={i} className="text-xs sm:text-sm leading-relaxed">{insight}</p>
                    ))}
                  </div>
                </div>
              )}

              <PatternVisualization data={item.analysisData} />
            </div>
          </div>
        </div>
      )}
    </>
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