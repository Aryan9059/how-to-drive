import { useRef, useState } from "react";
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import simStore from "../simStore";

// --- Static Physics Objects ---
const StaticBox = ({ position, args, color = "#888" }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

// --- Procedural Environment Assets ---
const Tree = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh position={[0, 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.4, 0.8, 4, 8]} />
      <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
    </mesh>
    {/* Leaves Layer 1 */}
    <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
      <coneGeometry args={[3, 5, 8]} />
      <meshStandardMaterial color="#2d4c1e" roughness={0.8} />
    </mesh>
    {/* Leaves Layer 2 */}
    <mesh position={[0, 7, 0]} castShadow receiveShadow>
      <coneGeometry args={[2.2, 4, 8]} />
      <meshStandardMaterial color="#355823" roughness={0.8} />
    </mesh>
    {/* Leaves Layer 3 */}
    <mesh position={[0, 9, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.5, 3, 8]} />
      <meshStandardMaterial color="#3e6629" roughness={0.8} />
    </mesh>
  </group>
);

const Rock = ({ position, scale = 1, rotation = [0, 0, 0] }) => (
  <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
    <dodecahedronGeometry args={[2, 0]} />
    <meshStandardMaterial color="#666677" roughness={0.8} metalness={0.1} />
  </mesh>
);

