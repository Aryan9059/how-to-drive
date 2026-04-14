/**
 * TrackPlane2.jsx – Aerial obstacle course
 */
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888" }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

const TrackPlane2 = () => (
  <>
    {/* Terrain */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#8ab56a" roughness={1} />
    </mesh>

    {/* Take-off strip */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-100, 0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 24]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>

    {/* Runway centerline */}
    {Array.from({ length: 15 }).map((_, i) => (
      <mesh key={`cl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-180 + i * 14, 0.02, 0]}>
        <planeGeometry args={[6, 0.4]} />
        <meshStandardMaterial color="#fff" opacity={0.8} transparent />
      </mesh>
    ))}

    {/* Aerial gate rings at various heights and positions */}
    {[
      { pos: [80, 20, 0], color: "#00ffcc" },
      { pos: [160, 35, 20], color: "#ff6600" },
      { pos: [240, 25, -15], color: "#6600ff" },
      { pos: [320, 50, 10], color: "#ffdd00" },
      { pos: [400, 40, -20], color: "#00ff44" },
    ].map(({ pos, color }, i) => (
      <group key={`gate${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[15, 0.8, 8, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
        <pointLight color={color} intensity={4} distance={30} />
      </group>
    ))}

    {/* Mountain obstacles */}
    {[
      { pos: [120, 0, -80], h: 40 },
      { pos: [200, 0, 90], h: 55 },
      { pos: [300, 0, -60], h: 35 },
    ].map(({ pos, h }, i) => (
      <mesh key={`mt${i}`} position={pos} castShadow>
        <coneGeometry args={[30, h, 8]} />
        <meshStandardMaterial color="#6d6d6d" roughness={1} />
      </mesh>
    ))}

    {/* Finish area */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[430, 0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 50]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
    <mesh position={[430, 0.5, 0]}>
      <torusGeometry args={[20, 1, 8, 24]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
    </mesh>
  </>
);

export default TrackPlane2;
