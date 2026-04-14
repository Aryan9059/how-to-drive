/**
 * TrackBike1.jsx – City Slalom track for bike missions
 * A winding urban course with tight corners and cone slalom sections.
 */
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

const Cone = ({ position }) => (
  <mesh position={position} castShadow>
    <coneGeometry args={[0.25, 0.7, 8]} />
    <meshStandardMaterial color="#ff4400" />
  </mesh>
);

const TrackBike1 = () => (
  <>
    {/* Ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color="#4a7c4e" roughness={1} />
    </mesh>

    {/* Main straight road */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.01, 0]} receiveShadow>
      <planeGeometry args={[160, 10]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* Winding section – Turn 1 curving south */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, 0.01, -25]} receiveShadow>
      <planeGeometry args={[10, 50]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* Turn 2 heading back west */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.01, -50]} receiveShadow>
      <planeGeometry args={[90, 10]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* Barriers */}
    {[-5.5, 5.5].map((z, i) =>
      Array.from({ length: 20 }).map((_, j) => (
        <StaticBox key={`b${i}${j}`} position={[-20 + j * 10, 0.5, z]} args={[1.5, 1, 0.4]} color={i === 0 ? "#cc2200" : "#cc2200"} />
      ))
    )}

    {/* Cone slalom on main straight */}
    {Array.from({ length: 10 }).map((_, i) => (
      <Cone key={`cone${i}`} position={[10 + i * 9, 0.35, i % 2 === 0 ? 2 : -2]} />
    ))}

    {/* Street lights */}
    {Array.from({ length: 8 }).map((_, i) => (
      <group key={`sl${i}`} position={[-10 + i * 16, 0, 5.5]}>
        <StaticBox position={[0, 3, 0]} args={[0.15, 6, 0.15]} color="#333" />
        <mesh position={[0, 5.9, 0.8]}>
          <boxGeometry args={[0.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#ffffee" emissive="#ffddaa" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0, 5.5, 0.8]} intensity={1.5} distance={18} color="#ffddaa" />
      </group>
    ))}

    {/* Finish gate */}
    <StaticBox position={[112, 4, 5]} args={[0.4, 8, 0.4]} color="#ffdd00" />
    <StaticBox position={[112, 4, -5]} args={[0.4, 8, 0.4]} color="#ffdd00" />
    <mesh position={[112, 8.2, 0]}>
      <boxGeometry args={[0.3, 0.3, 10]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[112, 6, 0]}>
      <boxGeometry args={[0.2, 0.2, 9.5]} />
      <meshStandardMaterial color="#ff3300" emissive="#ff0000" emissiveIntensity={1} />
    </mesh>
  </>
);

export default TrackBike1;
