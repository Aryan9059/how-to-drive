import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.8} />
    </mesh>
  );
};

const Footpath = ({ position, args }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#b3b3b3" roughness={0.9} />
  </mesh>
);

const GearGate = ({ x, label, color, emissive }) => (
  <group position={[x, 0, -3]}>
    <StaticBox position={[-0, 2, 5.5]} args={[0.4, 4, 0.4]} color={color} emissive={emissive} emissiveIntensity={0.7} />
    <StaticBox position={[-0, 2, -11.5]} args={[0.4, 4, 0.4]} color={color} emissive={emissive} emissiveIntensity={0.7} />
    <mesh position={[0, 4.3, -3]}>
      <boxGeometry args={[0.3, 0.4, 17]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0, 3.5, -3]}>
      <boxGeometry args={[0.15, 1.2, 3]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.8} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
      <planeGeometry args={[0.5, 17]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} opacity={0.7} transparent />
    </mesh>
  </group>
);

const TrackLesson3 = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[100, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 100]} />
      <meshStandardMaterial color="#3d6b3d" roughness={1} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, 0.01, -3]} receiveShadow>
      <planeGeometry args={[300, 14]} />
      <meshStandardMaterial color="#303030" roughness={0.9} />
    </mesh>

    <Footpath position={[120, 0.1, 4.75]} args={[300, 0.2, 1.5]} />
    <Footpath position={[120, 0.1, -10.75]} args={[300, 0.2, 1.5]} />

    {Array.from({ length: 50 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-25 + i * 6, 0.02, -3]}>
        <planeGeometry args={[3, 0.2]} />
        <meshStandardMaterial color="#ffee00" opacity={0.6} transparent />
      </mesh>
    ))}

    <GearGate x={60} label="2" color="#22cc44" emissive="#00ff44" />
    <GearGate x={140} label="3" color="#ffaa00" emissive="#ffcc00" />
    <GearGate x={220} label="4" color="#cc2222" emissive="#ff4400" />

    {[45, 125, 205].map((x, i) => Array.from({ length: 5 }).map((_, j) => (
      <mesh key={`rz-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[x + j * 1.2, 0.025, -3]}>
        <planeGeometry args={[0.5, 14]} />
        <meshStandardMaterial color={j % 2 === 0 ? "#ffcc00" : "#303030"} />
      </mesh>
    )))}

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.03, -3]}>
      <planeGeometry args={[0.5, 14]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <mesh key={`fl-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[260, 0.03, -0.5 + i * -1.4]}>
        <planeGeometry args={[0.6, 1.3]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#000" : "#fff"} />
      </mesh>
    ))}

    <StaticBox position={[280, 3, -3]} args={[2, 6, 16]} color="#222" />

    {Array.from({ length: 25 }).map((_, i) => (
      <group key={`bldg-${i}`}>
        <StaticBox position={[-20 + i * 12, 6, 12]} args={[8, 12 + Math.random() * 8, 8]} color="#404040" />
        <StaticBox position={[-20 + i * 12, 8, -18]} args={[8, 16 + Math.random() * 10, 8]} color="#2c3e50" />
      </group>
    ))}
  </>
);

export default TrackLesson3;