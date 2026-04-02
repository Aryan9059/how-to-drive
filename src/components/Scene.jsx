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
  onLessonPass,
  onLessonFail,
}) => {
  const [cameraView, setView] = useState(1); // start in follow-cam for simulator
  const [cameraPos, setCameraPos] = useState([-21, 34, 55]);

  const carStart = mode === "lesson"
    ? (LESSON_CAR_STARTS[lessonId] || LESSON_CAR_STARTS.lesson1)
    : (TRACK_CAR_STARTS[trackId] || TRACK_CAR_STARTS.track1);

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

  const levelEnvironment = () => {
    if (activeTrack === "track2") return (
      <>
        <color attach="background" args={["#e07832"]} />
        <fog   attach="fog"        args={["#e07832", 60, 200]} />
        <Environment files="textures/envmap.hdr" />
        <ambientLight intensity={1.0} color="#ffbb66" />
        <directionalLight position={[15,30,10]} intensity={2} color="#ffaa44" castShadow />
      </>
    );
    if (activeTrack === "track3") return (
      <>
        <color attach="background" args={["#04060f"]} />
        <fog   attach="fog"        args={["#04060f", 40, 130]} />
        <Environment files="textures/envmap.hdr" />
        <ambientLight intensity={0.25} color="#3344aa" />
        <pointLight position={[0,20,0]}   intensity={12} color="#4466ff" />
        <pointLight position={[-18,8,0]}  intensity={8}  color="#ff00aa" />
        <pointLight position={[18,8,0]}   intensity={8}  color="#00ffaa" />
      </>
    );
    return <Environment files="textures/envmap.hdr" background="both" />;
  };

  const content = (
    <Suspense fallback={null}>
      {levelEnvironment()}
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

      {/* Lesson-specific markers + monitor — only in lesson mode */}
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