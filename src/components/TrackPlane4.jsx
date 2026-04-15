
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

const GATE_DATA = [
  { pos: [80, 20, 0],    color: "#00ffcc", radius: 15 },
  { pos: [160, 50, 0],   color: "#ffdd00", radius: 14 },
  { pos: [240, 35, 40],  color: "#ff6600", radius: 14 },
  { pos: [320, 60, -40], color: "#cc44ff", radius: 14 },
  { pos: [380, 30, 0],   color: "#ff4444", radius: 15 },
  { pos: [440, 20, 0],   color: "#44ffaa", radius: 15 },
];

const TrackPlane4 = () => (
  <>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[220, 0, 0]} receiveShadow>
      <planeGeometry args={[700, 500]} />
      <meshStandardMaterial color="#5a8a3a" roughness={1} />
    </mesh>

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-30, 0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 24]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
    </mesh>
    {Array.from({ length: 5 }).map((_, i) => (
      <mesh key={`sc${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-62 + i * 14, 0.02, 0]}>
        <planeGeometry args={[7, 0.4]} />
        <meshStandardMaterial color="#fff" opacity={0.8} transparent />
      </mesh>
    ))}

    {}
    {GATE_DATA.map(({ pos, color }, i) => (
      <group key={`nm${i}`} position={[pos[0], 0.03, pos[2]]}>
        {}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[10, 20]} />
          <meshStandardMaterial color={color} opacity={0.25} transparent />
        </mesh>
        {}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[10, 0.4, 6, 20]} />
          <meshStandardMaterial color={color} opacity={0.6} transparent />
        </mesh>
      </group>
    ))}

    {}
    {GATE_DATA.map(({ pos, color, radius }, i) => (
      <group key={`gate${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[radius, 0.85, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
        </mesh>
        <pointLight color={color} intensity={6} distance={40} />
        {}
        <mesh>
          <sphereGeometry args={[1.0, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.4} />
        </mesh>
      </group>
    ))}

    {}
    {}
    {[
      [120, 35, 0], [200, 42, 10], [280, 48, 20], [350, 45, -20], [410, 25, -10],
    ].map(([x, y, z], i) => (
      <mesh key={`fl${i}`} position={[x, y, z]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#aaaaff" emissive="#aaaaff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
    ))}

    {}
    {}
    <StaticBox position={[220, 1.5, -90]} args={[440, 3, 12]} color="#7a7a8a" />
    <StaticBox position={[220, 4.5, -94]} args={[440, 3, 12]} color="#6a6a7a" />
    <StaticBox position={[220, 7.5, -98]} args={[440, 3, 12]} color="#5a5a6a" />
    {}
    {Array.from({ length: 10 }).map((_, i) => (
      <StaticBox key={`sp${i}`}
        position={[-100 + i * 45, 3.5, -90]}
        args={[1, 7, 12]}
        color="#555566"
      />
    ))}

    {}
    <StaticBox position={[220, 5, -108]} args={[20, 10, 10]} color="#6a6a7a" />
    {}
    <mesh position={[220, 7, -103]}>
      <boxGeometry args={[18, 4, 0.4]} />
      <meshStandardMaterial color="#88aadd" transparent opacity={0.4} />
    </mesh>

    {}
    {}
    <StaticBox position={[220, 1.0, 130]} args={[680, 2, 1.5]} color="#cc2200" />
    {}
    <StaticBox position={[220, 1.0, -130]} args={[680, 2, 1.5]} color="#cc2200" />

    {}
    <StaticBox position={[-5, 6, 14]} args={[0.4, 12, 0.4]} color="#ffdd00" />
    <StaticBox position={[-5, 6, -14]} args={[0.4, 12, 0.4]} color="#ffdd00" />
    <mesh position={[-5, 12.2, 0]}>
      <boxGeometry args={[0.3, 0.3, 28]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.8} />
    </mesh>
    <pointLight position={[-5, 11, 0]} color="#ffdd00" intensity={6} distance={30} />

    {}
    {[[-180, 0, -80], [-180, 0, 80], [490, 0, -80], [490, 0, 80]].map(([x, y, z], i) => (
      <group key={`wt${i}`} position={[x, y, z]}>
        <mesh position={[0, 22, 0]}>
          <cylinderGeometry args={[0.5, 0.8, 44, 8]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
        {}
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

export default TrackPlane4;
