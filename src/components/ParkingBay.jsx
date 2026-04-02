import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import simStore from "../simStore";

// A painted parking bay on the ground. onParked fires when car is inside AND stopped AND handbrake.
const ParkingBay = ({
  position = [0, 0, 0],
  size = [4, 8],    // [width, depth]
  onParked,
}) => {
  const triggered = useRef(false);
  const [bw, bd] = size;

  useFrame(() => {
    if (triggered.current) return;
    const [bx, , bz] = position;
    const [px, , pz] = simStore.position;

    const inBay 
      = Math.abs(px - bx) < bw / 2
      && Math.abs(pz - bz) < bd / 2;
    const stopped  = simStore.speed < 0.5;
    const hbOn     = simStore.handbrake;

    if (inBay && stopped && hbOn) {
      triggered.current = true;
      onParked?.();
    }
  });

  return (
    <group position={position}>
      {/* Bay floor */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[bw, 0.05, bd]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.4} />
      </mesh>
      {/* Bay border lines */}
      {[[-bw / 2, 0, 0], [bw / 2, 0, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.02, 0]}>
          <boxGeometry args={[0.15, 0.05, bd]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, -bd / 2]}>
        <boxGeometry args={[bw, 0.05, 0.15]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
      {/* P symbol post */}
      <mesh position={[0, 2.5, -bd / 2 - 0.5]}>
        <boxGeometry args={[1.4, 1.0, 0.15]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export default ParkingBay;
