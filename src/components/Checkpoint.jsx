import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Glowing ring checkpoint. Turns green when car is inside AND condition is met.
const Checkpoint = ({ position, radius = 3, label = "", onTrigger, requireStop = false, requiredSpeed = 1.0 }) => {
  const ringRef = useRef();
  const triggered = useRef(false);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    // Idle spin animation
    ringRef.current.rotation.y = clock.getElapsedTime() * 0.6;

    // Distance check
    const [cx, cy, cz] = position;
    const [px, , pz] = window._simPos || [0, 0, 0]; // updated by LessonMonitor
    const speed = window._simSpeed || 0;
    
    const dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);
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
      {/* Vertical guide poles */}
      {[[-radius, 0, 0], [radius, 0, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 2, z]}>
          <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

export default Checkpoint;