const WindTurbine = ({ position, rotationY = 0 }) => {
  const bladesRef = useRef();

  useFrame((state, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 1.5;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Tower */}
      <mesh position={[0, 15, 0]} castShadow>
        <cylinderGeometry args={[0.5, 1.2, 30, 16]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
      </mesh>
      {/* Nacelle & Hub */}
      <group position={[0, 30, 0]}>
        <mesh position={[0, 0, -1]} castShadow>
          <boxGeometry args={[1.5, 1.5, 4]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Rotating Blades */}
        <group ref={bladesRef} position={[0, 0, 1.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
            <mesh key={i} rotation={[0, 0, angle]} position={[Math.sin(angle) * 6, Math.cos(angle) * 6, 0]} castShadow>
              <boxGeometry args={[0.4, 12, 0.1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// --- Helipad ---
const Helipad = ({ position }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[8, 32]} />
      <meshStandardMaterial color="#444" roughness={0.7} />
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
  </group>
);

// --- Game Logic Constants ---
const CHECKPOINTS = [
  { pos: [0, 15, -40], radius: 10 },
  { pos: [50, 25, -60], radius: 12 },
  { pos: [120, 15, -20], radius: 12 },
  { pos: [150, 8, 50], radius: 12 },
  { pos: [80, 30, 20], radius: 12 },
  { pos: [-20, 40, -10], radius: 12 },
  { pos: [-60, 28, -40], radius: 10 }
];

const CheckpointRing = ({ position, number, status }) => {
  const ringRef = useRef();

  useFrame(() => {
    if (status === "active" && ringRef.current) {
      ringRef.current.rotation.y += 0.015;
    }
  });

  if (status === "completed") return null;

  const isActive = status === "active";
  const color = isActive ? "#00ffcc" : "#444444";
  const emissiveInt = isActive ? 1.5 : 0;

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[isActive ? 10 : 8, 0.6, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveInt}
          transparent
          opacity={isActive ? 0.8 : 0.2}
        />
      </mesh>

      {isActive && (
        <>
          <pointLight color={color} intensity={4} distance={30} />
          <Text
            position={[0, 12, 0]}
            fontSize={8}
            color="#ffffff"
            outlineWidth={0.4}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {number}
          </Text>
        </>
      )}
    </group>
  );
};

const TrackHelicopter1 = () => {
  const [activeCp, setActiveCp] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  // Game Loop
  useFrame(() => {
    if (levelComplete) return;

    const pos = simStore.position;
    if (!pos || pos.length < 3) return;

    const currentCp = CHECKPOINTS[activeCp];

    const dist = Math.sqrt(
      Math.pow(pos[0] - currentCp.pos[0], 2) +
      Math.pow(pos[1] - currentCp.pos[1], 2) +
      Math.pow(pos[2] - currentCp.pos[2], 2)
    );

    if (dist <= currentCp.radius) {
      if (activeCp < CHECKPOINTS.length - 1) {
        setActiveCp(activeCp + 1);
      } else {
        setLevelComplete(true);
      }
    }
  });

  return (
    <>
      {/* --- Game Overlays --- */}
      {CHECKPOINTS.map((cp, index) => {
        let status = "future";
        if (index === activeCp) status = "active";
        if (index < activeCp) status = "completed";
        return (
          <CheckpointRing key={`cp-${index}`} position={cp.pos} number={index + 1} status={status} />
        );
      })}

      {levelComplete && (
        <Html center zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(10, 15, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '40px 60px',
            borderRadius: '16px',
            border: '2px solid #00ffcc',
            boxShadow: '0 0 30px rgba(0, 255, 204, 0.3)',
            color: '#fff',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            width: 'max-content',
            pointerEvents: 'none'
          }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#00ffcc', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '2.5rem' }}>
              Level Complete
            </h1>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#aaccff' }}>All checkpoints cleared!</p>
          </div>
        </Html>
      )}

      {/* --- Core Terrain --- */}
      {/* Grass Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color="#4a6b3a" roughness={0.9} />
      </mesh>

      {/* Glossy Water Body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, -1, 100]} receiveShadow>
        <circleGeometry args={[200, 64]} />
        <meshStandardMaterial
          color="#1a8a9a"
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Ocean Floor (Under the water) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, -4, 100]} receiveShadow>
        <circleGeometry args={[200, 64]} />
        <meshStandardMaterial color="#112233" roughness={1} />
      </mesh>

      {/* --- Landing Zones --- */}
      <Helipad position={[0, 0.05, 0]} />

      <StaticBox position={[150, -1, 80]} args={[30, 4, 30]} color="#3a4552" />
      <Helipad position={[150, 1.05, 80]} />

      <StaticBox position={[80, 8, 0]} args={[20, 16, 20]} color="#666" />
      <Helipad position={[80, 16.05, 0]} />

      <StaticBox position={[0, 5, -80]} args={[16, 10, 16]} color="#777" />
      <Helipad position={[0, 10.05, -80]} />

      <StaticBox position={[-60, 12, -40]} args={[18, 24, 18]} color="#333" />
      <Helipad position={[-60, 24.05, -40]} />

      {/* --- Buildings & Obstacles --- */}
      {[
        { pos: [30, 10, -30], h: 20, w: 12 },
        { pos: [45, 15, 20], h: 30, w: 10 },
        { pos: [-30, 8, 30], h: 16, w: 14 },
        { pos: [-50, 6, -20], h: 12, w: 10 },
        { pos: [60, 12, -50], h: 24, w: 12 },
        { pos: [100, 20, -40], h: 40, w: 15 },
      ].map(({ pos, h, w }, i) => (
        <StaticBox key={`bldg-${i}`} position={pos} args={[w, h, w]} color={`hsl(${210 + i * 15}, 15%, 35%)`} />
      ))}

      {/* Antenna Tower */}
      <StaticBox position={[-100, 20, 50]} args={[1.5, 40, 1.5]} color="#eee" />
      <mesh position={[-100, 41, 50]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[20, 0.3, 1]} />
        <meshStandardMaterial color="#cc2222" />
      </mesh>

      {/* --- Diverse Scenery Elements --- */}

      {/* Pine Forests */}
      {[
        [20, 0, 40], [30, 0, 45], [15, 0, 50], [25, 0, 35],
        [-40, 0, -60], [-50, 0, -55], [-45, 0, -70], [-35, 0, -65],
        [60, 0, 70], [70, 0, 60], [65, 0, 80],
        [-80, 0, 20], [-90, 0, 30], [-75, 0, 40],
      ].map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} scale={0.8 + Math.random() * 0.6} />
      ))}

      {/* Rock Clusters */}
      {[
        [-20, 0, 50], [-23, 0, 53], [-18, 0, 55],
        [90, 0, -20], [94, 0, -18], [92, 0, -24],
        [40, 0, -80], [45, 0, -78],
      ].map((pos, i) => (
        <Rock
          key={`rock-${i}`}
          position={pos}
          scale={0.5 + Math.random()}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        />
      ))}

      {/* Wind Farm along the Coast */}
      <WindTurbine position={[180, 0, 0]} rotationY={0.5} />
      <WindTurbine position={[220, 0, -40]} rotationY={0.6} />
      <WindTurbine position={[200, 0, 40]} rotationY={0.4} />

    </>
  );
};

export default TrackHelicopter1;