import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";

// A stop-line on the ground with a warning zone. onStop fires when car is in zone AND stopped.
const StopLine = ({
  position,        // [x,y,z] center of the line
  width = 10,
  zoneDepth = 6,   // depth of the stopping zone in front of line
  onStop,          // called once when car stops in zone
  requiredSpeed = 0.8,  // km/h threshold for "stopped"
}) => {
  const triggered = useRef(false);
  const landRef = useRef();

  useFrame(() => {
    if (triggered.current) return;
    const [lx, , lz] = position;
    const [px, , pz] = simPos();
    const speed = window._simSpeed || 0;

    const inX   = Math.abs(px - lx) < width / 2;
    const inZone = pz > lz && pz < lz + zoneDepth;
    const stopped = speed < requiredSpeed;

    if (inX && inZone && stopped) {
      triggered.current = true;
      onStop?.();
    }
  });

  const simPos = () => window._simPos || [0, 0, 0];

  return (
    <group position={position}>
      {/* Red stop line */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width, 0.04, 0.4]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
      {/* Yellow warning zone */}
      <mesh ref={landRef} position={[0, 0.01, zoneDepth / 2]}>
        <boxGeometry args={[width, 0.04, zoneDepth]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

export default StopLine;
