import { useState, useCallback } from "react";
import simStore from "../simStore";
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  ChevronUp, ChevronDown,
  Key, Lightbulb, Volume2,
  Gauge, Layers, ParkingCircle,
  RotateCcw, Camera,
} from "lucide-react";


/* ─────────────────────────────────────────
   Utility: generic hold button
──────────────────────────────────────────*/
const HoldBtn = ({ keyCode, label, icon: Icon, color = "#3b82f6", activeColor, size = 22, extra = {} }) => {
  const [pressed, setPressed] = useState(false);

  const press = useCallback((e) => {
    e.preventDefault();
    setPressed(true);
    simStore.touch[keyCode] = true;
  }, [keyCode]);

  const release = useCallback((e) => {
    e.preventDefault();
    setPressed(false);
    simStore.touch[keyCode] = false;
  }, [keyCode]);

  return (
    <button
      className={`tc-btn ${pressed ? "tc-btn--active" : ""}`}
      style={{
        "--btn-color": pressed ? (activeColor || color) : color,
        ...extra,
      }}
      onTouchStart={press}
      onTouchEnd={release}
      onTouchCancel={release}
      aria-label={label}
    >
      {Icon && <Icon size={size} strokeWidth={2.4} />}
      <span className="tc-btn-lbl">{label}</span>
    </button>
  );
};

/* Tap button (fires once then auto-releases after a short delay) */
const TapBtn = ({ keyCode, label, icon: Icon, color = "#22c55e", size = 22 }) => {
  const [pressed, setPressed] = useState(false);

  const press = useCallback((e) => {
    e.preventDefault();
    setPressed(true);
    simStore.touch[keyCode] = true;
  }, [keyCode]);

  const release = useCallback((e) => {
    e.preventDefault();
    setPressed(false);
    simStore.touch[keyCode] = false;
  }, [keyCode]);

  return (
    <button
      className={`tc-btn ${pressed ? "tc-btn--active" : ""}`}
      style={{ "--btn-color": color }}
      onTouchStart={press}
      onTouchEnd={release}
      onTouchCancel={release}
      aria-label={label}
    >
      {Icon && <Icon size={size} strokeWidth={2.4} />}
      <span className="tc-btn-lbl">{label}</span>
    </button>
  );
};

