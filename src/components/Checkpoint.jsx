import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Checkpoint – works in both ground (XZ) and aerial (3D) modes.
 * 
 * Props:
 *  - position: [x,y,z]
 *  - radius: trigger radius
 *  - mode3D: if true, checks full 3D sphere distance (for aerial vehicles)
 *  - requireStop: if true, also requires speed ≤ requiredSpeed
 *  - requiredSpeed: threshold for requireStop
 *  - onTrigger: callback when triggered
 */
const Checkpoint = ({
  position,
  radius = 3,
  label = "",
  onTrigger,
  requireStop = false,
  requiredSpeed = 1.0,
  mode3D = false,
}) => {
  const ringRef = useRef();
  const triggered = useRef(false);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = clock.getElapsedTime() * 0.6;

    const [cx, cy, cz] = position;
    const [px, py, pz] = window._simPos || [0, 0, 0];
    const speed = window._simSpeed || 0;

    let dist;
    if (mode3D) {
      dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2 + (pz - cz) ** 2);
    } else {
      dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);
    }

    const inside = dist < radius;
    const meetsSpeed = requireStop ? speed <= requiredSpeed : true;
    const readyToTrigger = inside && meetsSpeed;

    ringRef.current.material.color.set(readyToTrigger ? "#00ff88" : "#6366f1");
    ringRef.current.material.emissive.set(readyToTrigger ? "#00ff88" : "#6366f1");

    if (readyToTrigger && !triggered.current) {
      triggered.current = true;
      onTrigger?.();
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef} rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.15, 16, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={1.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Ground poles (shown in non-3D mode only) */}
      {!mode3D && [[-radius, 0, 0], [radius, 0, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 2, z]}>
          <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Glow sphere for aerial checkpoints */}
      {mode3D && (
        <mesh>
          <sphereGeometry args={[radius * 0.3, 12, 12]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default Checkpoint;
