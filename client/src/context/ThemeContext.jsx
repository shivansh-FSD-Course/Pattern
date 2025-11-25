import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const THEMES = {
  green: { name: "Forest", primary: "#7BA591", secondary: "#5A8A73" },
  gold: { name: "Golden", primary: "#C9A961", secondary: "#B39653" },
  purple: { name: "Mystic", primary: "#8B7BA8", secondary: "#6F5F8C" },
  blue: { name: "Ocean", primary: "#5C8BB8", secondary: "#4A729A" },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('green');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('green');
    }
  }, []);

  const applyTheme = (themeId) => {
    const theme = THEMES[themeId];
    if (!theme) return;

    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    
    console.log('🎨 Theme applied:', themeId, theme.primary);  // Debug log
  };

  const changeTheme = (themeId) => {
    if (!THEMES[themeId]) return;
    
    console.log('🎨 Changing theme to:', themeId);  // Debug log
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme, 
      themes: THEMES,
      getThemeColor: (themeId) => THEMES[themeId]?.primary 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};