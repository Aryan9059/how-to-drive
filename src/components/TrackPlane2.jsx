import { useRef, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import simStore from "../simStore";

const StaticBox = ({ position, args, color = "#888" }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

const Mountain = ({ position, radius, height, color = "#6d6d6d" }) => (
  <mesh position={position} castShadow>
    <coneGeometry args={[radius, height, 9]} />
    <meshStandardMaterial color={color} roughness={1} />
  </mesh>
);

const PineTree = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.0, 0]} castShadow>
      <coneGeometry args={[0.7, 2.8, 6]} />
      <meshStandardMaterial color="#1e4a1e" roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.18, 0.8, 5]} />
      <meshStandardMaterial color="#5c3b1e" roughness={1} />
    </mesh>
  </group>
);

const CHECKPOINTS = [
  { pos: [80, 20, 0], radius: 25 },
  { pos: [160, 35, 20], radius: 25 },
  { pos: [240, 25, -15], radius: 25 },
  { pos: [320, 50, 10], radius: 25 },
  { pos: [400, 40, -20], radius: 25 },
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
        <torusGeometry args={[isActive ? 16 : 14, 0.85, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveInt} transparent opacity={isActive ? 0.8 : 0.2} />
      </mesh>
      {isActive && (
        <>
          <pointLight color={color} intensity={5} distance={40} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -position[1] + 0.1, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial color={color} opacity={0.35} transparent />
          </mesh>
          <Text position={[0, 22, 0]} fontSize={12} color="#ffffff" outlineWidth={0.4} outlineColor="#000000" anchorX="center" anchorY="middle">
            {number}
          </Text>
        </>
      )}
    </group>
  );
};

const TrackPlane2 = () => {
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

      {/* Terrain & Environment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1200, 800]} />
        <meshStandardMaterial color="#7a9a5a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 18]} />
        <meshStandardMaterial color="#3a6a9a" roughness={0.05} metalness={0.2} />
      </mesh>

      <Mountain position={[100, 0, -120]} radius={55} height={80} color="#6d6d6d" />
      <Mountain position={[200, 0, -140]} radius={45} height={95} color="#707070" />
      <Mountain position={[320, 0, -100]} radius={50} height={70} color="#686868" />
      <Mountain position={[420, 0, -130]} radius={60} height={88} color="#6a6a6a" />

      {Array.from({ length: 24 }).map((_, i) => (
        <PineTree key={`pt${i}`} position={[60 + (i % 8) * 55, 0, 60 + Math.floor(i / 8) * 14 + (i % 3) * 5]} />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <PineTree key={`ptn${i}`} position={[80 + (i % 6) * 60, 0, -55 - Math.floor(i / 6) * 12 - (i % 4) * 4]} />
      ))}
    </>
  );
};

export default TrackPlane2;