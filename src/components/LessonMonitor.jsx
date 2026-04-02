import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";
import Checkpoint from "./Checkpoint";
import StopLine from "./StopLine";
import GearGate from "./GearGate";
import ParkingBay from "./ParkingBay";

const LessonMonitor = ({ lessonId, onPass, onFail }) => {
  const passedRef = useRef(false);
  const failedRef = useRef(false);
  const highwayTimer = useRef(0);
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

    if (lessonId === "lesson6") {
      const { speed, gear } = simStore;
      if (speed >= 40 && gear >= 4) {
        highwayTimer.current += delta;
        if (highwayTimer.current >= 10) callPass();
      } else {
        highwayTimer.current = Math.max(0, highwayTimer.current - delta * 0.5);
      }
    }
  });

  if (lessonId === "lesson1") {
    // 🚦 Moved from x=34 to x=80
    return <Checkpoint position={[80, 1, -3]} radius={4} onTrigger={callPass} />;
  }

  if (lessonId === "lesson2") {
    return (
      <>
        <Checkpoint position={[0, 1, -3]} radius={4} />
        {/* 🚦 Moved from x=72 to x=150 */}
        <Checkpoint
          position={[150, 1, -3]}
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
        {/* 🚦 Spaced out significantly for a longer run */}
        <GearGate
          position={[60, 1, -3]}
          requiredGear={2}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
        <GearGate
          position={[140, 1, -3]}
          requiredGear={3}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
        <GearGate
          position={[220, 1, -3]}
          requiredGear={4}
          onPass={() => { gatesPassed.current++; if (gatesPassed.current >= 3) callPass(); }}
          onFail={callFail}
        />
      </>
    );
  }

  if (lessonId === "lesson4") {
    // 🚦 Moved from x=84 to x=219
    return (
      <StopLine
        position={[219, 0, -3]}
        width={14}
        zoneDepth={6}
        requiredSpeed={0.8}
        onStop={callPass}
      />
    );
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

  return null;
};

export default LessonMonitor;