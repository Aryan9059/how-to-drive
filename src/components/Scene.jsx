// src/components/Scene.jsx
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import { Suspense, useEffect, useRef, useState } from "react";
import Car from "./Car";
import Ground from "./Ground";
import Track from "./Track";
import BarrelContent from "./Barrel";
import LessonMonitor from "./LessonMonitor";
import { LESSON_CAR_STARTS, TRACK_CAR_STARTS } from "../gameConfig";

const debug = false;

const Scene = ({
  mode       = "lesson",   // "lesson" | "freeDrive"
  lessonId   = "lesson1",
  trackId    = "track1",
  difficulty = "easy",
  timeOfDay  = "day",      // "dawn" | "day" | "dusk" | "night"
  onLessonPass,
  onLessonFail,
}) => {
  const [cameraView, setView] = useState(1);
  const [cameraPos, setCameraPos] = useState([-21, 34, 55]);

  const carStart = mode === "lesson"
    ? (LESSON_CAR_STARTS[lessonId] || LESSON_CAR_STARTS.lesson1)
    : (TRACK_CAR_STARTS[trackId]   || TRACK_CAR_STARTS.track1);

  const activeTrack = mode === "freeDrive" ? trackId : lessonId;

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyC") {
        setView((v) => {
          if (v === 3) { setCameraPos([-21, 34, 55 + Math.random() * 0.01]); return 0; }
          return v + 1;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Time-of-day lighting system ─────────────────────────────────────────────
  const tod = mode === "freeDrive" ? timeOfDay : "day";

  const todLighting = () => {
    switch (tod) {
      case "dawn": return (
        <>
          <color attach="background" args={["#f08040"]} />
          <fog   attach="fog"        args={["#e07030", 60, 220]} />
          <ambientLight intensity={0.5} color="#ffbb88" />
          <directionalLight position={[-30, 8, -10]}  intensity={1.8} color="#ff9955" castShadow />
          <directionalLight position={[10, 20, 10]}   intensity={0.4} color="#ffddaa" />
        </>
      );
      case "day": return (
        <>
          <color attach="background" args={["#6dcef5"]} />
          <fog   attach="fog"        args={["#6dcef5", 80, 280]} />
          <ambientLight intensity={0.7} color="#ffffff" />
          <directionalLight position={[20, 40, 10]}   intensity={2.5} color="#fffdf0" castShadow />
          <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#c8e8ff" />
        </>
      );
      case "dusk": return (
        <>
          <color attach="background" args={["#1a0a30"]} />
          <fog   attach="fog"        args={["#1a0a30", 50, 180]} />
          <ambientLight intensity={0.25} color="#8833aa" />
          <directionalLight position={[25, 5, -5]}    intensity={1.6} color="#ff6622" castShadow />
          <directionalLight position={[-10, 15, 10]}  intensity={0.3} color="#aa44ff" />
          <pointLight position={[0, 25, 0]} intensity={8} color="#7722cc" distance={120} />
        </>
      );
      case "night": return (
        <>
          <color attach="background" args={["#010208"]} />
          <fog   attach="fog"        args={["#010208", 30, 120]} />
          <ambientLight intensity={0.08} color="#2233aa" />
          <pointLight position={[0, 40, 0]}   intensity={2}  color="#334466" distance={150} />
          <pointLight position={[0, 10, -20]} intensity={1}  color="#112244" distance={60} />
        </>
      );
      default: return null;
    }
  };

  // ── Per-track extra lighting (overlaid on top of time-of-day) ────────────────
  const trackLighting = () => {
    if (activeTrack === "track2") return (
      <>
        <ambientLight intensity={0.4} color="#ffbb66" />
        <directionalLight position={[15, 30, 10]} intensity={1.5} color="#ffaa44" castShadow />
      </>
    );
    if (activeTrack === "track3") return (
      <>
        <ambientLight intensity={0.1} color="#3344aa" />
        <pointLight position={[0, 20, 0]}   intensity={12} color="#4466ff" />
        <pointLight position={[-18, 8, 0]}  intensity={8}  color="#ff00aa" />
        <pointLight position={[18, 8, 0]}   intensity={8}  color="#00ffaa" />
      </>
    );
    if (activeTrack === "track4") return (
      <>
        <ambientLight intensity={0.6} color="#aaccff" />
        <directionalLight position={[10, 30, 5]}  intensity={1.8} color="#ddeeff" castShadow />
        <directionalLight position={[-10, 15, -5]} intensity={0.6} color="#bbddff" />
        <pointLight position={[0, 20, 0]} intensity={5} color="#88aacc" distance={120} />
      </>
    );
    if (activeTrack === "track5") return (
      <>
        <ambientLight intensity={0.12} color="#220800" />
        <directionalLight position={[5, 20, 5]}  intensity={0.4} color="#ff3300" castShadow />
        <pointLight position={[0, 2, 0]}  intensity={20} color="#ff4400" distance={60} decay={2} />
        <pointLight position={[0, 10, 0]} intensity={8}  color="#ff6600" distance={100} decay={1.5} />
      </>
    );
    return null;
  };

  // For track3 (Night City) use a fixed dark preset regardless of tod
  const useTrackOverride = ["track3", "track5"].includes(activeTrack);
  const nightOverride = activeTrack === "track3" ? (
    <>
      <color attach="background" args={["#04060f"]} />
      <fog   attach="fog"        args={["#04060f", 40, 130]} />
    </>
  ) : activeTrack === "track5" ? (
    <>
      <color attach="background" args={["#100300"]} />
      <fog   attach="fog"        args={["#100300", 35, 120]} />
    </>
  ) : null;

  const content = (
    <Suspense fallback={null}>
      {/* Background + fog + base lights */}
      {useTrackOverride ? nightOverride : todLighting()}
      {/* Per-track accent lights */}
      {trackLighting()}
      {/* HDR environment for reflections (no background on night/dusk tracks) */}
      {!["track3","track5"].includes(activeTrack) && tod !== "night" && (
        <Environment files="textures/envmap.hdr" background={tod === "day"} />
      )}

      <PerspectiveCamera makeDefault position={cameraPos} fov={40} />
      {cameraView === 0 && <OrbitControls target={[0,0,0]} />}

      <Car
        cameraView={cameraView}
        startPosition={carStart.position}
        startRotation={carStart.rotation}
        difficulty={difficulty}
      />

      {activeTrack === "track1" ? <Ground /> : <PhysicsGround />}
      <Track levelId={activeTrack} />
      {activeTrack === "track1" && <BarrelContent />}

      {mode === "lesson" && (
        <LessonMonitor
          lessonId={lessonId}
          onPass={onLessonPass}
          onFail={onLessonFail}
        />
      )}
    </Suspense>
  );

  return debug
    ? <><axesHelper args={[40]} /><gridHelper args={[80,80]} /><Debug>{content}</Debug></>
    : content;
};

const PhysicsGround = () => {
  usePlane(() => ({ type: "Static", rotation: [-Math.PI / 2, 0, 0] }), useRef(null));
  return null;
};

export default Scene;