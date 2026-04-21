import "./assets/global.css";
import { Canvas } from "@react-three/fiber";
import ReactDOM from "react-dom/client";
import React, { useState, useEffect, useCallback } from "react";
import { Physics } from "@react-three/cannon";
import Scene from "./components/Scene";
import MenuScreen from "./components/MenuScreen";
import SimHUD from "./components/SimHUD";
import LessonOverlay from "./components/LessonOverlay";
import BackgroundMusic from "./components/BackgroundMusic";
import { LESSONS, PLANE_MISSIONS, HELICOPTER_MISSIONS } from "./gameConfig";
import simStore from "./simStore";

const loadCompleted = () => {
  try {
    const data = JSON.parse(localStorage.getItem("completedLessons") || "{}");
    if (Array.isArray(data)) {
      return data.reduce((acc, id) => ({ ...acc, [id]: 1 }), {});
    }
    return data;
  } catch { return {}; }
};
const saveCompleted = (obj) => {
  localStorage.setItem("completedLessons", JSON.stringify(obj));
};

const getLessonsForVehicle = (vehicleType) => {
  switch (vehicleType) {

    case "plane": return PLANE_MISSIONS;
    case "helicopter": return HELICOPTER_MISSIONS;
    default: return LESSONS;
  }
};

const App = () => {
  const [difficulty, setDifficulty] = useState("easy");
  const [completedLessons, setCompletedLessons] = useState(loadCompleted);

  const [gameMode, setGameMode] = useState("menu");
  const [menuStep, setMenuStep] = useState("splash");
  const [lessonId, setLessonId] = useState("lesson1");
  const [trackId, setTrackId] = useState("track1");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [lessonPhase, setLessonPhase] = useState("intro");
  const [canvasKey, setCanvasKey] = useState(0);
  const [musicMuted, setMusicMuted] = useState(simStore.musicMuted);
  const [vehicleType, setVehicleType] = useState("car");

  const goMenu = useCallback(() => {
    setGameMode("menu");
    setMenuStep("mode_selection");
    setLessonPhase("intro");
  }, []);

  const startLesson = useCallback((lid, diff, tod = "day", vehicle = "car") => {
    setLessonId(lid);
    setDifficulty(diff);
    setTimeOfDay(tod);
    setVehicleType(vehicle);
    setLessonPhase("intro");
    setCanvasKey((k) => k + 1);
    setGameMode("lesson");
  }, []);

  const startFreeDrive = useCallback((tid, diff, tod = "day") => {
    setTrackId(tid);
    setDifficulty(diff);
    setTimeOfDay(tod);
    setVehicleType("car");
    setCanvasKey((k) => k + 1);
    setGameMode("freeDrive");
  }, []);

  const retryLesson = useCallback(() => {
    setLessonPhase("intro");
    setCanvasKey((k) => k + 1);
  }, []);

  const nextLesson = useCallback(() => {
    const lessons = getLessonsForVehicle(vehicleType);
    const idx = lessons.findIndex((l) => l.id === lessonId);
    const next = lessons[idx + 1];
    if (next) startLesson(next.id, difficulty, timeOfDay, vehicleType);
    else goMenu();
  }, [lessonId, difficulty, timeOfDay, vehicleType, startLesson, goMenu]);

  useEffect(() => {
    if (lessonPhase === "active") {
      simStore.metrics = {
        startTime: performance.now(),
        endTime: 0,
        mistakes: 0,
        hardBrakes: 0,
        lastSpeed: 0,
        isHardBraking: false
      };
    }
  }, [lessonPhase]);

  const handleLessonPass = useCallback(() => {
    simStore.metrics.endTime = performance.now();
    const timeTaken = (simStore.metrics.endTime - simStore.metrics.startTime) / 1000;

    const lessons = getLessonsForVehicle(vehicleType);
    const lesson = lessons.find((l) => l.id === lessonId);
    const criteria = lesson?.stars || { time: 999, mistakes: 0, hardBrakes: 0 };

    const earnedStars =
      (timeTaken <= criteria.time ? 1 : 0) +
      (simStore.metrics.mistakes <= criteria.mistakes ? 1 : 0) +
      (simStore.metrics.hardBrakes <= criteria.hardBrakes ? 1 : 0);

    setCompletedLessons((prev) => {
      const currentStars = prev[lessonId] || 0;
      const next = { ...prev, [lessonId]: Math.max(currentStars, earnedStars) };
      saveCompleted(next);
      return next;
    });
    setLessonPhase("passed");
  }, [lessonId, vehicleType]);

  const handleLessonFail = useCallback(() => {
    setLessonPhase("failed");
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Escape") {
        if (gameMode !== "menu") {
          goMenu();
        } else {
          if (menuStep === "missions" || menuStep === "free_roam") {
            setMenuStep("vehicle_selection");
          } else if (menuStep === "vehicle_selection") {
            setMenuStep("mode_selection");
          } else if (menuStep === "mode_selection") {
            setMenuStep("splash");
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameMode, menuStep, goMenu]);


  const getGravity = () => {
    if (vehicleType === "plane" || vehicleType === "helicopter") return [0, -9.82, 0];
    return [0, -2.1, 0];
  };

  return (
    <>
      <BackgroundMusic mode={gameMode} muted={musicMuted} />
      {gameMode === "menu" ? (
        <MenuScreen
          menuStep={menuStep}
          setMenuStep={setMenuStep}
          onStartLesson={startLesson}
          onFreeDrive={startFreeDrive}
          completedLessons={completedLessons}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          musicMuted={musicMuted}
          onToggleMusic={() => {
            const next = !simStore.musicMuted;
            simStore.musicMuted = next;
            setMusicMuted(next);
          }}
        />
      ) : (
        <>
          <SimHUD
            lessonId={gameMode === "lesson" ? lessonId : null}
            mode={gameMode}
            vehicleType={vehicleType}
          />

          {gameMode === "lesson" && lessonPhase !== "active" && (
            <LessonOverlay
              phase={lessonPhase}
              lessonId={lessonId}
              difficulty={difficulty}
              vehicleType={vehicleType}
              onStart={() => setLessonPhase("briefing")}
              onBriefingComplete={() => setLessonPhase("active")}
              onRetry={retryLesson}
              onNext={nextLesson}
              onMenu={goMenu}
            />
          )}

          <Canvas key={canvasKey} style={{ position: "fixed", inset: 0 }}>
            <Physics broadphase="SAP" gravity={getGravity()}>
              <Scene
                mode={gameMode}
                lessonId={lessonId}
                trackId={trackId}
                difficulty={difficulty}
                timeOfDay={timeOfDay}
                vehicleType={vehicleType}
                onLessonPass={handleLessonPass}
                onLessonFail={handleLessonFail}
              />
            </Physics>
          </Canvas>
        </>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);