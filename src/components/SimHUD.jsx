import { useEffect, useState, useRef } from "react";
import simStore from "../simStore";
import { GEAR_NAMES, ENGINE_CONFIG, LESSONS, PLANE_MISSIONS, HELICOPTER_MISSIONS } from "../gameConfig";
import TouchControls from "./TouchControls";

const allMissions = [...LESSONS, ...PLANE_MISSIONS, ...HELICOPTER_MISSIONS];
const isTouchDevice = () =>
  typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/* ── Shared gauge (car / helicopter) ─────────────────────── */
const Gauge = ({ value, max, color, label, unit, redline }) => {
  const r = 48, circ = 2 * Math.PI * r, arc = 0.75;
  const pct = Math.max(0, Math.min(1, value / max));
  const filled = pct * circ * arc;
  const isRed = redline && value >= redline;
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 110 110" width="120" height="120">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"
          strokeDasharray={`${circ * arc} ${circ}`} strokeLinecap="round" transform="rotate(135 55 55)" />
        <circle cx="55" cy="55" r={r} fill="none"
          stroke={isRed ? "#ef4444" : color} strokeWidth="9"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          transform="rotate(135 55 55)"
          style={{ transition: "stroke-dasharray 0.08s linear" }} />
      </svg>
      <div className="gauge-center">
        <span className="gauge-val">{Math.round(value)}</span>
        <span className="gauge-unit">{unit}</span>
        <span className="gauge-lbl">{label}</span>
      </div>
    </div>
  );
};

const EngineLight = ({ state }) => {
  const map = { off:"#6b7280", cranking:"#fbbf24", on:"#22c55e", stalled:"#ef4444" };
  const labels = { off:"OFF", cranking:"CRANK…", on:"ON", stalled:"STALLED" };
  const col = map[state] || map.off;
  return (
    <div className="eng-light" style={{ "--eng-col": col }}>
      <span className="eng-dot" /><span className="eng-label">{labels[state] || "OFF"}</span>
    </div>
  );
};

