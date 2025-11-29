export const THEMES = {
  forest: {
    name: 'Forest',
    primary: '#7BA591',
    secondary: '#5C8B7B',
    accent: '#9BC4B5',
    background: '#F5F7F6',
    card: '#FFFFFF',
    text: '#2C3E3A',
  },
  golden: {
    name: 'Golden',
    primary: '#C9A961',
    secondary: '#B89550',
    accent: '#E0C380',
    background: '#FBF9F4',
    card: '#FFFFFF',
    text: '#3E3425',
  },
  mystic: {
    name: 'Mystic',
    primary: '#8B7BA8',
    secondary: '#7A6B96',
    accent: '#A896C4',
    background: '#F7F6FA',
    card: '#FFFFFF',
    text: '#3A3145',
  },
  ocean: {
    name: 'Ocean',
    primary: '#5C8BB8',
    secondary: '#4A7AA6',
    accent: '#7BA5C9',
    background: '#F4F7FA',
    card: '#FFFFFF',
    text: '#2C3845',
  },
};

export const applyTheme = (themeName) => {
  const theme = THEMES[themeName] || THEMES.forest;
  
  // Apply CSS variables to root
  document.documentElement.style.setProperty('--theme-primary', theme.primary);
  document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
  document.documentElement.style.setProperty('--theme-accent', theme.accent);
  document.documentElement.style.setProperty('--theme-background', theme.background);
  document.documentElement.style.setProperty('--theme-card', theme.card);
  document.documentElement.style.setProperty('--theme-text', theme.text);
  
  // Save to localStorage
  localStorage.setItem('selectedTheme', themeName);
};

export const getSelectedTheme = () => {
  return localStorage.getItem('selectedTheme') || 'forest';
};