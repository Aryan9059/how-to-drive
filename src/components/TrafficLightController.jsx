import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import TrafficLight, { TL_STATE } from "./TrafficLight";
import simStore from "../simStore";

/**
 * TrafficLightController
 *
 * Manages one or more traffic lights at an intersection,
 * cycles through RED → GREEN → YELLOW automatically,
 * and detects violations (running a red/yellow light).
 *
 * Props:
 *  position       – [x, y, z] world position for primary light
 *  rotations      – array of rotations for each light post (for 4-way or 2-way)
 *  offsets        – array of [x, y, z] position offsets per light post
 *  redDuration    – seconds light stays red (default 6)
 *  greenDuration  – seconds light stays green (default 5)
 *  yellowDuration – seconds light stays yellow (default 2)
 *  stopLineZ      – Z coordinate of the stop line (vehicle must be behind this when red)
 *  stopLineX      – X center of the stop zone
 *  stopZoneWidth  – width of zone that's monitored (default 12)
 *  onViolation    – callback when player runs red/yellow
 *  startState     – initial TL_STATE (default RED)
 *  id             – unique identifier for this controller
 */
const TrafficLightController = ({
  position = [0, 0, 0],
  offsets = [[0, 0, 0]],
  rotations = [[0, 0, 0]],
  redDuration = 6,
  greenDuration = 5,
  yellowDuration = 2,
  stopLineZ,           // Z of the stop line plane
  stopLineX,           // X center
  stopZoneWidth = 12,  // how wide the monitored zone is
  stopZoneDepth = 8,   // how deep the detection zone is (behind the line)
  onViolation,
  startState = TL_STATE.RED,
  id = "tl0",
}) => {
  const [lightState, setLightState] = useState(startState);
  const timerRef = useRef(0);
  const stateRef = useRef(startState);
  const violationCooldown = useRef(0);
  const wasInZone = useRef(false);

  const getDuration = (s) => {
    if (s === TL_STATE.RED)    return redDuration;
    if (s === TL_STATE.YELLOW) return yellowDuration;
    return greenDuration;
  };

  const nextState = (s) => {
    if (s === TL_STATE.RED)    return TL_STATE.GREEN;
    if (s === TL_STATE.GREEN)  return TL_STATE.YELLOW;
    return TL_STATE.RED;
  };

  useFrame((_, delta) => {
    // Advance timer
    timerRef.current += delta;
    const dur = getDuration(stateRef.current);

    if (timerRef.current >= dur) {
      timerRef.current = 0;
      const next = nextState(stateRef.current);
      stateRef.current = next;
      setLightState(next);
    }

    // Violation detection – only when stopLineZ is defined
    if (stopLineZ === undefined) return;

    violationCooldown.current = Math.max(0, violationCooldown.current - delta);

    const [px, , pz] = simStore.position;
    const speed = simStore.speed;

    // Check if vehicle is near the stop line & moving forward
    const halfW = (stopZoneWidth ?? 12) / 2;
    const xCenter = stopLineX ?? position[0];

    const inX = Math.abs(px - xCenter) < halfW;
    // Vehicle is crossing the stop line (passing through stopLineZ)
    const crossing = inX && pz > stopLineZ && pz < stopLineZ + (stopZoneDepth ?? 8);
    const isMoving = speed > 3; // km/h threshold

    if (crossing && !wasInZone.current) {
      wasInZone.current = true;
    }
    if (!crossing) {
      wasInZone.current = false;
    }

    // Violation: crossing the line while red or yellow AND moving
    if (crossing && isMoving && violationCooldown.current <= 0) {
      const cur = stateRef.current;
      if (cur === TL_STATE.RED || cur === TL_STATE.YELLOW) {
        violationCooldown.current = 4; // 4s cooldown before next violation
        simStore.trafficViolations = (simStore.trafficViolations || 0) + 1;
        simStore.metrics.trafficViolations = (simStore.metrics.trafficViolations || 0) + 1;
        onViolation?.({ state: cur, position, id });
      }
    }
  });

  return (
    <>
      {offsets.map((offset, i) => (
        <TrafficLight
          key={`${id}-${i}`}
          position={[
            position[0] + (offset[0] ?? 0),
            position[1] + (offset[1] ?? 0),
            position[2] + (offset[2] ?? 0),
          ]}
          rotation={rotations[i] ?? [0, 0, 0]}
          state={lightState}
          showLabel={i === 0}
        />
      ))}
    </>
  );
};

export default TrafficLightController;
