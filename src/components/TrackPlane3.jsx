import { useRef, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import simStore from "../simStore";

const StaticBox = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

const WallSegment = ({ x, zSide, width, height, color }) => (
  <StaticBox position={[x, height / 2, zSide]} args={[width, height, 8]} color={color} />
);

const CHECKPOINTS = [
  { pos: [0, 20, 0], radius: 20 },
  { pos: [80, 20, 0], radius: 20 },
  { pos: [160, 20, 0], radius: 20 },
  { pos: [240, 20, 0], radius: 20 },
];

const CheckpointRing = ({ position, number, status }) => {
  const ringRef = useRef();
  useFrame(() => {
    if (status === "active" && ringRef.current) ringRef.current.rotation.y += 0.015;
  });

  if (status === "completed") return null;

  const isActive = status === "active";
  const color = isActive ? "#00ffcc" : "#444444";
  const emissiveInt = isActive ? 1.5 : 0;

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[isActive ? 14 : 12, 0.8, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveInt} transparent opacity={isActive ? 0.8 : 0.2} />
      </mesh>
      {isActive && (
        <>
          <pointLight color={color} intensity={5} distance={30} />
          <Text position={[0, 18, 0]} fontSize={10} color="#ffffff" outlineWidth={0.4} outlineColor="#000000" anchorX="center" anchorY="middle">
            {number}
          </Text>
        </>
      )}
    </group>
  );
};

const TrackPlane3 = () => {
  const [activeCp, setActiveCp] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  useFrame(() => {
    if (levelComplete) return;
    const pos = simStore.position;
    if (!pos || pos.length < 3) return;

    const currentCp = CHECKPOINTS[activeCp];
    const dist = Math.sqrt(
      Math.pow(pos[0] - currentCp.pos[0], 2) + Math.pow(pos[1] - currentCp.pos[1], 2) + Math.pow(pos[2] - currentCp.pos[2], 2)
    );

    if (dist <= currentCp.radius) {
      if (activeCp < CHECKPOINTS.length - 1) setActiveCp(activeCp + 1);
      else setLevelComplete(true);
    }
  });

  const wallSections = [
    { xCenter: -60, width: 40, heightL: 55, heightR: 62 },
    { xCenter: 0, width: 50, heightL: 68, heightR: 58 },
    { xCenter: 60, width: 50, heightL: 52, heightR: 72 },
    { xCenter: 120, width: 50, heightL: 70, heightR: 60 },
    { xCenter: 180, width: 50, heightL: 58, heightR: 65 },
    { xCenter: 240, width: 50, heightL: 65, heightR: 55 },
    { xCenter: 298, width: 40, heightL: 50, heightR: 60 },
  ];
  const rockColors = ["#7a6a55", "#7c6e5a", "#8a7060", "#7e6c58", "#8c7262"];

  return (
    <>
      {CHECKPOINTS.map((cp, index) => {
        let status = "future";
        if (index === activeCp) status = "active";
        if (index < activeCp) status = "completed";
        return <CheckpointRing key={`cp-${index}`} position={cp.pos} number={index + 1} status={status} />;
      })}

      {levelComplete && (
        <Html center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(10, 15, 20, 0.85)', backdropFilter: 'blur(8px)', padding: '40px 60px', borderRadius: '16px', border: '2px solid #00ffcc', boxShadow: '0 0 30px rgba(0, 255, 204, 0.3)', color: '#fff', textAlign: 'center', fontFamily: 'system-ui, sans-serif', width: 'max-content', pointerEvents: 'none' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#00ffcc', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '2.5rem' }}>Level Complete</h1>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#aaccff' }}>All checkpoints cleared!</p>
          </div>
        </Html>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, 0, 0]} receiveShadow>
        <planeGeometry args={[800, 200]} />
        <meshStandardMaterial color="#9a8870" roughness={1} />
      </mesh>

      {wallSections.map(({ xCenter, width, heightL, heightR }, i) => {
        const color = rockColors[i % rockColors.length];
        return (
          <group key={i}>
            <WallSegment x={xCenter} zSide={-24} width={width} height={heightL} color={color} />
            <WallSegment x={xCenter} zSide={24} width={width} height={heightR} color={rockColors[(i + 2) % rockColors.length]} />
          </group>
        );
      })}

      <StaticBox position={[-88, 25, -35]} args={[25, 50, 8]} rotation={[0, 0.25, 0]} color="#7a6a55" />
      <StaticBox position={[-88, 25, 35]} args={[25, 50, 8]} rotation={[0, -0.25, 0]} color="#7a6a55" />

      {[50, 140, 230].map((x, i) => (
        <group key={`br${i}`}>
          <mesh position={[x, 42, 0]} castShadow>
            <boxGeometry args={[12, 6, 46]} />
            <meshStandardMaterial color={rockColors[i % rockColors.length]} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default TrackPlane3;