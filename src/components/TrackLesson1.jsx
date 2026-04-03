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
    <meshStandardMaterial color="#999" roughness={0.9} />
  </mesh>
);

const Building = ({ position, args, color = "#555" }) => (
  <StaticBox position={position} args={args} color={color} />
);

const StreetLight = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <StaticBox position={[0, 3, 0]} args={[0.15, 6, 0.15]} color="#333" />
    <mesh position={[0, 6, 1]} castShadow>
      <boxGeometry args={[0.15, 0.15, 2]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[0, 5.9, 1.8]}>
      <boxGeometry args={[0.2, 0.1, 0.4]} />
      <meshStandardMaterial color="#ffffee" emissive="#ffddaa" emissiveIntensity={2} />
    </mesh>
    <pointLight position={[0, 5.5, 1.8]} intensity={1.5} distance={20} color="#ffddaa" />
  </group>
);

const TrackLesson1 = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 100]} />
      <meshStandardMaterial color="#4a7c4e" roughness={1} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, 0.01, -3]} receiveShadow>
      <planeGeometry args={[110, 14]} />
      <meshStandardMaterial color="#2e2e2e" roughness={0.95} />
    </mesh>

    <Footpath position={[35, 0.1, 4.5]} args={[110, 0.2, 1.5]} />
    <Footpath position={[35, 0.1, -10.5]} args={[110, 0.2, 1.5]} />

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.02, -3]}>
      <planeGeometry args={[0.4, 14]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {Array.from({ length: 15 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-2 + i * 6, 0.02, -3]}>
        <planeGeometry args={[2.5, 0.2]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}

    {Array.from({ length: 8 }).map((_, i) => (
      <group key={`bldg-${i}`}>
        <Building position={[-10 + i * 14, 4, 10]} args={[10, 8 + Math.random() * 6, 8]} color={i % 2 === 0 ? "#7b6b63" : "#5d6d7e"} />
        <Building position={[-10 + i * 14, 5, -16]} args={[10, 10 + Math.random() * 8, 8]} color={i % 3 === 0 ? "#8b5a45" : "#455a64"} />
      </group>
    ))}

    {Array.from({ length: 5 }).map((_, i) => (
      <group key={`sl-${i}`}>
        <StreetLight position={[0 + i * 20, 0, 3.5]} rotation={[0, Math.PI, 0]} />
        <StreetLight position={[10 + i * 20, 0, -9.5]} rotation={[0, 0, 0]} />
      </group>
    ))}

    <StaticBox position={[80, 2, 4.5]} args={[0.4, 4, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    <StaticBox position={[80, 2, -10.5]} args={[0.4, 4, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    <mesh position={[80, 4.2, -3]}>
      <boxGeometry args={[0.3, 0.3, 15]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    </mesh>

    {Array.from({ length: 22 }).map((_, i) => (
      <mesh key={`cl-${i}`} position={[-6 + i * 4, 0.3, 3.5]} castShadow>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ff3300" : "#ffffff"} />
      </mesh>
    ))}
  </>
);

export default TrackLesson1;