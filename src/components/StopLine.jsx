import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";

const StopLine = ({
  position,
  width = 10,
  zoneDepth = 6,
  onStop,
  requiredSpeed = 0.8,
}) => {
  const triggered = useRef(false);
  const landRef = useRef();

  useFrame(() => {
    if (triggered.current) return;
    const [lx, , lz] = position;
    const [px, , pz] = simPos();
    const speed = window._simSpeed || 0;

    const inX = Math.abs(px - lx) < width / 2;
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
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width, 0.04, 0.4]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={landRef} position={[0, 0.01, zoneDepth / 2]}>
        <boxGeometry args={[width, 0.04, zoneDepth]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

export default StopLine;
