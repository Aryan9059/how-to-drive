import { useState } from "react";
import simStore from "../simStore";
import { Key, Lightbulb, Volume2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';

const Pedal = ({ label, icon: Icon, keyCode, color, activeColor }) => {
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
      <span className="tc-pedal-icon"><Icon size={32} strokeWidth={2.5} /></span>
      <span className="tc-pedal-label">{label}</span>
    </button>
  );
};

const TapButton = ({ label, icon: Icon, keyCode, color, pulse }) => {
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
      aria-label={label}
    >
      <span className="tc-tap-icon"><Icon size={22} /></span>
    </button>
  );
};

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

  const gearNames = { "-1": "R", 0: "N", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" };
  const gearName = gearNames[gear] ?? "N";

  return (
    <div className="tc-gear-wrap">
      <button
        className={`tc-gear-btn tc-gear-down ${downPressed ? "tc-gear-btn--active" : ""}`}
        onTouchStart={handleDown}
      ><ChevronDown size={28} /></button>

      <div className="tc-gear-display">
        <span className="tc-gear-digit">{gearName}</span>
        <span className="tc-gear-lbl">GEAR</span>
      </div>

      <button
        className={`tc-gear-btn tc-gear-up ${upPressed ? "tc-gear-btn--active" : ""}`}
        onTouchStart={handleUp}
      ><ChevronUp size={28} /></button>
    </div>
  );
};

const TouchControls = ({ gear = 0, headlightsOn = false }) => {
  if (typeof window !== "undefined" && !("ontouchstart" in window) && !navigator.maxTouchPoints) {
    return null;
  }

  return (
    <div className="tc-root">

      {}
      <div className="tc-left">
        <button
          className="tc-handbrake"
          onTouchStart={(e) => { e.preventDefault(); simStore.touch.Space = true; }}
          onTouchEnd={(e) => { e.preventDefault(); simStore.touch.Space = false; }}
          onTouchCancel={(e) => { e.preventDefault(); simStore.touch.Space = false; }}
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>℗</span>
          <span className="tc-handbrake-lbl">HANDBRAKE</span>
        </button>

        <div className="tc-pedals">
          <Pedal label="BRAKE" icon={ArrowDown} keyCode="KeyS" color="#dc2626" activeColor="#f87171" />
          <Pedal label="GAS" icon={ArrowUp} keyCode="KeyW" color="#16a34a" activeColor="#4ade80" />
        </div>
      </div>

      {}
      <div className="tc-center">
        <TapButton label="ENGINE" icon={Key} keyCode="KeyI" color="#22c55e" />
        <TapButton label="LIGHTS" icon={Lightbulb} keyCode="KeyH" color="#f59e0b" />
        <TapButton label="HORN" icon={Volume2} keyCode="KeyF" color="#3b82f6" pulse />
      </div>

      {}
      <div className="tc-right">
        <GearShifter gear={gear} />

        <div className="tc-pedals">
          <Pedal label="LEFT" icon={ArrowLeft} keyCode="KeyA" color="#3b82f6" activeColor="#60a5fa" />
          <Pedal label="RIGHT" icon={ArrowRight} keyCode="KeyD" color="#3b82f6" activeColor="#60a5fa" />
        </div>
      </div>
    </div>
  );
};

export default TouchControls;