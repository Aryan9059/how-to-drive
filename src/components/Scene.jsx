import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Debug, usePlane } from "@react-three/cannon";
import { Suspense, useEffect, useRef, useState } from "react";
import Car from "./Car";
import Bike from "./Bike";
import Plane from "./Plane";
import Helicopter from "./Helicopter";
import Ground from "./Ground";
import Track from "./Track";
import BarrelContent from "./Barrel";
import DynamicSky from "./DynamicSky";
import LessonMonitor from "./LessonMonitor";
import { LESSON_CAR_STARTS, TRACK_CAR_STARTS, BIKE_STARTS, PLANE_STARTS, HELICOPTER_STARTS } from "../gameConfig";

const debug = false;

const Scene = ({
  mode = "lesson",
  lessonId = "lesson1",
  trackId = "track1",
  difficulty = "easy",
  timeOfDay = "day",
  vehicleType = "car",
  onLessonPass,
  onLessonFail,
}) => {
  const [cameraView, setView] = useState(1);
  const [cameraPos, setCameraPos] = useState([-21, 34, 55]);

  // Compute vehicle start position
  const getStart = () => {
    if (mode === "freeDrive") {
      return TRACK_CAR_STARTS[trackId] || TRACK_CAR_STARTS.track1;
    }
    switch (vehicleType) {
      case "bike":       return BIKE_STARTS[lessonId] || { position: [0, 2, 0], rotation: [0, Math.PI / 2, 0] };
      case "plane":      return PLANE_STARTS[lessonId] || { position: [-90, 1, 0], rotation: [0, Math.PI / 2, 0] };
      case "helicopter": return HELICOPTER_STARTS[lessonId] || { position: [0, 8, 0], rotation: [0, 0, 0] };
      default:           return LESSON_CAR_STARTS[lessonId] || LESSON_CAR_STARTS.lesson1;
    }
  };

  const carStart = getStart();
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

  // Aerial vehicles need higher FOV
  const getFOV = () => {
    if (vehicleType === "plane") return 70;
    if (vehicleType === "helicopter") return 60;
    return 40;
  };

  // Show ground or physics plane
  const needsPhysicsGround = vehicleType === "plane" || vehicleType === "helicopter";

  const renderVehicle = () => {
    switch (vehicleType) {
      case "bike":
        return (
          <Bike
            cameraView={cameraView}
            startPosition={carStart.position}
            startRotation={carStart.rotation}
          />
        );
      case "plane":
        return (
          <Plane
            cameraView={cameraView}
            startPosition={carStart.position}
            startRotation={carStart.rotation}
          />
        );
      case "helicopter":
        return (
          <Helicopter
            cameraView={cameraView}
            startPosition={carStart.position}
            startRotation={carStart.rotation}
          />
        );
      default:
        return (
          <Car
            cameraView={cameraView}
            startPosition={carStart.position}
            startRotation={carStart.rotation}
            difficulty={difficulty}
          />
        );
    }
  };

  const content = (
    <Suspense fallback={null}>
      <DynamicSky timeOfDay={tod} />
      {todFog()}

      {!["track3", "track5", "track_city"].includes(activeTrack) && (
        <Environment files="textures/envmap.hdr" background={false} />
      )}

      <PerspectiveCamera makeDefault position={cameraPos} fov={getFOV()} />
      {cameraView === 0 && <OrbitControls target={[0, 0, 0]} />}

      {renderVehicle()}

      {/* Ground — aerial vehicles use a thinner physics plane so they can land */}
      {activeTrack === "track1" ? <Ground /> : <PhysicsGround />}
      <Track levelId={activeTrack} />
      {activeTrack === "track1" && <BarrelContent />}

      {mode === "lesson" && (
        <LessonMonitor
          lessonId={lessonId}
          vehicleType={vehicleType}
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