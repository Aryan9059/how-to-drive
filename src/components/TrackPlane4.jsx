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

const CHECKPOINTS = [
  { pos: [80, 20, 0], radius: 20 },
  { pos: [160, 50, 0], radius: 20 },
  { pos: [240, 35, 40], radius: 20 },
  { pos: [320, 60, -40], radius: 20 },
  { pos: [380, 30, 0], radius: 20 },
  { pos: [440, 20, 0], radius: 20 },
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
          <pointLight color={color} intensity={6} distance={40} />
          <Text position={[0, 22, 0]} fontSize={12} color="#ffffff" outlineWidth={0.4} outlineColor="#000000" anchorX="center" anchorY="middle">
            {number}
          </Text>
        </>
      )}
    </group>
  );
};

const TrackPlane4 = () => {
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

      {/* Ground Projection Shadows/Markers based on checkpoints */}
      {CHECKPOINTS.map(({ pos }, i) => (
        <group key={`gm${i}`} position={[pos[0], 0.03, pos[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[10, 20]} />
            <meshStandardMaterial color="#00ffcc" opacity={i === activeCp ? 0.4 : 0.1} transparent />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[10, 0.4, 6, 20]} />
            <meshStandardMaterial color="#00ffcc" opacity={i === activeCp ? 0.6 : 0.2} transparent />
          </mesh>
        </group>
      ))}

      {levelComplete && (
        <Html center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(10, 15, 20, 0.85)', backdropFilter: 'blur(8px)', padding: '40px 60px', borderRadius: '16px', border: '2px solid #00ffcc', boxShadow: '0 0 30px rgba(0, 255, 204, 0.3)', color: '#fff', textAlign: 'center', fontFamily: 'system-ui, sans-serif', width: 'max-content', pointerEvents: 'none' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#00ffcc', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '2.5rem' }}>Level Complete</h1>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#aaccff' }}>All checkpoints cleared!</p>
          </div>
        </Html>
      )}

      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[220, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 500]} />
        <meshStandardMaterial color="#5a8a3a" roughness={1} />
      </mesh>

      <StaticBox position={[220, 1.5, -90]} args={[440, 3, 12]} color="#7a7a8a" />
      <StaticBox position={[220, 4.5, -94]} args={[440, 3, 12]} color="#6a6a7a" />
      <StaticBox position={[220, 7.5, -98]} args={[440, 3, 12]} color="#5a5a6a" />

      {Array.from({ length: 10 }).map((_, i) => (
        <StaticBox key={`sp${i}`} position={[-100 + i * 45, 3.5, -90]} args={[1, 7, 12]} color="#555566" />
      ))}

      {/* Windmills */}
      {[[-180, 0, -80], [-180, 0, 80], [490, 0, -80], [490, 0, 80]].map(([x, y, z], i) => (
        <group key={`wt${i}`} position={[x, y, z]}>
          <mesh position={[0, 22, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 44, 8]} />
            <meshStandardMaterial color="#ddd" />
          </mesh>
          {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((a, j) => (
            <mesh key={j} position={[Math.sin(a) * 10, 44 + Math.cos(a) * 10, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[1.0, 20, 0.3]} />
              <meshStandardMaterial color="#eee" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
};

export default TrackPlane4;