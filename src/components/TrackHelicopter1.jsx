/**
 * TrackHelicopter1.jsx – Helipad hover / landing zone
 */
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888" }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

const Helipad = ({ position }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[8, 32]} />
      <meshStandardMaterial color="#555" roughness={0.7} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[6, 7.5, 32]} />
      <meshStandardMaterial color="#ffdd00" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[4, 0.8]} />
      <meshStandardMaterial color="#ffdd00" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[4, 0.8]} />
      <meshStandardMaterial color="#ffdd00" />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <torusGeometry args={[6.8, 0.15, 6, 32]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    </mesh>
    {Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[
        Math.cos((Math.PI * 2 / 8) * i) * 7.2,
        0.4,
        Math.sin((Math.PI * 2 / 8) * i) * 7.2
      ]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={2} />
      </mesh>
    ))}
  </group>
);

const TrackHelicopter1 = () => (
  <>
    {/* Open terrain */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[600, 600]} />
      <meshStandardMaterial color="#7a9a5a" roughness={1} />
    </mesh>

    {/* Main base helipad */}
    <Helipad position={[0, 0.05, 0]} />

    {/* Target helipads (elevated on platforms/buildings) */}
    <StaticBox position={[80, 8, 0]} args={[20, 16, 20]} color="#666" />
    <Helipad position={[80, 16.05, 0]} />

    <StaticBox position={[0, 5, -80]} args={[16, 10, 16]} color="#777" />
    <Helipad position={[0, 10.05, -80]} />

    <StaticBox position={[-60, 12, -40]} args={[18, 24, 18]} color="#555" />
    <Helipad position={[-60, 24.05, -40]} />

    {/* Offshore platform */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, -2, 100]} receiveShadow>
      <circleGeometry args={[200, 32]} />
      <meshStandardMaterial color="#1a4a6a" roughness={0.9} />
    </mesh>
    <StaticBox position={[150, -1, 80]} args={[30, 4, 30]} color="#555" />
    <Helipad position={[150, 1.05, 80]} />

    {/* City buildings (obstacles) */}
    {[
      { pos: [30, 10, -30], h: 20, w: 12 },
      { pos: [45, 15, 20], h: 30, w: 10 },
      { pos: [-30, 8, 30], h: 16, w: 14 },
      { pos: [-50, 6, -20], h: 12, w: 10 },
      { pos: [60, 12, -50], h: 24, w: 12 },
    ].map(({ pos, h, w }, i) => (
      <StaticBox key={i} position={pos} args={[w, h, w]} color={`hsl(${210 + i * 15}, 20%, 40%)`} />
    ))}

    {/* Wind turbines as landmark */}
    <StaticBox position={[-100, 20, 50]} args={[1.5, 40, 1.5]} color="#eee" />
    <mesh position={[-100, 41, 50]} rotation={[Math.PI / 2, 0, 0]}>
      <boxGeometry args={[20, 0.3, 1]} />
      <meshStandardMaterial color="#eee" />
    </mesh>

    {/* Floating rings as waypoints */}
    {[
      { pos: [40, 15, 0], color: "#00ffcc" },
      { pos: [80, 25, -30], color: "#ff6600" },
      { pos: [-30, 20, -60], color: "#aa00ff" },
    ].map(({ pos, color }, i) => (
      <group key={`wp${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[8, 0.5, 8, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
        <pointLight color={color} intensity={3} distance={25} />
      </group>
    ))}
  </>
);

export default TrackHelicopter1;
