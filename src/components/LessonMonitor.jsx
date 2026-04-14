import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";
import Checkpoint from "./Checkpoint";
import StopLine from "./StopLine";
import GearGate from "./GearGate";
import ParkingBay from "./ParkingBay";

const LessonMonitor = ({ lessonId, vehicleType = "car", onPass, onFail }) => {
  const passedRef = useRef(false);
  const failedRef = useRef(false);
  const timerRef = useRef(0);
  const gatesPassed = useRef(0);

  const callPass = () => {
    if (passedRef.current || failedRef.current) return;
    passedRef.current = true;
    onPass?.();
  };
  const callFail = () => {
    if (passedRef.current || failedRef.current) return;
    failedRef.current = true;
    onFail?.();
  };

  useFrame((_, delta) => {
    window._simPos = simStore.position;
    window._simSpeed = simStore.speed;

    // Car – highway lesson
    if (lessonId === "lesson6") {
      const { speed, gear } = simStore;
      if (speed >= 40 && gear >= 4) {
        timerRef.current += delta;
        if (timerRef.current >= 10) callPass();
      } else {
        timerRef.current = Math.max(0, timerRef.current - delta * 0.5);
      }
    }

    // Bike – Mountain Run: pass 3 checkpoints at speed >= 60
    if (lessonId === "bike2") {
      // handled by checkpoint triggers below
    }

    // Plane – gather altitude checkpoints
    // Helicopter – hover/land checkpoints
    // All plane/heli mission pass logic via Checkpoint triggers
  });

  // ─── Car Missions ────────────────────────────────────────────
  if (lessonId === "lesson1") {
    return <Checkpoint position={[80, 1, -3]} radius={4} onTrigger={callPass} />;
  }

  if (lessonId === "lesson2") {
    return (
      <>
        <Checkpoint position={[0, 1, -3]} radius={4} />
        <Checkpoint position={[150, 1, -3]} radius={5} requireStop={true} requiredSpeed={1} onTrigger={callPass} />
      </>
    );
  }

  if (lessonId === "lesson3") {
    return (
      <>
        <GearGate position={[60, 1, -3]} requiredGear={2} onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} onFail={callFail} />
        <GearGate position={[140, 1, -3]} requiredGear={3} onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} onFail={callFail} />
        <GearGate position={[220, 1, -3]} requiredGear={4} onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} onFail={callFail} />
      </>
    );
  }

  if (lessonId === "lesson4") {
    return <StopLine position={[219, 0, -3]} width={14} zoneDepth={6} requiredSpeed={0.8} onStop={callPass} />;
  }

  if (lessonId === "lesson5") {
    return <ParkingBay position={[18.75, 0, 8]} size={[5.5, 8]} onParked={callPass} />;
  }

  if (lessonId === "lesson7") {
    return <Checkpoint position={[0, 1, -45]} radius={6} onTrigger={callPass} />;
  }

  if (lessonId === "lesson8") {
    return <Checkpoint position={[49, 12.4, -3]} radius={5} onTrigger={callPass} />;
  }

  if (lessonId === "lesson9") {
    return <Checkpoint position={[74, 1, -3]} radius={6} onTrigger={callPass} />;
  }

  // ─── Bike Missions ───────────────────────────────────────────
  if (lessonId === "bike1") {
    // Finish gate checkpoint at the end of the slalom
    return <Checkpoint position={[112, 1, 0]} radius={8} onTrigger={callPass} />;
  }

  if (lessonId === "bike2") {
    // 3 speed checkpoints along the mountain road, all must be passed
    return (
      <>
        <Checkpoint position={[80, 1, 0]} radius={10} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[80, 1, -40]} radius={10} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[80, 1, -80]} radius={10} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
      </>
    );
  }

  // ─── Plane Missions ──────────────────────────────────────────
  if (lessonId === "plane1") {
    // Fly through 3 altitude rings (use mode3D for aerial)
    return (
      <>
        <Checkpoint position={[50, 15, 0]} radius={14} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[130, 23, 0]} radius={14} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[210, 31, 0]} radius={14} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
      </>
    );
  }

  if (lessonId === "plane2") {
    // Fly through 5 aerial rings
    return (
      <>
        <Checkpoint position={[80, 20, 0]} radius={16} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 5) callPass(); }} />
        <Checkpoint position={[160, 35, 20]} radius={16} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 5) callPass(); }} />
        <Checkpoint position={[240, 25, -15]} radius={16} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 5) callPass(); }} />
        <Checkpoint position={[320, 50, 10]} radius={16} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 5) callPass(); }} />
        <Checkpoint position={[400, 40, -20]} radius={16} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 5) callPass(); }} />
      </>
    );
  }

  // ─── Helicopter Missions ─────────────────────────────────────
  if (lessonId === "heli1") {
    // Land on 3 helipads – use mode3D so altitude matters
    return (
      <>
        <Checkpoint position={[80, 17, 0]} radius={9} mode3D requireStop={true} requiredSpeed={5} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[0, 11, -80]} radius={8} mode3D requireStop={true} requiredSpeed={5} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
        <Checkpoint position={[-60, 25, -40]} radius={10} mode3D requireStop={true} requiredSpeed={5} onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
      </>
    );
  }

  if (lessonId === "heli2") {
    // Fly through 3 canyon waypoint rings then reach summit
    return (
      <>
        <Checkpoint position={[-60, 15, -20]} radius={8} mode3D onTrigger={() => { gatesPassed.current++; }} />
        <Checkpoint position={[40, 25, -20]} radius={8} mode3D onTrigger={() => { gatesPassed.current++; }} />
        <Checkpoint position={[80, 30, -30]} radius={8} mode3D onTrigger={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }} />
      </>
    );
  }

  return null;
};

export default LessonMonitor;