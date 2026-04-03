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

const Cone = ({ position, color = "#ff3300" }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <coneGeometry args={[0.3, 0.8, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
      <meshStandardMaterial color="#fff" />
    </mesh>
  </group>
);

const TrackLesson9 = () => {
  // Drastically increased slalom cones
  const slalomCones = Array.from({ length: 25 }).map((_, i) => [10 + i * 6, i % 2 === 0 ? 3.5 : -3.5]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0, -3]} receiveShadow>
        <planeGeometry args={[350, 80]} />
        <meshStandardMaterial color="#4a7040" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.01, -3]} receiveShadow>
        <planeGeometry args={[350, 18]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.02, 5.8]}>
        <planeGeometry args={[350, 0.3]} />
        <meshStandardMaterial color="#fff" opacity={0.5} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.02, -11.8]}>
        <planeGeometry args={[350, 0.3]} />
        <meshStandardMaterial color="#fff" opacity={0.5} transparent />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.02, -3]}>
        <planeGeometry args={[0.5, 18]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Cone position={[5, 0, 7]} color="#ffdd00" />
      <Cone position={[5, 0, -13]} color="#ffdd00" />

      {slalomCones.map(([x, z], i) => (
        <Cone key={`sc-${i}`} position={[x, 0, z + (-3)]} color={i % 2 === 0 ? "#ff3300" : "#0044ff"} />
      ))}

      {slalomCones.map(([x, z], i) => (
        <Cone key={`sc2-${i}`} position={[x + 1.2, 0, z + (-3)]} color={i % 2 === 0 ? "#ff5500" : "#0066ff"} />
      ))}

      {/* Moved finish gate significantly forward */}
      <StaticBox position={[164, 2.5, 5.5]} args={[0.4, 5, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.6} />
      <StaticBox position={[164, 2.5, -11.5]} args={[0.4, 5, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.6} />
      <mesh position={[164, 5.3, -3]}>
        <boxGeometry args={[0.3, 0.4, 17]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>

      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <mesh key={`cf-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[164, 0.03, -10 + i * 2]}>
          <planeGeometry args={[0.6, 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#000" : "#fff"} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.015, -3]}>
        <planeGeometry args={[145, 0.3]} />
        <meshStandardMaterial color="#ffcc00" opacity={0.25} transparent />
      </mesh>

      {Array.from({ length: 36 }).map((_, i) => (
        <group key={`t${i}`}>
          <group position={[-30 + i * 10, 0, 11]}>
            <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.3, 0.4, 2.4]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
            <mesh position={[0, 3.5, 0]} castShadow><sphereGeometry args={[1.8, 8, 7]} /><meshStandardMaterial color="#1a5c10" /></mesh>
          </group>
          <group position={[-30 + i * 10, 0, -18]}>
            <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.3, 0.4, 2.4]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
            <mesh position={[0, 3.5, 0]} castShadow><sphereGeometry args={[1.8, 8, 7]} /><meshStandardMaterial color="#1a5c10" /></mesh>
          </group>
        </group>
      ))}
    </>
  );
};

export default TrackLesson9;