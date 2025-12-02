// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { applyTheme } from "../utils/themes"; 

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  // Determine if we're on a light background page
  const isLightPage = ['/home','/myspace', '/community'].includes(location.pathname);
  const textColor = isLightPage ? 'text-ink' : 'text-white';
  const hoverColor = isLightPage ? 'hover:text-accent-gold' : 'hover:text-cyan-300';

  const goHome = () => {
    navigate("/home");
    setIsMenuOpen(false);
  };

  const goMySpace = () => {
    if (token) navigate("/myspace");
    else navigate("/login", { state: { from: "/myspace", mustRegister: true } });
    setIsMenuOpen(false);
  };

  const goCommunity = () => {
    if (token) navigate("/community");
    else navigate("/login", { state: { from: "/community", mustRegister: true } });
    setIsMenuOpen(false);
  };

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Reset theme to default
  localStorage.setItem('selectedTheme', 'forest');
  applyTheme('forest');
  
  navigate("/login");
  setIsMenuOpen(false);
};
  const goLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 w-full px-4 sm:px-10 py-4 sm:py-6 flex justify-between items-center z-50">
      {/* LOGO - always goes home */}
      <button
        onClick={goHome}
        className="
          text-xl sm:text-2xl font-semibold tracking-wide
          text-transparent bg-clip-text
          bg-gradient-to-r from-yellow-300 to-orange-500
        "
      >
        PATTERNCRAFT
      </button>

      {/* DESKTOP NAV - hidden on mobile */}
      <nav className="hidden md:flex gap-8 text-lg">
        <button
          onClick={goMySpace}
          className={`${textColor} ${hoverColor} transition`}
        >
          {token && user?.username ? `@${user.username}` : "My Space"}
        </button>

        {!token ? (
          <button onClick={goLogin} className={`${textColor} ${hoverColor} transition`}>
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className={`${textColor} hover:text-red-500 transition`}
          >
            Logout
          </button>
        )}

        <button
          onClick={goCommunity}
          className={`${textColor} ${hoverColor} transition`}
        >
          Community
        </button>
      </nav>

      {/* MOBILE HAMBURGER BUTTON - shown on mobile only */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center relative z-[60]"
        aria-label="Toggle menu"
      >
        <span 
          className={`w-6 h-0.5 transition-all duration-300 ${
            isMenuOpen ? 'rotate-45 translate-y-2 bg-white' : isLightPage ? 'bg-ink' : 'bg-white'
          }`}
        />
        <span 
          className={`w-6 h-0.5 transition-all duration-300 ${
            isMenuOpen ? 'opacity-0' : isLightPage ? 'bg-ink' : 'bg-white'
          }`}
        />
        <span 
          className={`w-6 h-0.5 transition-all duration-300 ${
            isMenuOpen ? '-rotate-45 -translate-y-2 bg-white' : isLightPage ? 'bg-ink' : 'bg-white'
          }`}
        />
      </button>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu */}
          <div 
            className="
              md:hidden fixed top-16 right-4 w-64
              bg-white/95 backdrop-blur-md border border-ink/20
              rounded-lg shadow-2xl z-50
            "
          >
            <nav className="flex flex-col p-4 gap-2 text-base text-ink">
              <button
                onClick={goMySpace}
                className="text-left hover:bg-ink/5 transition px-4 py-3 rounded-md"
              >
                {token && user?.username ? `@${user.username}` : "My Space"}
              </button>

              <button
                onClick={goCommunity}
                className="text-left hover:bg-ink/5 transition px-4 py-3 rounded-md"
              >
                Community
              </button>

              <div className="border-t border-ink/10 my-2" />

              {!token ? (
                <button 
                  onClick={goLogin} 
                  className="text-left hover:bg-ink/5 transition px-4 py-3 rounded-md"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-left hover:bg-red-50 text-red-600 transition px-4 py-3 rounded-md"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}