const TrafficViolationAlert = ({ count }) => {
  const [visible, setVisible] = useState(false);
  const prevCount = useRef(0);
  useEffect(() => {
    if (count > prevCount.current) {
      prevCount.current = count; setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [count]);
  if (!visible) return null;
  return (
    <div style={{ position:"absolute", top:"80px", left:"50%", transform:"translateX(-50%)",
      background:"rgba(220,38,38,0.92)", backdropFilter:"blur(12px)", border:"2px solid #ff4444",
      borderRadius:"12px", padding:"10px 20px", display:"flex", alignItems:"center", gap:"10px",
      fontSize:"0.9rem", fontWeight:"700", color:"#fff", letterSpacing:"0.05em",
      zIndex:70, boxShadow:"0 4px 24px rgba(220,38,38,0.4)", whiteSpace:"nowrap" }}>
      <span style={{ fontSize:"1.3rem" }}>🚦</span> RED LIGHT VIOLATION! +Penalty
      <span style={{ background:"rgba(255,255,255,0.2)", borderRadius:"8px", padding:"2px 8px", fontSize:"0.8rem" }}>
        {count} total
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PLANE HUD COMPONENTS
══════════════════════════════════════════════════════════════ */

/* Attitude Direction Indicator (artificial horizon) */
const ADI = ({ pitch, roll }) => {
  const clampedPitch = Math.max(-40, Math.min(40, pitch || 0));
  const rollDeg = roll || 0;
  const skyH = 80, groundH = 80, totalH = skyH + groundH;
  const pitchPx = (clampedPitch / 40) * (totalH / 2);
  return (
    <div style={{ position:"relative", width:130, height:130, borderRadius:"50%",
      overflow:"hidden", border:"2px solid rgba(255,255,255,0.3)",
      boxShadow:"0 0 18px rgba(0,180,255,0.25)", flexShrink:0 }}>
      {/* rotating horizon */}
      <div style={{ position:"absolute", width:"100%", height:"200%",
        top:`calc(50% - ${pitchPx}px - 100%)`,
        transform:`rotate(${rollDeg}deg)`,
        transformOrigin:"50% 100%", transition:"transform 0.05s linear" }}>
        {/* Sky */}
        <div style={{ height:"50%", background:"linear-gradient(180deg,#0a4b8c,#1a6bbf)" }} />
        {/* Ground */}
        <div style={{ height:"50%", background:"linear-gradient(180deg,#6b3a1f,#8b5a2b)" }} />
      </div>
      {/* Horizon line */}
      <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2,
        background:"rgba(255,255,255,0.85)", transform:"translateY(-50%)" }} />
      {/* Aircraft reference */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 130 130">
        <line x1="30" y1="65" x2="52" y2="65" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="78" y1="65" x2="100" y2="65" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="65" cy="65" r="3" fill="#f59e0b" />
        <line x1="65" y1="58" x2="65" y2="62" stroke="#f59e0b" strokeWidth="2" />
      </svg>
      {/* Roll indicator arc */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} viewBox="0 0 130 130">
        <path d="M 35 25 A 45 45 0 0 1 95 25" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <line x1="65" y1="20" x2="65" y2="28"
          style={{ transformOrigin:"65px 65px", transform:`rotate(${rollDeg}deg)` }}
          stroke="#f59e0b" strokeWidth="2" />
      </svg>
      <div style={{ position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)",
        fontSize:"9px", color:"rgba(255,255,255,0.6)", fontFamily:"monospace", letterSpacing:1 }}>ADI</div>
    </div>
  );
};

/* Vertical tape gauge (airspeed / altitude) */
const TapeGauge = ({ value, min, max, label, unit, color = "#00e5ff", width = 56, ticks = 10 }) => {
  const range = max - min;
  const pct = Math.max(0, Math.min(1, (value - min) / range));
  const centerY = 100;
  const span = 160;
  const tickSpacing = range / ticks;

  const tickLines = [];
  for (let i = 0; i <= ticks; i++) {
    const v = min + i * tickSpacing;
    const y = centerY + (1 - (v - min) / range) * span - span / 2;
    const offset = (pct - (v - min) / range) * span;
    tickLines.push({ v, y: centerY - offset + (range / 2 / range) * span - span / 2 });
  }

  const visibleTicks = [];
  const pctVal = pct;
  for (let i = 0; i <= ticks; i++) {
    const v = min + i * tickSpacing;
    const yOff = (pctVal - (v - min) / range) * span;
    const y = centerY - yOff;
    if (y > 20 && y < 180) visibleTicks.push({ v: Math.round(v), y });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <span style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1, fontFamily:"monospace" }}>{label}</span>
      <div style={{ position:"relative", width, height:200,
        background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,255,255,0.15)",
        borderRadius:6, overflow:"hidden" }}>
        {visibleTicks.map(({ v, y }) => (
          <div key={v} style={{ position:"absolute", left:0, right:0, top:y, display:"flex", alignItems:"center" }}>
            <div style={{ width:12, height:1, background:"rgba(255,255,255,0.35)" }} />
            <span style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontFamily:"monospace", marginLeft:2 }}>{v}</span>
          </div>
        ))}
        {/* Current value box */}
        <div style={{ position:"absolute", left:0, right:0, top:"50%", transform:"translateY(-50%)",
          background:"rgba(0,0,0,0.8)", borderTop:`1px solid ${color}`, borderBottom:`1px solid ${color}`,
          display:"flex", alignItems:"center", justifyContent:"center", height:22 }}>
          <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace" }}>
            {Math.round(value)}
          </span>
        </div>
      </div>
      <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:1, fontFamily:"monospace" }}>{unit}</span>
    </div>
  );
};

