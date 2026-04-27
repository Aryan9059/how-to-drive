import { useState } from "react";
import { LESSONS, FREE_DRIVE_TRACKS, TIME_OF_DAY, PLANE_MISSIONS, HELICOPTER_MISSIONS, VEHICLE_CATEGORIES } from "../gameConfig";
import { Lock, BookOpen, Flag, CircleDashed, CircleDot, CheckCircle2, Trophy, Compass, Play, ChevronLeft, Car, Volume2, VolumeX, Plane, Wind, Navigation, Menu, X } from 'lucide-react';


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
  const [selectedMode, setSelectedMode] = useState("missions");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="mode-card" onClick={() => { setSelectedMode("missions"); setMenuStep("vehicle_selection"); }}>
          <div className="mode-card-icon"><Trophy size={40} /></div>
          <h3 className="mode-card-title">Missions</h3>
          <p className="mode-card-desc">Complete structured driving lessons and earn stars to unlock new challenges.</p>
        </div>
        <div className="mode-card" onClick={() => { setSelectedMode("free_roam"); setMenuStep("vehicle_selection"); }}>
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

  const renderVehicleSelection = () => (
    <div className="splash-content" style={{ width: '100%' }}>
      <header className="menu-header">
        <h1 className="menu-title vehicle-header-title" style={{ fontSize: '3rem' }}>Select <span className="menu-title-accent">Vehicle</span></h1>
        <p className="menu-subtitle vehicle-header-subtitle">Choose your machine to master.</p>
      </header>

      <div className="mode-grid vehicle-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {VEHICLE_CATEGORIES.map(v => (
          <div key={v.id} className="mode-card" onClick={() => { 
            setSelectedVehicle(v.id); 
            if (selectedMode === "free_roam") {
              const randomTod = TIME_OF_DAY[Math.floor(Math.random() * TIME_OF_DAY.length)].id;
              onFreeDrive(FREE_DRIVE_TRACKS[0].id, "easy", randomTod, v.id);
            } else {
              setMenuStep(selectedMode); 
            }
          }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#111', borderRadius: '32px', marginBottom: '16px', overflow: 'hidden' }}>
              <img src={v.url} alt={v.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 className="mode-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {v.label}
            </h3>
            <p className="mode-card-desc vehicle-desc-mobile" style={{ fontSize: '0.9rem' }}>{v.description}</p>
          </div>
        ))}
      </div>

      <button className="menu-back-btn" onClick={() => setMenuStep("mode_selection")}>
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
          className="tod-btn desktop-only-btn"
          onClick={onToggleMusic}
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}
        >
          {musicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          <span className="tod-lbl">{musicMuted ? "Music Off" : "Music On"}</span>
        </button>

        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 101, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px', color: 'white', display: 'none', alignItems: 'center', justifyContent: 'center' }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-hamburger-menu" style={{ position: 'absolute', top: '70px', right: '20px', zIndex: 100, background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', display: 'none', flexDirection: 'column', gap: '16px', minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            
            <div className="menu-group">
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>AUDIO</label>
              <button
                className="tod-btn"
                onClick={onToggleMusic}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                {musicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <span className="tod-lbl">{musicMuted ? "Music Off" : "Music On"}</span>
              </button>
            </div>

            {menuStep === "missions" && (
              <>
                <div className="menu-group">
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>MODE</label>
                  <select className="mobile-select" value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} style={{ width: '100%' }}>
                    <option value="easy">Easy Mode</option>
                    <option value="manual">Manual Mode</option>
                  </select>
                </div>

                <div className="menu-group">
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>TIME OF DAY</label>
                  <select className="mobile-select" value={selectedTod} onChange={(e) => setSelectedTod(e.target.value)} style={{ width: '100%' }}>
                    {TIME_OF_DAY.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {menuStep === "splash" && renderSplash()}
        {menuStep === "mode_selection" && renderModeSelection()}
        {menuStep === "vehicle_selection" && renderVehicleSelection()}

        {menuStep === "missions" && (
          <div className="splash-content" style={{ width: '100%' }}>
            <header className="menu-header">
              <h1 className="menu-title vehicle-header-title">
                Drive <span className="menu-title-accent">Missions</span>
              </h1>
            </header>

            <div className="diff-toggle desktop-filters">
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

            <div className="tod-row desktop-filters">
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
              {currentMissions.map((mission, idx) => {
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
              })}
            </div>

            <button className="menu-back-btn" onClick={() => setMenuStep("vehicle_selection")}>
              <ChevronLeft size={18} /> Back
            </button>
          </div>
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
