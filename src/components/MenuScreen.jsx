import { useState } from "react";
import { LESSONS, FREE_DRIVE_TRACKS, TIME_OF_DAY } from "../gameConfig";

const MenuScreen = ({
  onStartLesson,   // (lessonId, difficulty) => void
  onFreeDrive,     // (trackId, difficulty, timeOfDay) => void
  completedLessons, // Set<string>
  difficulty,
  onDifficultyChange,
}) => {
  const [tab,            setTab]            = useState("lessons"); // "lessons" | "freeDrive"
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedTrack,  setSelectedTrack]  = useState("track1");
  const [selectedTod,    setSelectedTod]    = useState("day");

  const isUnlocked = (idx) => true;

  return (
    <div className="menu-root">
      <div className="menu-bg-grid" />
      <div className="menu-bg-glow" />

      <div className="menu-inner">
        {/* Title */}
        <header className="menu-header">
          <p className="menu-eyebrow">● DRIVING SIMULATOR</p>
          <h1 className="menu-title">CAPY<span className="menu-title-accent">DRIVE</span></h1>
          <p className="menu-subtitle">Learn to drive — step by step</p>
        </header>

        {/* Difficulty toggle */}
        <div className="diff-toggle">
          <span className="diff-label">Mode:</span>
          {["easy", "manual"].map((d) => (
            <button
              key={d}
              className={`diff-btn ${difficulty === d ? "diff-btn--active" : ""}`}
              onClick={() => onDifficultyChange(d)}
            >
              {d === "easy" ? "🟢 Easy (auto-clutch)" : "🔴 Manual (clutch)"}
            </button>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="menu-tabs">
          <button className={`menu-tab ${tab === "lessons"   ? "menu-tab--active" : ""}`} onClick={() => setTab("lessons")}>📚 Lessons</button>
          <button className={`menu-tab ${tab === "freeDrive" ? "menu-tab--active" : ""}`} onClick={() => setTab("freeDrive")}>🏁 Free Drive</button>
        </div>

        {/* ── Lessons tab ── */}
        {tab === "lessons" && (
          <>
            <div className="level-grid">
              {LESSONS.map((lesson, idx) => {
                const unlocked = isUnlocked(idx);
                const done = completedLessons.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    className={`level-card ${selectedLesson === lesson.id ? "level-card--active" : ""} ${!unlocked ? "level-card--locked" : ""}`}
                    onClick={() => unlocked && setSelectedLesson(lesson.id)}
                    disabled={!unlocked}
                  >
                    <div className="level-card-num">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="level-card-icon">{unlocked ? lesson.icon : "🔒"}</div>
                    <div className="level-card-info">
                      <h3 className="level-card-name">{lesson.title}</h3>
                      <p className="level-card-desc">{lesson.description}</p>
                    </div>
                    {done     && <span className="done-badge">✓ Done</span>}
                    {!unlocked && <span className="lock-badge">Locked</span>}
                    <div className="level-card-check">✓</div>
                  </button>
                );
              })}
            </div>
            <button
              className={`play-btn ${!selectedLesson ? "play-btn--disabled" : ""}`}
              disabled={!selectedLesson}
              onClick={() => selectedLesson && onStartLesson(selectedLesson, difficulty)}
            >
              <span className="play-btn-text">START LESSON</span>
              <span className="play-btn-arrow">▶</span>
            </button>
          </>
        )}

        {/* ── Free Drive tab ── */}
        {tab === "freeDrive" && (
          <>
            {/* Time of Day selector */}
            <div className="tod-row">
              <span className="tod-label">Time of Day:</span>
              <div className="tod-btns">
                {TIME_OF_DAY.map((t) => (
                  <button
                    key={t.id}
                    className={`tod-btn ${selectedTod === t.id ? "tod-btn--active" : ""}`}
                    onClick={() => setSelectedTod(t.id)}
                  >
                    <span className="tod-icon">{t.icon}</span>
                    <span className="tod-lbl">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="level-grid">
              {FREE_DRIVE_TRACKS.map((t) => (
                <button
                  key={t.id}
                  className={`level-card ${selectedTrack === t.id ? "level-card--active" : ""}`}
                  onClick={() => setSelectedTrack(t.id)}
                >
                  <div className="level-card-icon" style={{ fontSize: "2.5rem" }}>{t.icon}</div>
                  <div className="level-card-info">
                    <h3 className="level-card-name">{t.name}</h3>
                    <p className="level-card-desc">{t.desc || ""}</p>
                  </div>
                  <div className="level-card-check">✓</div>
                </button>
              ))}
            </div>
            <button
              className="play-btn"
              onClick={() => onFreeDrive(selectedTrack, difficulty, selectedTod)}
            >
              <span className="play-btn-text">FREE DRIVE</span>
              <span className="play-btn-arrow">▶</span>
            </button>
          </>
        )}

        {/* Controls */}
        <footer className="menu-controls">
          {[["I","Ignition"],["W/S","Drive/Brake"],["E/Q","Gear ▲/▼"],["CTRL","Clutch"],["SPACE","Handbrake"],["H","Headlights"],["F","Horn"],["R","Reset"],["C","Camera"],["ESC","Menu"]].map(([k,l])=>(
            <div key={k} className="ctrl-item">
              <kbd className="ctrl-key">{k}</kbd>
              <span className="ctrl-label">{l}</span>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
};

export default MenuScreen;
