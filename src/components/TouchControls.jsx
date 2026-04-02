// TouchControls.jsx — Full mobile dashboard overlay
// Writes into simStore.touch which Car.jsx reads alongside keyboard input.
import { useEffect, useRef, useState, useCallback } from "react";
import simStore from "../simStore";

// ── Steering Wheel ──────────────────────────────────────────────────────────
const SteeringWheel = () => {
  const [rotation, setRotation] = useState(0);
  const touchRef = useRef(null);
  const startXRef = useRef(null);
  const lastRotRef = useRef(0);

  const onTouchStart = (e) => {
    e.preventDefault();
    startXRef.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    if (startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const rot = Math.max(-135, Math.min(135, lastRotRef.current + dx * 0.7));
    setRotation(rot);

    const DEAD = 10;
    if (rot < -DEAD)      { simStore.touch.KeyD = true;  simStore.touch.KeyA = false; }
    else if (rot > DEAD)  { simStore.touch.KeyA = true;  simStore.touch.KeyD = false; }
    else                  { simStore.touch.KeyA = false; simStore.touch.KeyD = false; }
  };

  const onTouchEnd = () => {
    startXRef.current = null;
    lastRotRef.current = 0;
    // Spring back
    setRotation(0);
    simStore.touch.KeyA = false;
    simStore.touch.KeyD = false;
  };

  return (
    <div
      className="tc-wheel-wrap"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      ref={touchRef}
    >
      <svg
        width="120" height="120" viewBox="0 0 120 120"
        style={{ transform: `rotate(${rotation}deg)`, transition: rotation === 0 ? "transform 0.3s ease" : "none" }}
      >
        {/* Outer ring */}
        <circle cx="60" cy="60" r="55" fill="none" stroke="#ffffff30" strokeWidth="10" />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#ffffff88" strokeWidth="3" />
        {/* Spokes */}
        <line x1="60" y1="5"  x2="60" y2="40"  stroke="#ffffff99" strokeWidth="6" strokeLinecap="round" />
        <line x1="10" y1="85" x2="40" y2="70"  stroke="#ffffff99" strokeWidth="6" strokeLinecap="round" />
        <line x1="110" y1="85" x2="80" y2="70" stroke="#ffffff99" strokeWidth="6" strokeLinecap="round" />
        {/* Center hub */}
        <circle cx="60" cy="60" r="14" fill="#ffffff22" stroke="#ffffff66" strokeWidth="2" />
        {/* Horn indicator at top */}
        <circle cx="60" cy="20" r="5" fill="#ffffffcc" />
      </svg>
      <div className="tc-wheel-label">STEER</div>
    </div>
  );
};

// ── Pedal button ────────────────────────────────────────────────────────────
const Pedal = ({ label, icon, keyCode, color, activeColor }) => {
  const [pressed, setPressed] = useState(false);

  const press = (e) => {
    e.preventDefault();
    setPressed(true);
    simStore.touch[keyCode] = true;
  };
  const release = (e) => {
    e.preventDefault();
    setPressed(false);
    simStore.touch[keyCode] = false;
  };

  return (
    <button
      className={`tc-pedal ${pressed ? "tc-pedal--active" : ""}`}
      style={{ "--pedal-color": color, "--pedal-active": activeColor }}
      onTouchStart={press}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      <span className="tc-pedal-icon">{icon}</span>
      <span className="tc-pedal-label">{label}</span>
    </button>
  );
};

// ── One-shot tap button ─────────────────────────────────────────────────────
const TapButton = ({ label, icon, keyCode, color, pulse }) => {
  const [active, setActive] = useState(false);

  const press = (e) => {
    e.preventDefault();
    setActive(true);
    simStore.touch[keyCode] = true;
  };
  const release = (e) => {
    e.preventDefault();
    setActive(false);
    simStore.touch[keyCode] = false;
  };

  return (
    <button
      className={`tc-tap ${active ? "tc-tap--active" : ""} ${pulse ? "tc-tap--pulse" : ""}`}
      style={{ "--tap-color": color }}
      onTouchStart={press}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      <span className="tc-tap-icon">{icon}</span>
      <span className="tc-tap-label">{label}</span>
    </button>
  );
};

// ── Gear Shifter ──────────────────────────────────────────────────────────
const GearShifter = ({ gear }) => {
  const [upPressed, setUpPressed] = useState(false);
  const [downPressed, setDownPressed] = useState(false);

  const handleUp = (e) => {
    e.preventDefault();
    setUpPressed(true);
    simStore.touch.KeyE = true;
    setTimeout(() => { simStore.touch.KeyE = false; setUpPressed(false); }, 150);
  };
  const handleDown = (e) => {
    e.preventDefault();
    setDownPressed(true);
    simStore.touch.KeyQ = true;
    setTimeout(() => { simStore.touch.KeyQ = false; setDownPressed(false); }, 150);
  };

  const gearNames = { "-1":"R", 0:"N", 1:"1", 2:"2", 3:"3", 4:"4", 5:"5" };
  const gearName = gearNames[gear] ?? "N";

  return (
    <div className="tc-gear-wrap">
      <button
        className={`tc-gear-btn tc-gear-up ${upPressed ? "tc-gear-btn--active" : ""}`}
        onTouchStart={handleUp}
      >▲</button>
      <div className="tc-gear-display">
        <span className="tc-gear-digit">{gearName}</span>
        <span className="tc-gear-lbl">GEAR</span>
      </div>
      <button
        className={`tc-gear-btn tc-gear-down ${downPressed ? "tc-gear-btn--active" : ""}`}
        onTouchStart={handleDown}
      >▼</button>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const TouchControls = ({ gear = 0, headlightsOn = false }) => {
  // Only render on touch-capable devices
  if (typeof window !== "undefined" && !("ontouchstart" in window) && !navigator.maxTouchPoints) {
    return null;
  }

  return (
    <div className="tc-root">

      {/* ── Left side: Steering wheel ── */}
      <div className="tc-left">
        <SteeringWheel />

        {/* Handbrake */}
        <button
          className="tc-handbrake"
          onTouchStart={(e) => { e.preventDefault(); simStore.touch.Space = true; }}
          onTouchEnd={(e)   => { e.preventDefault(); simStore.touch.Space = false; }}
          onTouchCancel={(e) => { e.preventDefault(); simStore.touch.Space = false; }}
        >
          <span>🅿️</span>
          <span className="tc-handbrake-lbl">HANDBRAKE</span>
        </button>
      </div>

      {/* ── Center: Info buttons ── */}
      <div className="tc-center">
        <TapButton label="ENGINE" icon="🔑" keyCode="KeyI" color="#22c55e" />
        <TapButton label="LIGHTS"  icon={headlightsOn ? "💡" : "🔦"} keyCode="KeyH" color="#f59e0b" />
        <TapButton label="HORN"    icon="📯" keyCode="KeyF" color="#3b82f6" pulse />
      </div>

      {/* ── Right side: Pedals + Gear ── */}
      <div className="tc-right">
        <GearShifter gear={gear} />

        <div className="tc-pedals">
          <Pedal label="GAS"   icon="⬆️" keyCode="KeyW" color="#16a34a"  activeColor="#4ade80" />
          <Pedal label="BRAKE" icon="⬇️" keyCode="KeyS" color="#dc2626"  activeColor="#f87171" />
        </div>
      </div>
    </div>
  );
};

export default TouchControls;
