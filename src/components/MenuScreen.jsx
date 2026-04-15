import { useState } from "react";
import { LESSONS, FREE_DRIVE_TRACKS, TIME_OF_DAY, PLANE_MISSIONS, HELICOPTER_MISSIONS, VEHICLE_CATEGORIES } from "../gameConfig";
import { Lock, BookOpen, Flag, CircleDashed, CircleDot, CheckCircle2, Trophy, Compass, Play, ChevronLeft, Car, Volume2, VolumeX, Plane, Wind, Navigation } from 'lucide-react';


const VehicleIcon = ({ id, size = 28 }) => {
  const map = { car: "🚗", plane: "✈️", helicopter: "🚁" };
  return <span style={{ fontSize: size, lineHeight: 1 }}>{map[id] || "🚗"}</span>;
};

const getMissionsForVehicle = (vehicleId) => {
  switch (vehicleId) {
    case "plane": return PLANE_MISSIONS;
    case "helicopter": return HELICOPTER_MISSIONS;
    default: return LESSONS;
  }
};

const MenuScreen = ({
  menuStep,
  setMenuStep,
  onStartLesson,
  onFreeDrive,
  completedLessons,
  difficulty,
  onDifficultyChange,
  musicMuted,
  onToggleMusic,
}) => {
  const [selectedTod, setSelectedTod] = useState("day");
  const [selectedVehicle, setSelectedVehicle] = useState("car");

  const isUnlocked = (idx, vehicleId) => {
    if (idx === 0) return true;
    const missions = getMissionsForVehicle(vehicleId);
    const prevMission = missions[idx - 1];
    return completedLessons[prevMission.id] !== undefined;
  };

  const renderSplash = () => (
    <div className="splash-content">
      <header className="menu-header">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '140px',
            height: '140px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <img src="/logo.svg" alt="HowToDrive Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          </div>
        </div>
        <h1 className="menu-title">HowTo<span className="menu-title-accent">Drive</span></h1>
        <p className="menu-subtitle">The ultimate driving simulator to master the roads with precision and style.</p>
      </header>
      <button className="big-play-btn" onClick={() => setMenuStep("mode_selection")}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Play fill="currentColor" size={24} />
          <span>START TEST</span>
        </div>
      </button>
    </div>
  );

  const renderModeSelection = () => (
    <div className="splash-content" style={{ width: '100%' }}>
      <header className="menu-header">
        <h1 className="menu-title" style={{ fontSize: '3rem' }}>Select <span className="menu-title-accent">Mode</span></h1>
        <p className="menu-subtitle">Choose your path: Structured missions or open world exploration.</p>
      </header>

      <div className="mode-grid">
        <div className="mode-card" onClick={() => setMenuStep("missions")}>
          <div className="mode-card-icon"><Trophy size={40} /></div>
          <h3 className="mode-card-title">Missions</h3>
          <p className="mode-card-desc">Complete structured driving lessons and earn stars to unlock new challenges.</p>
        </div>
        <div className="mode-card" onClick={() => setMenuStep("free_roam")}>
          <div className="mode-card-icon"><Compass size={40} /></div>
          <h3 className="mode-card-title">Free Roam</h3>
          <p className="mode-card-desc">Explore various environments at your own pace without any restrictions.</p>
        </div>
      </div>

      <button className="menu-back-btn" onClick={() => setMenuStep("splash")}>
        <ChevronLeft size={18} /> Back
      </button>
    </div>
  );

  const currentMissions = getMissionsForVehicle(selectedVehicle);
  const vehicleCategory = VEHICLE_CATEGORIES.find(v => v.id === selectedVehicle);


  const getControlsHints = () => {
    switch (selectedVehicle) {
      case "plane":
        return [["W", "Throttle"], ["S", "Throttle ▼"], ["A/D", "Bank L/R"], ["SPACE", "Pitch Up"], ["Shift", "Pitch Down"], ["↑↓", "Pitch"], ["R", "Reset"], ["ESC", "Menu"]];
      case "helicopter":
        return [["W", "Climb"], ["S", "Descend"], ["A/D", "Yaw L/R"], ["↑", "Fly Forward"], ["↓", "Fly Back"], ["←/→", "Strafe"], ["R", "Reset"], ["ESC", "Menu"]];
      default:
        return [["I", "Ignition"], ["W/S", "Drive/Brake"], ["E/Q", "Gear ▲/▼"], ["C", "Clutch"], ["SPACE", "Handbrake"], ["H", "Headlights"], ["F", "Horn"], ["R", "Reset"], ["V", "Camera"], ["ESC", "Menu"]];
    }
  };

  return (
    <div className={`menu-root ${menuStep === 'splash' ? 'menu-root--splash' : ''}`}>
      <div className="menu-bg-grid" />
      <div className="menu-bg-glow" />

      <div className="menu-inner">
        <button 
          className="tod-btn" 
          onClick={onToggleMusic}
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}
        >
          {musicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          <span className="tod-lbl">{musicMuted ? "Music Off" : "Music On"}</span>
        </button>

        {menuStep === "splash" && renderSplash()}
        {menuStep === "mode_selection" && renderModeSelection()}

        {(menuStep === "missions" || menuStep === "free_roam") && (
          <>
            <button className="menu-back-btn" onClick={() => setMenuStep("mode_selection")}>
              <ChevronLeft size={18} /> Back
            </button>

            <header className="menu-header">
              <h1 className="menu-title" style={{ fontSize: '2.5rem' }}>
                {menuStep === "missions" ? <>Drive <span className="menu-title-accent">Missions</span></> : <>Free <span className="menu-title-accent">Roam</span></>}
              </h1>
            </header>

            {}
            {menuStep === "missions" && (
              <div className="vehicle-tabs">
                {VEHICLE_CATEGORIES.map((v) => (
                  <button
                    key={v.id}
                    className={`vehicle-tab ${selectedVehicle === v.id ? "vehicle-tab--active" : ""}`}
                    style={{ "--vtab-color": v.color }}
                    onClick={() => setSelectedVehicle(v.id)}
                  >
                    <span className="vehicle-tab-emoji">{v.emoji}</span>
                    <span className="vehicle-tab-label">{v.label}</span>
                  </button>
                ))}
              </div>
            )}

            {}
            {menuStep === "missions" && vehicleCategory && (
              <p className="vehicle-desc">{vehicleCategory.description}</p>
            )}

            <div className="diff-toggle">
              <span className="diff-label">Mode:</span>
              {["easy", "manual"].map((d) => (
                <button
                  key={d}
                  className={`diff-btn ${difficulty === d ? "diff-btn--active" : ""}`}
                  onClick={() => onDifficultyChange(d)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {d === "easy" ? <><CircleDashed size={14} /> Easy</> : <><CircleDot size={14} /> Manual</>}
                  </div>
                </button>
              ))}
            </div>

            <div className="tod-row">
              {TIME_OF_DAY.map((t) => (
                <button
                  key={t.id}
                  className={`tod-btn ${selectedTod === t.id ? "tod-btn--active" : ""}`}
                  onClick={() => setSelectedTod(t.id)}
                >
                  <span className="tod-icon"><t.icon size={20} /></span>
                  <span className="tod-lbl">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="level-grid">
              {menuStep === "missions" ? (
                currentMissions.map((mission, idx) => {
                  const unlocked = isUnlocked(idx, selectedVehicle);
                  const stars = completedLessons[mission.id];
                  const done = stars !== undefined;
                  return (
                    <button
                      key={mission.id}
                      className={`level-card ${!unlocked ? "level-card--locked" : ""}`}
                      onClick={() => unlocked && onStartLesson(mission.id, difficulty, selectedTod, selectedVehicle)}
                      disabled={!unlocked}
                    >
                      <div className="level-card-num">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="level-card-icon">{unlocked ? <mission.icon size={32} /> : <Lock size={32} opacity={0.5} />}</div>
                      <div className="level-card-info">
                        <h3 className="level-card-name">{mission.title}</h3>
                        <p className="level-card-desc">{mission.description}</p>
                      </div>
                      {done && (
                        <span className="done-badge">
                          {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                        </span>
                      )}
                      {!unlocked && <span className="lock-badge">Locked</span>}
                      <div className="level-card-check"><CheckCircle2 size={16} /></div>
                    </button>
                  );
                })
              ) : (
                FREE_DRIVE_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    className="level-card"
                    onClick={() => onFreeDrive(t.id, difficulty, selectedTod)}
                  >
                    <div className="level-card-icon"><t.icon size={36} /></div>
                    <div className="level-card-info">
                      <h3 className="level-card-name">{t.name}</h3>
                      <p className="level-card-desc">{t.desc || ""}</p>
                    </div>
                    <div className="level-card-check"><CheckCircle2 size={16} /></div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {menuStep !== "splash" && (
          <footer className="menu-controls">
            {getControlsHints().map(([k, l]) => (
              <div key={k} className="ctrl-item">
                <kbd className="ctrl-key">{k}</kbd>
                <span className="ctrl-label">{l}</span>
              </div>
            ))}
          </footer>
        )}
      </div>
    </div>
  );
};

export default MenuScreen;
