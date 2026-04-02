import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";
import Checkpoint from "./Checkpoint";
import StopLine from "./StopLine";
import GearGate from "./GearGate";
import ParkingBay from "./ParkingBay";

/**
 * In-Canvas component that:
 *  1. Writes simStore.position to window._simPos (for marker children that read it)
 *  2. Renders lesson-specific 3D markers
 *  3. Monitors pass/fail conditions via useFrame
 *  4. Calls onPass() / onFail() on the parent
 */
const LessonMonitor = ({ lessonId, onPass, onFail }) => {
  const passedRef = useRef(false);
  const failedRef = useRef(false);
  const highwayTimer = useRef(0); // lesson 6 sustained-speed timer
  const gatesPassed = useRef(0); // lesson 3

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

  // Keep window ref fresh so marker children can read it cheaply
  useFrame((_, delta) => {
    window._simPos = simStore.position;
    window._simSpeed = simStore.speed;

    // ── Lesson 6: sustained highway speed ──────────────────────────────────
    if (lessonId === "lesson6") {
      const { speed, gear } = simStore;
      if (speed >= 40 && gear >= 4) {
        highwayTimer.current += delta;
        if (highwayTimer.current >= 10) callPass();
      } else {
        highwayTimer.current = Math.max(0, highwayTimer.current - delta * 0.5);
      }
    }

    // ── Lesson 4: reach 50 km/h before checking brake zone ────────────────
    // Handled via StopLine onStop + speed requirement injected via props
  });

  // ── Lesson-specific marker layouts ────────────────────────────────────────
  // All positioned relative to car start [-10, 3, -3], car faces +X

  if (lessonId === "lesson1") {
    return (
      <Checkpoint
        position={[34, 1, -3]}
        radius={4}
        onTrigger={callPass}
      />
    );
  }

  if (lessonId === "lesson2") {
    return (
      <>
        <Checkpoint position={[0, 1, -3]} radius={4} />
        <Checkpoint
          position={[72, 1, -3]}
          radius={5}
          requireStop={true}
          requiredSpeed={0.5}
          onTrigger={callPass}
        />
      </>
    );
  }

  if (lessonId === "lesson3") {
    return (
      <>
        <GearGate
          position={[15, 1, -3]}
          requiredGear={2}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
        <GearGate
          position={[50, 1, -3]}
          requiredGear={3}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
        <GearGate
          position={[90, 1, -3]}
          requiredGear={4}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
      </>
    );
  }

  if (lessonId === "lesson4") {
    return (
      <StopLine
        position={[84, 0, -3]}
        width={14}
        zoneDepth={6}
        requiredSpeed={0.8}
        onStop={callPass}
      />
    );
  }

  if (lessonId === "lesson5") {
    return (
      <ParkingBay
        position={[18.75, 0, 8]}
        size={[5.5, 8]}
        onParked={callPass}
      />
    );
  }

  if (lessonId === "lesson7") {
    return (
      <Checkpoint
        position={[0, 1, -45]}
        radius={6}
        onTrigger={callPass}
      />
    );
  }

  if (lessonId === "lesson8") {
    return (
      <Checkpoint
        position={[49, 12.4, -3]}
        radius={5}
        onTrigger={callPass}
      />
    );
  }

  if (lessonId === "lesson9") {
    return (
      <Checkpoint
        position={[74, 1, -3]}
        radius={6}
        onTrigger={callPass}
      />
    );
  }

  return null;
};

export default LessonMonitor;
