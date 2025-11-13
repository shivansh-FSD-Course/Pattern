import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

export default function IntroGate() {
  const [doorOpen, setDoorOpen] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setDoorOpen(true);

    // Door opens first
    setTimeout(() => {
      setFadeOut(true);
    }, 900);

    // After fade-out, go to landing page
    setTimeout(() => {
      navigate("/home");
    }, 1800);
  };

  return (
    <div className="intro-container">

      {/* Warm glow */}
      <div className="door-glow"></div>

      {/* Embers */}
      {Array.from({ length: 70 }).map((_, i) => (
        <div
          key={i}
          className="ember"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
            transform: `scale(${0.4 + Math.random() * 1.1})`
          }}
        />
      ))}

      {/* Door image */}
      <img
        src="/src/assets/dungeon/door.png"
        className={`door-image ${doorOpen ? "door-open" : ""}`}
      />

      {/* Button */}
      {!doorOpen && (
        <button className="enter-button" onClick={handleEnter}>
          ENTER&nbsp;DUNGEON
        </button>
      )}

      {/* Fade overlay */}
      {fadeOut && <div className="fade-overlay"></div>}
    </div>
  );
}
