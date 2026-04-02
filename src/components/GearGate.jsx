import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { GEAR_NAMES } from "../gameConfig";
import simStore from "../simStore";

// A gate that checks the car is in the required gear when passing through.
const GearGate = ({ position, requiredGear, radius = 3.5, onPass, onFail }) => {
  const ringRef = useRef();
  const triggered = useRef(false);
  const color = { 2: "#fbbf24", 3: "#f97316", 4: "#ef4444" }[requiredGear] || "#6366f1";

  useFrame(({ clock }) => {
    if (!ringRef.current || triggered.current) return;
    ringRef.current.rotation.y = clock.getElapsedTime() * 0.5;

    const [cx, , cz] = position;
    const [px, , pz] = simStore.position;
    const dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);

    if (dist < radius) {
      triggered.current = true;
      if (simStore.gear === requiredGear) {
        ringRef.current.material.color.set("#00ff88");
        ringRef.current.material.emissive.set("#00ff88");
        onPass?.();
      } else {
        ringRef.current.material.color.set("#ff3333");
        ringRef.current.material.emissive.set("#ff3333");
        onFail?.();
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef} rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.18, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} transparent opacity={0.85} />
      </mesh>
      {/* Gear label board */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[3, 1.2, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0, 4.5, 0.06]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Gear {requiredGear}
      </Text>
    </group>
  );
};

export default GearGate;
