import { useState } from "react";
import { LESSONS, FREE_DRIVE_TRACKS, TIME_OF_DAY } from "../gameConfig";
import { Lock, BookOpen, Flag, CircleDashed, CircleDot, CheckCircle2, Trophy, Compass, Play, ChevronLeft, Car } from 'lucide-react';

const MenuScreen = ({
  onStartLesson,
  onFreeDrive,
  completedLessons,
  difficulty,
  onDifficultyChange,
}) => {
  const [menuStep, setMenuStep] = useState("splash"); // splash, mode_selection, missions, free_roam
  const [selectedTod, setSelectedTod] = useState("day");

  const isUnlocked = (idx) => true;

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

  return (
    <div className={`menu-root ${menuStep === 'splash' ? 'menu-root--splash' : ''}`}>
      <div className="menu-bg-grid" />
      <div className="menu-bg-glow" />

      <div className="menu-inner">
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
                LESSONS.map((lesson, idx) => {
                  const unlocked = isUnlocked(idx);
                  const stars = completedLessons[lesson.id];
                  const done = stars !== undefined;
                  return (
                    <button
                      key={lesson.id}
                      className={`level-card ${!unlocked ? "level-card--locked" : ""}`}
                      onClick={() => unlocked && onStartLesson(lesson.id, difficulty, selectedTod)}
                      disabled={!unlocked}
                    >
                      <div className="level-card-num">{String(idx + 1).padStart(2, "0")}</div>
                      <div className="level-card-icon">{unlocked ? <lesson.icon size={32} /> : <Lock size={32} opacity={0.5} />}</div>
                      <div className="level-card-info">
                        <h3 className="level-card-name">{lesson.title}</h3>
                        <p className="level-card-desc">{lesson.description}</p>
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
            {[["I", "Ignition"], ["W/S", "Drive/Brake"], ["E/Q", "Gear ▲/▼"], ["CTRL", "Clutch"], ["SPACE", "Handbrake"], ["H", "Headlights"], ["F", "Horn"], ["R", "Reset"], ["C", "Camera"], ["ESC", "Menu"]].map(([k, l]) => (
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