/* Heading tape */
const HeadingTape = ({ heading }) => {
  const hdg = ((heading || 0) % 360 + 360) % 360;
  const cardinals = { 0:"N", 45:"NE", 90:"E", 135:"SE", 180:"S", 225:"SW", 270:"W", 315:"NW" };
  const width = 260;
  const pxPerDeg = 2.2;
  const ticks = [];
  for (let d = -45; d <= 45; d += 5) {
    const val = ((hdg + d) % 360 + 360) % 360;
    const x = width / 2 + d * pxPerDeg;
    ticks.push({ val: Math.round(val), x, major: val % 10 === 0 });
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <div style={{ position:"relative", width, height:42,
        background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, overflow:"hidden" }}>
        {ticks.map(({ val, x, major }) => (
          <div key={`${val}-${x}`} style={{ position:"absolute", left:x, top:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ width:1, height: major ? 10 : 6, background: major ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", marginTop:2 }} />
            {major && (
              <span style={{ fontSize: cardinals[val] ? 10 : 8, color: cardinals[val] ? "#f59e0b" : "rgba(255,255,255,0.6)", fontFamily:"monospace", marginTop:1 }}>
                {cardinals[val] || val}
              </span>
            )}
          </div>
        ))}
        {/* Centre marker */}
        <div style={{ position:"absolute", left:"50%", bottom:0, transform:"translateX(-50%)",
          width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderBottom:"8px solid #f59e0b" }} />
      </div>
      <span style={{ fontSize:9, color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>HDG {Math.round(hdg).toString().padStart(3,"0")}°</span>
    </div>
  );
};

/* VSI — vertical speed indicator */
const VSI = ({ vsi }) => {
  const clamped = Math.max(-15, Math.min(15, vsi || 0));
  const pct = (clamped + 15) / 30;
  const color = clamped > 0.3 ? "#22c55e" : clamped < -0.3 ? "#ef4444" : "#94a3b8";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <span style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1, fontFamily:"monospace" }}>VSI</span>
      <div style={{ position:"relative", width:18, height:100,
        background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:4 }}>
        {/* Zero line */}
        <div style={{ position:"absolute", left:0, right:0, top:"50%", height:1, background:"rgba(255,255,255,0.4)" }} />
        {/* Bar */}
        <div style={{ position:"absolute", left:2, right:2, borderRadius:3, background:color, transition:"all 0.1s",
          ...(clamped >= 0
            ? { bottom:"50%", height:`${pct * 50}%` }
            : { top:"50%", height:`${(1 - pct) * 50}%` })
        }} />
      </div>
      <span style={{ fontSize:9, fontWeight:700, color, fontFamily:"monospace" }}>
        {clamped > 0 ? "+" : ""}{Math.round(clamped)}
      </span>
      <span style={{ fontSize:7, color:"rgba(255,255,255,0.35)", fontFamily:"monospace" }}>m/s</span>
    </div>
  );
};

/* Annunciator panel (flaps / gear / brake) */
const Annunciators = ({ flaps, gearDown, brakeActive }) => {
  const flapAngles = [0, 10, 20, 30, 40];
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      {/* Flap indicator */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, padding:"6px 10px" }}>
        <span style={{ fontSize:8, color:"rgba(255,255,255,0.45)", letterSpacing:1, fontFamily:"monospace" }}>FLAPS</span>
        <span style={{ fontSize:18, fontWeight:800, color: flaps > 0 ? "#f59e0b" : "#22c55e", fontFamily:"monospace" }}>
          {flapAngles[flaps] ?? 0}°
        </span>
        <div style={{ display:"flex", gap:3 }}>
          {[0,1,2,3,4].map(n => (
            <div key={n} style={{ width:6, height:6, borderRadius:1,
              background: n <= flaps ? "#f59e0b" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>F▲ G▼</span>
      </div>

      {/* Gear indicator */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
        background:"rgba(0,0,0,0.55)", border:`1px solid ${gearDown ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`,
        borderRadius:6, padding:"6px 10px" }}>
        <span style={{ fontSize:8, color:"rgba(255,255,255,0.45)", letterSpacing:1, fontFamily:"monospace" }}>GEAR</span>
        <span style={{ fontSize:20 }}>{gearDown ? "🟢" : "🔴"}</span>
        <span style={{ fontSize:9, fontWeight:700, color: gearDown ? "#22c55e" : "#ef4444", fontFamily:"monospace" }}>
          {gearDown ? "DN" : "UP"}
        </span>
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>L</span>
      </div>

      {/* Brake */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
        background:"rgba(0,0,0,0.55)", border:`1px solid ${brakeActive ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
        borderRadius:6, padding:"6px 10px",
        boxShadow: brakeActive ? "0 0 12px rgba(239,68,68,0.4)" : "none" }}>
        <span style={{ fontSize:8, color:"rgba(255,255,255,0.45)", letterSpacing:1, fontFamily:"monospace" }}>BRAKE</span>
        <span style={{ fontSize:18, fontWeight:800, color: brakeActive ? "#ef4444" : "rgba(255,255,255,0.2)", fontFamily:"monospace" }}>
          {brakeActive ? "ON" : "OFF"}
        </span>
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>B</span>
      </div>
    </div>
  );
};

/* Throttle bar */
const ThrottleBar = ({ throttle }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
    <span style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1, fontFamily:"monospace" }}>THR</span>
    <div style={{ position:"relative", width:14, height:90,
      background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:4 }}>
      <div style={{ position:"absolute", bottom:2, left:2, right:2, borderRadius:3, transition:"height 0.08s linear",
        height:`${Math.max(0, Math.min(1, throttle)) * 86}px`,
        background:"linear-gradient(180deg,#22d3ee,#0e7490)" }} />
    </div>
    <span style={{ fontSize:9, fontWeight:700, color:"#22d3ee", fontFamily:"monospace" }}>
      {Math.round((throttle || 0) * 100)}%
    </span>
  </div>
);

/* Plane-specific HUD panel */
const PlaneHUD = ({ tel }) => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, pointerEvents:"none",
    display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"0 20px 16px",
    zIndex: 50, fontFamily:"'Poppins', sans-serif" }}>

    {/* Heading tape */}
    <HeadingTape heading={tel.planeHeading} />

    {/* Middle row: speed tape | ADI | altitude tape */}
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <TapeGauge value={tel.speed || 0} min={0} max={600} label="AIRSPEED" unit="km/h" color="#22d3ee" width={58} />
      <ThrottleBar throttle={tel.throttle || 0} />
      <ADI pitch={tel.planePitch || 0} roll={tel.planeRoll || 0} />
      <VSI vsi={tel.verticalSpeed || 0} />
      <TapeGauge value={tel.altitude || 0} min={0} max={3000} label="ALTITUDE" unit="m" color="#a3e635" width={58} />
    </div>

    {/* Bottom row: annunciators */}
    <Annunciators flaps={tel.flaps ?? 0} gearDown={tel.gearDown ?? true} brakeActive={tel.brakeActive ?? false} />
  </div>
);

/* ── Key hints ─────────────────────────────────────────────── */
const PLANE_KEYS = [
  ["W / S",   "Throttle ▲ / ▼"],
  ["↑ / ↓",   "Pitch up / down"],
  ["← / →",   "Roll left / right"],
  ["A / D",   "Rudder / Yaw"],
  ["F / G",   "Flaps ▲ / ▼"],
  ["L",       "Landing Gear"],
  ["B",       "Brake"],
  ["C",       "Cycle Camera"],
  ["R",       "Reset"],
];
const HELI_KEYS = [["W","CLIMB ▲"],["S","DESCEND ▼"],["A/D","Yaw L/R"],["↑↓","Fwd/Back"],["←→","Strafe"],["R","Reset"]];
const CAR_KEYS  = [["I","Ignition"],["W/S","Throttle/Brake"],["E/Q","Gear ▲/▼"],["C","Clutch"],["SPACE","Handbrake"],["H","Headlights"],["V","Camera"]];

const KeyHints = ({ vehicleType }) => {
  const hints = vehicleType === "plane" ? PLANE_KEYS : vehicleType === "helicopter" ? HELI_KEYS : CAR_KEYS;
  return (
    <div className="simhud-keys">
      {hints.map(([k, l]) => (
        <div key={k} className="key-row">
          <kbd className="hud-key">{k}</kbd><span>{l}</span>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN SimHUD
══════════════════════════════════════════════════════════════ */
const SimHUD = ({ lessonId, mode, vehicleType = "car" }) => {
  const [tel, setTel] = useState({ ...simStore });
  useEffect(() => {
    const id = setInterval(() => setTel({ ...simStore }), 80);
    return () => clearInterval(id);
  }, []);

  const [lightAlert, setLightAlert] = useState({ show: false, mode: "OFF" });
  const [prevLights, setPrevLights] = useState(tel.headlightsOn);
  useEffect(() => {
    if (tel.headlightsOn !== prevLights) {
      setPrevLights(tel.headlightsOn);
      setLightAlert({ show: true, mode: tel.headlightsOn ? "ON" : "OFF" });
      const id = setTimeout(() => setLightAlert((s) => ({ ...s, show: false })), 1000);
      return () => clearTimeout(id);
    }
  }, [tel.headlightsOn, prevLights]);

  const lesson    = lessonId ? allMissions.find((l) => l.id === lessonId) : null;
  const gearName  = GEAR_NAMES[tel.gear] ?? "N";
  const touch     = isTouchDevice();
  const violations = tel.trafficViolations || 0;
  const isAerial  = vehicleType === "plane" || vehicleType === "helicopter";

  const trackName = vehicleType === "plane" ? "Airfield" : vehicleType === "helicopter" ? "Heliport" : "Stunt Track";
  const vehicleEmoji = { car:"🚗", plane:"✈️", helicopter:"🚁" }[vehicleType] || "🚗";

  return (
    <>
      <div className="simhud-root">
        {lightAlert.show && (
          <div className="simhud-toast">{lightAlert.mode === "ON" ? "💡 HEADLIGHTS ON" : "🔦 HEADLIGHTS OFF"}</div>
        )}

        <TrafficViolationAlert count={violations} />

        {/* Badge */}
        <div className="simhud-badge">
          <span className="simhud-vehicle-emoji">{vehicleEmoji}</span>
          {mode === "lesson" && lesson ? (
            <>
              <span className="simhud-lv">L{allMissions.indexOf(lesson) + 1}</span>
              <span className="simhud-name">{lesson.title}</span>
            </>
          ) : (
            <span className="simhud-name">{trackName}</span>
          )}
        </div>

        {lesson && <div className="simhud-objective">🎯 {lesson.objective}</div>}

        {isAerial && vehicleType !== "plane" && (
          <div className="simhud-altitude">
            <span className="altitude-icon">▲</span>
            <span className="altitude-val">{Math.max(0, Math.round(tel.altitude || 0))} m</span>
            <span className="altitude-lbl">ALT</span>
          </div>
        )}

        <div className="simhud-topright">
          {!touch && <div className="simhud-esc"><kbd className="hud-key">ESC</kbd> Menu</div>}
        </div>

        {!touch && vehicleType !== "plane" && (
          <div className="simhud-panel">
            {vehicleType === "car" && (
              <>
                <Gauge value={tel.rpm / 20} max={ENGINE_CONFIG.maxRpm / 20} color="#6366f1" label="RPM" unit="" redline={ENGINE_CONFIG.redlineRpm / 20} />
                <div className="gear-display">
                  <div className="gear-digit">{gearName}</div>
                  <div className="gear-label">GEAR</div>
                  <EngineLight state={tel.engineState} />
                </div>
                <Gauge value={tel.speed} max={200} color="#22d3ee" label="SPEED" unit="km/h" />
              </>
            )}
            {vehicleType === "helicopter" && (
              <>
                <Gauge value={(tel.rpm / 8000) * 100} max={100} color="#34d399" label="COLLECTIVE" unit="%" />
                <div className="gear-display">
                  <div className="gear-digit" style={{ fontSize:"1.2rem" }}>🚁</div>
                  <div className="gear-label">MODE</div>
                  <EngineLight state={tel.engineState} />
                </div>
                <Gauge value={tel.speed} max={150} color="#22d3ee" label="SPEED" unit="km/h" />
              </>
            )}
          </div>
        )}

        {!touch && <KeyHints vehicleType={vehicleType} />}
      </div>

      {/* Plane HUD rendered separately at bottom */}
      {!touch && vehicleType === "plane" && <PlaneHUD tel={tel} />}

      {touch && <TouchControls gear={tel.gear} headlightsOn={tel.headlightsOn} />}
    </>
  );
};

export default SimHUD;
