import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import { Suspense, useEffect, useRef, useState } from "react";
import Car from "./Car";
import Ground from "./Ground";
import Track from "./Track";
import BarrelContent from "./Barrel";
import DynamicSky from "./DynamicSky";
import LessonMonitor from "./LessonMonitor";
import { LESSON_CAR_STARTS, TRACK_CAR_STARTS } from "../gameConfig";

const debug = false;

const Scene = ({
  mode = "lesson",
  lessonId = "lesson1",
  trackId = "track1",
  difficulty = "easy",
  timeOfDay = "day",
  onLessonPass,
  onLessonFail,
}) => {
  const [cameraView, setView] = useState(1);
  const [cameraPos, setCameraPos] = useState([-21, 34, 55]);

  const carStart = mode === "lesson"
    ? (LESSON_CAR_STARTS[lessonId] || LESSON_CAR_STARTS.lesson1)
    : (TRACK_CAR_STARTS[trackId] || TRACK_CAR_STARTS.track1);

  const activeTrack = mode === "freeDrive" ? trackId : lessonId;

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "KeyV") {
        setView((v) => {
          if (v === 3) { setCameraPos([-21, 34, 55 + Math.random() * 0.01]); return 0; }
          return v + 1;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tod = timeOfDay;

  const todFog = () => {
    switch (tod) {
      case "dawn": return <fog attach="fog" args={["#f08040", 60, 400]} />;
      case "day": return <fog attach="fog" args={["#6dcef5", 100, 800]} />;
      case "dusk": return <fog attach="fog" args={["#1a0a30", 50, 400]} />;
      case "night": return <fog attach="fog" args={["#010208", 20, 200]} />;
      default: return null;
    }
  };

  const trackLighting = () => {
    return null;
  };

  const useTrackOverride = false;
  const nightOverride = null;

  const content = (
    <Suspense fallback={null}>
      {!useTrackOverride && <DynamicSky timeOfDay={tod} />}
      {!useTrackOverride && todFog()}

      {useTrackOverride ? nightOverride : null}
      {trackLighting()}

      {!["track3", "track5", "track_city"].includes(activeTrack) && (
        <Environment files="textures/envmap.hdr" background={false} />
      )}

      <PerspectiveCamera makeDefault position={cameraPos} fov={40} />
      {cameraView === 0 && <OrbitControls target={[0, 0, 0]} />}

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
    ? <><axesHelper args={[40]} /><gridHelper args={[80, 80]} /><Debug>{content}</Debug></>
    : content;
};

const PhysicsGround = () => {
  usePlane(() => ({ type: "Static", rotation: [-Math.PI / 2, 0, 0] }), useRef(null));
  return null;
};

export default Scene;