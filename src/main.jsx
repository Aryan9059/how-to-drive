import "./assets/global.css";
import { Canvas }   from "@react-three/fiber";
import ReactDOM      from "react-dom/client";
import React, { useState, useEffect, useCallback } from "react";
import { Physics }   from "@react-three/cannon";
import Scene         from "./components/Scene";
import MenuScreen    from "./components/MenuScreen";
import SimHUD        from "./components/SimHUD";
import LessonOverlay from "./components/LessonOverlay";
import { LESSONS }   from "./gameConfig";

// Load completed lessons from localStorage
const loadCompleted = () => {
  try { return new Set(JSON.parse(localStorage.getItem("completedLessons") || "[]")); }
  catch { return new Set(); }
};
const saveCompleted = (set) => {
  localStorage.setItem("completedLessons", JSON.stringify([...set]));
};

const App = () => {
  // ── Persistent state ───────────────────────────────────────────────────────
  const [difficulty,       setDifficulty]       = useState("easy");
  const [completedLessons, setCompletedLessons] = useState(loadCompleted);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [gameMode,    setGameMode]    = useState("menu"); // "menu"|"lesson"|"freeDrive"
  const [lessonId,    setLessonId]    = useState("lesson1");
  const [trackId,     setTrackId]     = useState("track1");
  const [lessonPhase, setLessonPhase] = useState("intro"); // "intro"|"active"|"passed"|"failed"
  const [canvasKey,   setCanvasKey]   = useState(0); // remount canvas to reset physics

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goMenu = useCallback(() => {
    setGameMode("menu");
    setLessonPhase("intro");
  }, []);

  const startLesson = useCallback((lid, diff) => {
    setLessonId(lid);
    setDifficulty(diff);
    setLessonPhase("intro");
    setCanvasKey((k) => k + 1);
    setGameMode("lesson");
  }, []);

  const startFreeDrive = useCallback((tid, diff) => {
    setTrackId(tid);
    setDifficulty(diff);
    setCanvasKey((k) => k + 1);
    setGameMode("freeDrive");
  }, []);

  const retryLesson = useCallback(() => {
    setLessonPhase("intro");
    setCanvasKey((k) => k + 1);
  }, []);

  const nextLesson = useCallback(() => {
    const idx  = LESSONS.findIndex((l) => l.id === lessonId);
    const next = LESSONS[idx + 1];
    if (next) startLesson(next.id, difficulty);
    else goMenu();
  }, [lessonId, difficulty, startLesson, goMenu]);

  // ── Lesson outcomes ────────────────────────────────────────────────────────
  const handleLessonPass = useCallback(() => {
    setCompletedLessons((prev) => {
      const next = new Set(prev).add(lessonId);
      saveCompleted(next);
      return next;
    });
    setLessonPhase("passed");
  }, [lessonId]);

  const handleLessonFail = useCallback(() => {
    setLessonPhase("failed");
  }, []);

  // ── ESC → menu ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Escape" && gameMode !== "menu") goMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameMode, goMenu]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (gameMode === "menu") {
    return (
      <MenuScreen
        onStartLesson={startLesson}
        onFreeDrive={startFreeDrive}
        completedLessons={completedLessons}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
    );
  }

  return (
    <>
      <SimHUD
        lessonId={gameMode === "lesson" ? lessonId : null}
        mode={gameMode}
      />

      {/* Lesson overlay (intro / pass / fail) — only in lesson mode */}
      {gameMode === "lesson" && lessonPhase !== "active" && (
        <LessonOverlay
          phase={lessonPhase}
          lessonId={lessonId}
          difficulty={difficulty}
          onStart={() => setLessonPhase("active")}
          onRetry={retryLesson}
          onNext={nextLesson}
          onMenu={goMenu}
        />
      )}

      <Canvas
        key={canvasKey}
        style={{ position: "fixed", inset: 0 }}
      >
        <Physics broadphase="SAP" gravity={[0, -2.1, 0]}>
          <Scene
            mode={gameMode}
            lessonId={lessonId}
            trackId={trackId}
            difficulty={difficulty}
            onLessonPass={handleLessonPass}
            onLessonFail={handleLessonFail}
          />
        </Physics>
      </Canvas>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
