import { useEffect, useState } from "react";
import simStore from "../simStore";
import { GEAR_NAMES, ENGINE_CONFIG, LESSONS } from "../gameConfig";
import TouchControls from "./TouchControls";

const Gauge = ({ value, max, color, label, unit, redline }) => {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const arc = 0.75;
  const pct = Math.max(0, Math.min(1, value / max));
  const filled = pct * circ * arc;
  const isRed = redline && value >= redline;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 110 110" width="120" height="120">
        <circle
          cx="55" cy="55" r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"
          strokeDasharray={`${circ * arc} ${circ}`} strokeLinecap="round"
          transform="rotate(135 55 55)"
        />
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
    off: { col: "#6b7280", label: "OFF" },
    cranking: { col: "#fbbf24", label: "CRANK…" },
    on: { col: "#22c55e", label: "ON" },
    stalled: { col: "#ef4444", label: "STALLED" },
  };
  const { col, label } = map[state] || map.off;
  return (
    <div className="eng-light" style={{ "--eng-col": col }}>
      <span className="eng-dot" />
      <span className="eng-label">{label}</span>
    </div>
  );
};

const isTouchDevice = () =>
  typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const SimHUD = ({ lessonId, mode }) => {
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

  const lesson = lessonId ? LESSONS.find((l) => l.id === lessonId) : null;
  const gearName = GEAR_NAMES[tel.gear] ?? "N";
  const touch = isTouchDevice();

  return (
    <>
      <div className="simhud-root">
        {lightAlert.show && (
          <div className="simhud-toast">
            {lightAlert.mode === "ON" ? "💡 HEADLIGHTS ON" : "🔦 HEADLIGHTS OFF"}
          </div>
        )}

        <div className="simhud-badge">
          {mode === "lesson" && lesson ? (
            <>
              <span className="simhud-lv">L{LESSONS.indexOf(lesson) + 1}</span>
              <span className="simhud-name">{lesson.title}</span>
            </>
          ) : (
            <span className="simhud-name">Stunt Track</span>
          )}
        </div>

        {lesson && (
          <div className="simhud-objective">
            🎯 {lesson.objective}
          </div>
        )}

        <div className="simhud-topright">
          {!touch && (
            <div className="simhud-esc">
              <kbd className="hud-key">ESC</kbd> Menu
            </div>
          )}
        </div>

        {!touch && (
          <div className="simhud-panel">
            <Gauge
              value={tel.rpm / 20}
              max={ENGINE_CONFIG.maxRpm / 20}
              color="#6366f1"
              label="RPM"
              unit=""
              redline={ENGINE_CONFIG.redlineRpm / 20}
            />

            <div className="gear-display">
              <div className="gear-digit">{gearName}</div>
              <div className="gear-label">GEAR</div>
              <EngineLight state={tel.engineState} />
              <ShiftIndicator rpm={tel.rpm} />
            </div>

            <Gauge
              value={tel.speed}
              max={200}
              color="#22d3ee"
              label="SPEED"
              unit="km/h"
            />
          </div>
        )}

        {!touch && (
          <div className="simhud-keys">
            <div className="key-row"><kbd className="hud-key">I</kbd><span>Ignition</span></div>
            <div className="key-row"><kbd className="hud-key">W/S</kbd><span>Throttle/Brake</span></div>
            <div className="key-row"><kbd className="hud-key">E/Q</kbd><span>Gear ▲/▼</span></div>
            <div className="key-row"><kbd className="hud-key">C</kbd><span>Clutch</span></div>
            <div className="key-row"><kbd className="hud-key">SPACE</kbd><span>Handbrake</span></div>
            <div className="key-row"><kbd className="hud-key">H</kbd><span>Headlights</span></div>
            <div className="key-row"><kbd className="hud-key">F</kbd><span>Horn</span></div>
            <div className="key-row"><kbd className="hud-key">V</kbd><span>Camera</span></div>
          </div>
        )}
      </div>

      {touch && (
        <TouchControls gear={tel.gear} headlightsOn={tel.headlightsOn} />
      )}
    </>
  );
};

export default SimHUD;
