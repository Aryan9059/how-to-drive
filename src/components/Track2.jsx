// Desert Speedway — procedural oval track
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

// A single static physics + visual wall segment
const Wall = ({ position, args, color = "#c2692a", emissive = "#000" }) => {
  useBox(
    () => ({ type: "Static", args, position }),
    useRef(null)
  );
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} roughness={0.8} metalness={0.1} />
    </mesh>
  );
};

// Visual-only road tile (no physics — ground plane handles it)
const RoadTile = ({ position, args, color = "#d4955a" }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
  </mesh>
);

const Track2 = () => {
  // Layout: outer bounds ±27 x ±21, inner hole ±15 x ±9, track width ~12
  return (
    <>
      {/* ── Sandy background ground ── */}
      <mesh position={[0, -0.05, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#c8994a" roughness={1} />
      </mesh>

      {/* ── Interior desert floor ── */}
      <RoadTile position={[0, 0.01, 0]} args={[30, 0.1, 18]} color="#d4a84e" />

      {/* ── Road surface segments ── */}
      {/* South straight */}
      <RoadTile position={[0, 0.01, -15]} args={[54, 0.1, 12]} color="#b87c3a" />
      {/* North straight */}
      <RoadTile position={[0, 0.01, 15]} args={[54, 0.1, 12]} color="#b87c3a" />
      {/* West straight */}
      <RoadTile position={[-21, 0.01, 0]} args={[12, 0.1, 18]} color="#b87c3a" />
      {/* East straight */}
      <RoadTile position={[21, 0.01, 0]} args={[12, 0.1, 18]} color="#b87c3a" />
      {/* Corners */}
      <RoadTile position={[-21, 0.01, -15]} args={[12, 0.1, 12]} color="#b87c3a" />
      <RoadTile position={[21, 0.01, -15]} args={[12, 0.1, 12]} color="#b87c3a" />
      <RoadTile position={[-21, 0.01, 15]} args={[12, 0.1, 12]} color="#b87c3a" />
      <RoadTile position={[21, 0.01, 15]} args={[12, 0.1, 12]} color="#b87c3a" />

      {/* ── Outer walls (sandstone red) ── */}
      <Wall position={[0, 2, -22]}  args={[58, 4, 2]} color="#a0522d" />
      <Wall position={[0, 2, 22]}   args={[58, 4, 2]} color="#a0522d" />
      <Wall position={[-28, 2, 0]}  args={[2, 4, 48]} color="#a0522d" />
      <Wall position={[28, 2, 0]}   args={[2, 4, 48]} color="#a0522d" />

      {/* ── Inner walls ── */}
      <Wall position={[0, 2, -8.5]}  args={[32, 4, 2]} color="#8b4513" />
      <Wall position={[0, 2, 8.5]}   args={[32, 4, 2]} color="#8b4513" />
      <Wall position={[-16, 2, 0]}   args={[2, 4, 18]} color="#8b4513" />
      <Wall position={[16, 2, 0]}    args={[2, 4, 18]} color="#8b4513" />

      {/* ── Chicane obstacles on straights ── */}
      <Wall position={[-5, 1.5, -15]} args={[2, 3, 5]} color="#cd853f" />
      <Wall position={[5, 1.5, 15]}   args={[2, 3, 5]} color="#cd853f" />

      {/* ── Decorative pillars at outer corners ── */}
      {[[-27,-21],[27,-21],[-27,21],[27,21]].map(([x,z],i) => (
        <Wall key={i} position={[x, 3, z]} args={[2, 6, 2]} color="#7a3c10" />
      ))}
    </>
  );
};

export default Track2;