/* ─────────────────────────────────────────
   CAR TOUCH LAYOUT
   Left:  Handbrake | Brake | Gas
   Center: Ignition | Lights | Horn
   Right: Gear Down | Gear Display | Gear Up | Left | Right
──────────────────────────────────────────*/
const GearShifter = ({ gear = 0 }) => {
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

const CarControls = ({ gear = 0 }) => (
  <div className="tc-root">
    {/* LEFT: handbrake + pedals */}
    <div className="tc-left">
      <button
        className="tc-handbrake"
        onTouchStart={(e) => { e.preventDefault(); simStore.touch.Space = true; }}
        onTouchEnd={(e) => { e.preventDefault(); simStore.touch.Space = false; }}
        onTouchCancel={(e) => { e.preventDefault(); simStore.touch.Space = false; }}
      >
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>℗</span>
        <span className="tc-handbrake-lbl">HB</span>
      </button>

      <div className="tc-pedals">
        <HoldBtn keyCode="KeyS" label="BRAKE" icon={ArrowDown} color="#dc2626" activeColor="#f87171" />
        <HoldBtn keyCode="KeyW" label="GAS"   icon={ArrowUp}   color="#16a34a" activeColor="#4ade80" />
      </div>
    </div>

    {/* CENTER: ignition / lights / horn */}
    <div className="tc-center">
      <TapBtn keyCode="KeyI" label="IGN"   icon={Key}       color="#22c55e" />
      <TapBtn keyCode="KeyH" label="LIGHT" icon={Lightbulb} color="#f59e0b" />
      <TapBtn keyCode="KeyF" label="HORN"  icon={Volume2}   color="#3b82f6" />
    </div>

    {/* RIGHT: gear shifter + steering */}
    <div className="tc-right">
      <GearShifter gear={gear} />
      <div className="tc-pedals">
        <HoldBtn keyCode="KeyA" label="LEFT"  icon={ArrowLeft}  color="#3b82f6" activeColor="#60a5fa" />
        <HoldBtn keyCode="KeyD" label="RIGHT" icon={ArrowRight} color="#3b82f6" activeColor="#60a5fa" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   HELICOPTER TOUCH LAYOUT
   ┌──────────────────────────┬──────────────────┐
   │  LEFT STICK              │  RIGHT STICK     │
   │  W=Climb  S=Descend      │  ↑=Fwd  ↓=Back   │
   │  A=Yaw L  D=Yaw R        │  ←=Roll ←=Roll R  │
   └──────────────────────────┴──────────────────┘
   Bottom strip: STAB | BOOST | GEAR | CAM
──────────────────────────────────────────*/
const HeliControls = () => (
  <div className="tc-root tc-heli">

    {/* LEFT cluster: Collective (W/S) + Yaw (A/D) */}
    <div className="tc-heli-cluster tc-heli-left">
      <span className="tc-cluster-title">COLLECTIVE · YAW</span>
      <div className="tc-dpad">
        <div className="tc-dpad-row">
          <HoldBtn keyCode="KeyW" label="CLIMB"    icon={ArrowUp}    color="#22c55e" activeColor="#4ade80" size={20} />
        </div>
        <div className="tc-dpad-row">
          <HoldBtn keyCode="KeyA" label="YAW L" icon={ArrowLeft}  color="#3b82f6" activeColor="#60a5fa" size={20} />
          <div className="tc-dpad-center">
            <span style={{ fontSize: 22 }}>🚁</span>
          </div>
          <HoldBtn keyCode="KeyD" label="YAW R" icon={ArrowRight} color="#3b82f6" activeColor="#60a5fa" size={20} />
        </div>
        <div className="tc-dpad-row">
          <HoldBtn keyCode="KeyS" label="DESCEND"  icon={ArrowDown}  color="#ef4444" activeColor="#f87171" size={20} />
        </div>
      </div>
    </div>

    {/* RIGHT cluster: Pitch (↑/↓) + Roll (←/→) */}
    <div className="tc-heli-cluster tc-heli-right">
      <span className="tc-cluster-title">PITCH · ROLL</span>
      <div className="tc-dpad">
        <div className="tc-dpad-row">
          <HoldBtn keyCode="ArrowUp"    label="FWD"   icon={ArrowUp}    color="#f59e0b" activeColor="#fcd34d" size={20} />
        </div>
        <div className="tc-dpad-row">
          <HoldBtn keyCode="ArrowLeft"  label="ROLL L" icon={ArrowLeft}  color="#a855f7" activeColor="#c084fc" size={20} />
          <div className="tc-dpad-center">
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>DIR</span>
          </div>
          <HoldBtn keyCode="ArrowRight" label="ROLL R" icon={ArrowRight} color="#a855f7" activeColor="#c084fc" size={20} />
        </div>
        <div className="tc-dpad-row">
          <HoldBtn keyCode="ArrowDown"  label="BACK"  icon={ArrowDown}  color="#f59e0b" activeColor="#fcd34d" size={20} />
        </div>
      </div>
    </div>

    {/* BOTTOM STRIP: secondary controls */}
    <div className="tc-plane-strip" style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)" }}>
      <HoldBtn keyCode="Space"     label="STAB"  icon={Gauge}         color="#06b6d4" activeColor="#22d3ee" size={18} />
      <HoldBtn keyCode="ShiftLeft" label="BOOST" icon={ChevronUp}     color="#f59e0b" activeColor="#fcd34d" size={18} />
      <TapBtn  keyCode="KeyG"      label="GEAR"  icon={ParkingCircle} color="#22c55e" size={18} />
      <TapBtn  keyCode="KeyC"      label="CAM"   icon={Camera}        color="#6366f1" size={18} />
    </div>

  </div>
);

/* ─────────────────────────────────────────
   PLANE TOUCH LAYOUT
   LEFT cluster: Throttle W/S + Rudder A/D
   RIGHT cluster: Pitch ↑↓ + Roll ←→
   Bottom strip: Flaps F/G | Gear L | Brake B | Cam C | Reset R
──────────────────────────────────────────*/
const PlaneControls = () => (
  <div className="tc-root tc-plane">
    <div className="tc-plane-inner">
      {/* Cluster row */}
      <div className="tc-plane-clusters">
        {/* LEFT: Throttle + Rudder (yaw) */}
        <div className="tc-heli-cluster tc-heli-left">
          <span className="tc-cluster-title">THROTTLE · RUDDER</span>
          <div className="tc-dpad">
            <div className="tc-dpad-row">
              <HoldBtn keyCode="KeyW" label="THR ▲" icon={ArrowUp}    color="#22c55e" activeColor="#4ade80" size={20} />
            </div>
            <div className="tc-dpad-row">
              <HoldBtn keyCode="KeyA" label="RUD L" icon={ArrowLeft}  color="#3b82f6" activeColor="#60a5fa" size={20} />
              <div className="tc-dpad-center">
                <span style={{ fontSize: 22 }}>✈️</span>
              </div>
              <HoldBtn keyCode="KeyD" label="RUD R" icon={ArrowRight} color="#3b82f6" activeColor="#60a5fa" size={20} />
            </div>
            <div className="tc-dpad-row">
              <HoldBtn keyCode="KeyS" label="THR ▼" icon={ArrowDown}  color="#ef4444" activeColor="#f87171" size={20} />
            </div>
          </div>
        </div>

        {/* RIGHT: Pitch + Roll */}
        <div className="tc-heli-cluster tc-heli-right">
          <span className="tc-cluster-title">PITCH · ROLL</span>
          <div className="tc-dpad">
            <div className="tc-dpad-row">
              <HoldBtn keyCode="ArrowUp"    label="NOSE ▲" icon={ArrowUp}    color="#f59e0b" activeColor="#fcd34d" size={20} />
            </div>
            <div className="tc-dpad-row">
              <HoldBtn keyCode="ArrowLeft"  label="ROLL L" icon={ArrowLeft}  color="#a855f7" activeColor="#c084fc" size={20} />
              <div className="tc-dpad-center">
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>ATT</span>
              </div>
              <HoldBtn keyCode="ArrowRight" label="ROLL R" icon={ArrowRight} color="#a855f7" activeColor="#c084fc" size={20} />
            </div>
            <div className="tc-dpad-row">
              <HoldBtn keyCode="ArrowDown"  label="NOSE ▼" icon={ArrowDown}  color="#f59e0b" activeColor="#fcd34d" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP: secondary controls */}
      <div className="tc-plane-strip">
        <TapBtn keyCode="KeyF" label="FLAP ▲" icon={Layers}        color="#f59e0b" size={18} />
        <TapBtn keyCode="KeyG" label="FLAP ▼" icon={Layers}        color="#78716c" size={18} />
        <TapBtn keyCode="KeyL" label="GEAR"   icon={ParkingCircle} color="#22c55e" size={18} />
        <HoldBtn keyCode="KeyB" label="BRAKE" icon={Gauge}         color="#dc2626" activeColor="#f87171" size={18} />
        <TapBtn keyCode="KeyC" label="CAM"    icon={Camera}    color="#6366f1" size={18} />

      </div>
    </div>
  </div>
);


/* ─────────────────────────────────────────
   ROOT EXPORT
──────────────────────────────────────────*/
const TouchControls = ({ vehicleType = "car", gear = 0 }) => {
  if (typeof window !== "undefined" && !("ontouchstart" in window) && !navigator.maxTouchPoints) {
    return null;
  }

  if (vehicleType === "helicopter") return <HeliControls />;
  if (vehicleType === "plane")      return <PlaneControls />;
  return <CarControls gear={gear} />;
};

export default TouchControls;