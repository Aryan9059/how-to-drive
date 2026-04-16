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
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

const CHECKPOINTS = [
  { pos: [50, 15, 0], radius: 20 },
  { pos: [130, 23, 0], radius: 20 },
  { pos: [210, 31, 0], radius: 20 },
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
          <pointLight color={color} intensity={4} distance={40} />
          <Text position={[0, 18, 0]} fontSize={10} color="#ffffff" outlineWidth={0.4} outlineColor="#000000" anchorX="center" anchorY="middle">
            {number}
          </Text>
        </>
      )}
    </group>
  );
};

const TrackPlane1 = () => {
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

      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 800]} />
        <meshStandardMaterial color="#5a8a3a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-120, 0.005, 0]} receiveShadow>
        <planeGeometry args={[100, 80]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.01, 0]} receiveShadow>
        <planeGeometry args={[600, 28]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.015, 13.8]}>
        <planeGeometry args={[600, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.015, -13.8]}>
        <planeGeometry args={[600, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Details */}
      {[-9, -6, -3, 0, 3, 6, 9].map((z, i) => (
        <mesh key={`th${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.02, z]}>
          <planeGeometry args={[8, 1.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: 32 }).map((_, i) => (
        <mesh key={`cl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-76 + i * 18, 0.02, 0]}>
          <planeGeometry args={[9, 0.45]} />
          <meshStandardMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
      ))}

      {/* Obstacles & Lights */}
      {[-12, -8, -4, 0, 4, 8, 12].map((z, i) => (
        <mesh key={`thl${i}`} position={[-94, 0.3, z]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={5} />
        </mesh>
      ))}
      <StaticBox position={[-60, 9, -80]} args={[60, 18, 35]} color="#8a8a8a" />
      <StaticBox position={[-60, 9, -62.5]} args={[55, 16, 0.5]} color="#666" />
      <StaticBox position={[-150, 12, 60]} args={[8, 24, 8]} color="#aaa" />
      <mesh position={[-150, 26, 60]}>
        <boxGeometry args={[12, 5, 12]} />
        <meshStandardMaterial color="#88aacc" metalness={0.1} roughness={0} transparent opacity={0.45} />
      </mesh>
    </>
  );
};

export default TrackPlane1;