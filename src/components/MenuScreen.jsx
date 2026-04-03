import { useState } from "react";
import { LESSONS, FREE_DRIVE_TRACKS, TIME_OF_DAY } from "../gameConfig";
import { Lock, BookOpen, Flag, CircleDashed, CircleDot, CheckCircle2 } from 'lucide-react';

const MenuScreen = ({
  onStartLesson,
  onFreeDrive,
  completedLessons,
  difficulty,
  onDifficultyChange,
}) => {
  const [tab, setTab] = useState("lessons");
  const [selectedTod, setSelectedTod] = useState("day");

  const isUnlocked = (idx) => true;

  return (
    <div className="menu-root">
      <div className="menu-bg-grid" />
      <div className="menu-bg-glow" />

      <div className="menu-inner">
        <header className="menu-header">
          <h1 className="menu-title">HowTo<span className="menu-title-accent">Drive</span></h1>
          <p className="menu-subtitle">Learn to drive with the power of Computer Graphics</p>
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
                {d === "easy" ? <><CircleDashed size={14} /> Easy (auto-clutch)</> : <><CircleDot size={14} /> Manual (clutch)</>}
              </div>
            </button>
          ))}
        </div>

        <div className="menu-tabs">
          <button className={`menu-tab ${tab === "lessons" ? "menu-tab--active" : ""}`} onClick={() => setTab("lessons")}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Missions</div>
          </button>
          <button className={`menu-tab ${tab === "freeDrive" ? "menu-tab--active" : ""}`} onClick={() => setTab("freeDrive")}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flag size={16} /> Free Drive</div>
          </button>
        </div>

        <div className="tod-row">
          <span className="tod-label">Environment:</span>
          <div className="tod-btns">
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
        </div>

        {tab === "lessons" && (
          <div className="level-grid">
            {LESSONS.map((lesson, idx) => {
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
            })}
          </div>
        )}

        {tab === "freeDrive" && (
          <div className="level-grid">
            {FREE_DRIVE_TRACKS.map((t) => (
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
            ))}
          </div>
        )}

        <footer className="menu-controls">
          {[["I", "Ignition"], ["W/S", "Drive/Brake"], ["E/Q", "Gear ▲/▼"], ["CTRL", "Clutch"], ["SPACE", "Handbrake"], ["H", "Headlights"], ["F", "Horn"], ["R", "Reset"], ["C", "Camera"], ["ESC", "Menu"]].map(([k, l]) => (
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