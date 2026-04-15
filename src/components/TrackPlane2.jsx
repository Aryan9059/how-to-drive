
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

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


const GATE_COLORS = ["#00ffcc", "#ff6600", "#6600ff", "#ffdd00", "#00ff44"];

const TrackPlane2 = () => (
  <>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[1200, 800]} />
      <meshStandardMaterial color="#7a9a5a" roughness={1} />
    </mesh>

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.01, 0]} receiveShadow>
      <planeGeometry args={[500, 18]} />
      <meshStandardMaterial color="#3a6a9a" roughness={0.05} metalness={0.2} />
    </mesh>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.005, 12]}>
      <planeGeometry args={[500, 8]} />
      <meshStandardMaterial color="#c4a86a" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.005, -12]}>
      <planeGeometry args={[500, 8]} />
      <meshStandardMaterial color="#c4a86a" roughness={1} />
    </mesh>

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-80, 0.01, 0]} receiveShadow>
      <planeGeometry args={[220, 24]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
    {}
    {Array.from({ length: 14 }).map((_, i) => (
      <mesh key={`cl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-172 + i * 16, 0.02, 0]}>
        <planeGeometry args={[8, 0.45]} />
        <meshStandardMaterial color="#fff" opacity={0.8} transparent />
      </mesh>
    ))}
    {}
    {[-8, -4, 0, 4, 8].map((z, i) => (
      <mesh key={`thb${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-175, 0.02, z]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    ))}

    {}
    {}
    <Mountain position={[100, 0, -120]} radius={55} height={80} color="#6d6d6d" />
    <Mountain position={[200, 0, -140]} radius={45} height={95} color="#707070" />
    <Mountain position={[320, 0, -100]} radius={50} height={70} color="#686868" />
    <Mountain position={[420, 0, -130]} radius={60} height={88} color="#6a6a6a" />
    {}
    <Mountain position={[200, 72, -140]} radius={12} height={25} color="#f0f0ff" />
    <Mountain position={[420, 65, -130]} radius={14} height={28} color="#f0f0ff" />

    {}
    <Mountain position={[130, 0, 110]} radius={48} height={65} color="#6a6a62" />
    <Mountain position={[280, 0, 130]} radius={55} height={78} color="#68686a" />
    <Mountain position={[390, 0, 100]} radius={42} height={62} color="#6e6e6e" />

    {}
    {Array.from({ length: 24 }).map((_, i) => (
      <PineTree key={`pt${i}`} position={[
        60 + (i % 8) * 55,
        0,
        60 + Math.floor(i / 8) * 14 + (i % 3) * 5
      ]} />
    ))}
    {Array.from({ length: 18 }).map((_, i) => (
      <PineTree key={`ptn${i}`} position={[
        80 + (i % 6) * 60,
        0,
        -55 - Math.floor(i / 6) * 12 - (i % 4) * 4
      ]} />
    ))}

    {}
    {[
      { pos: [80, 20, 0],    color: GATE_COLORS[0] },
      { pos: [160, 35, 20],  color: GATE_COLORS[1] },
      { pos: [240, 25, -15], color: GATE_COLORS[2] },
      { pos: [320, 50, 10],  color: GATE_COLORS[3] },
      { pos: [400, 40, -20], color: GATE_COLORS[4] },
    ].map(({ pos, color }, i) => (
      <group key={`gate${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[15, 0.85, 8, 28]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
        </mesh>
        <pointLight color={color} intensity={5} distance={35} />
        {}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pos[1] + 0.1, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color={color} opacity={0.35} transparent />
        </mesh>
      </group>
    ))}

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[450, 0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 22]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
    {}
    <mesh position={[450, 0.5, 0]}>
      <torusGeometry args={[18, 1.0, 8, 28]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
    </mesh>
    <pointLight position={[450, 8, 0]} color="#ffffff" intensity={5} distance={30} />

    {}
    <StaticBox position={[-175, 7, 20]} args={[0.22, 14, 0.22]} color="#333" />
    <mesh position={[-175, 14.8, 21.5]} rotation={[0.5, 0, 0]}>
      <coneGeometry args={[0.45, 1.8, 8]} />
      <meshStandardMaterial color="#ff8800" />
    </mesh>
  </>
);

export default TrackPlane2;
