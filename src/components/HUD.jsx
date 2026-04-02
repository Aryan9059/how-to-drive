import { LEVELS } from "../gameConfig";

const LEVEL_NUMS = { level1: "01", level2: "02", level3: "03" };

const HUD = ({ levelId, onBack }) => {
  const level = LEVELS[levelId];

  return (
    <div className="hud-root">
      {/* Top-left: level info */}
      <div className="hud-level-badge">
        <span className="hud-lv-num">LV {LEVEL_NUMS[levelId]}</span>
        <span className="hud-lv-name">{level.name}</span>
        <span className="hud-lv-diff" style={{ color: level.difficultyColor }}>
          ● {level.difficulty}
        </span>
      </div>

      {/* Top-right: ESC hint */}
      <div className="hud-esc-hint">
        <kbd className="hud-key">ESC</kbd>
        <span>Back to Menu</span>
      </div>

      {/* Bottom-left: controls */}
      <div className="hud-controls">
        <div className="hud-ctrl-row">
          <kbd className="hud-key">W</kbd>
          <kbd className="hud-key">A</kbd>
          <kbd className="hud-key">S</kbd>
          <kbd className="hud-key">D</kbd>
          <span className="hud-ctrl-label">Drive</span>
        </div>
        <div className="hud-ctrl-row">
          <kbd className="hud-key">SPACE</kbd>
          <span className="hud-ctrl-label">Brake</span>
          <kbd className="hud-key">SHIFT</kbd>
          <span className="hud-ctrl-label">Boost</span>
        </div>
        <div className="hud-ctrl-row">
          <kbd className="hud-key">R</kbd>
          <span className="hud-ctrl-label">Reset</span>
          <kbd className="hud-key">C</kbd>
          <span className="hud-ctrl-label">Camera</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
