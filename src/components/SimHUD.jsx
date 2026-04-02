import { useEffect, useState } from "react";
import simStore from "../simStore";
import { GEAR_NAMES, ENGINE_CONFIG, LESSONS } from "../gameConfig";

// SVG circular arc gauge
const Gauge = ({ value, max, color, label, unit, redline }) => {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const arc  = 0.75; // 270° sweep
  const pct  = Math.max(0, Math.min(1, value / max));
  const filled = pct * circ * arc;
  const isRed  = redline && value >= redline;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 110 110" width="120" height="120">
        {/* Track */}
        <circle
          cx="55" cy="55" r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"
          strokeDasharray={`${circ * arc} ${circ}`} strokeLinecap="round"
          transform="rotate(135 55 55)"
        />
        {/* Value */}
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={isRed ? "#ef4444" : color}
          strokeWidth="9"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(135 55 55)"
          style={{ transition: "stroke-dasharray 0.08s linear" }}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-val">{Math.round(value)}</span>
        <span className="gauge-unit">{unit}</span>
        <span className="gauge-lbl">{label}</span>
      </div>
    </div>
  );
};

const ShiftIndicator = ({ rpm }) => {
  if (rpm < ENGINE_CONFIG.shiftUpRpm) return null;
  return <div className="shift-indicator">⬆ SHIFT UP</div>;
};

const EngineLight = ({ state }) => {
  const map = {
    off:      { col: "#6b7280", label: "OFF" },
    cranking: { col: "#fbbf24", label: "CRANK…" },
    on:       { col: "#22c55e", label: "ON" },
    stalled:  { col: "#ef4444", label: "STALLED" },
  };
  const { col, label } = map[state] || map.off;
  return (
    <div className="eng-light" style={{ "--eng-col": col }}>
      <span className="eng-dot" />
      <span className="eng-label">{label}</span>
    </div>
  );
};

const SimHUD = ({ lessonId, mode }) => {
  const [tel, setTel] = useState({ ...simStore });

  useEffect(() => {
    const id = setInterval(() => setTel({ ...simStore }), 80);
    return () => clearInterval(id);
  }, []);

  const lesson = lessonId ? LESSONS.find((l) => l.id === lessonId) : null;
  const gearName = GEAR_NAMES[tel.gear] ?? "N";

  return (
    <div className="simhud-root">
      {/* ── Top-left: level badge ── */}
      <div className="simhud-badge">
        {mode === "lesson" && lesson ? (
          <>
            <span className="simhud-lv">L{LESSONS.indexOf(lesson) + 1}</span>
            <span className="simhud-name">{lesson.title}</span>
          </>
        ) : (
          <span className="simhud-name">Free Drive</span>
        )}
      </div>

      {/* ── Top-center: objective ── */}
      {lesson && (
        <div className="simhud-objective">
          🎯 {lesson.objective}
        </div>
      )}

      {/* ── Top-right: ESC hint ── */}
      <div className="simhud-esc">
        <kbd className="hud-key">ESC</kbd> Menu
      </div>

      {/* ── Bottom panel: gauges ── */}
      <div className="simhud-panel">
        {/* RPM gauge */}
        <Gauge
          value={tel.rpm}
          max={ENGINE_CONFIG.maxRpm}
          color="#6366f1"
          label="RPM"
          unit="×1000"
          redline={ENGINE_CONFIG.redlineRpm}
        />

        {/* Gear display */}
        <div className="gear-display">
          <div className="gear-digit">{gearName}</div>
          <div className="gear-label">GEAR</div>
          <EngineLight state={tel.engineState} />
          <ShiftIndicator rpm={tel.rpm} />
        </div>

        {/* Speed gauge */}
        <Gauge
          value={tel.speed}
          max={200}
          color="#22d3ee"
          label="SPEED"
          unit="km/h"
        />
      </div>

      {/* ── Bottom-left: key reference ── */}
      <div className="simhud-keys">
        <div className="key-row"><kbd className="hud-key">I</kbd><span>Ignition</span></div>
        <div className="key-row"><kbd className="hud-key">W/S</kbd><span>Throttle/Brake</span></div>
        <div className="key-row"><kbd className="hud-key">E/Q</kbd><span>Gear ▲/▼</span></div>
        <div className="key-row"><kbd className="hud-key">CTRL</kbd><span>Clutch</span></div>
        <div className="key-row"><kbd className="hud-key">SPACE</kbd><span>Handbrake</span></div>
        <div className="key-row"><kbd className="hud-key">C</kbd><span>Camera</span></div>
      </div>
    </div>
  );
};

export default SimHUD;
