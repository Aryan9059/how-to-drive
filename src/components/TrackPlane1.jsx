/**
 * TrackPlane1.jsx – Airfield / takeoff zone for plane missions
 * Long runway + open sky arena
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

const TrackPlane1 = () => (
  <>
    {/* Grassy airfield ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[800, 800]} />
      <meshStandardMaterial color="#5a8a3a" roughness={1} />
    </mesh>

    {/* Main runway */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.01, 0]} receiveShadow>
      <planeGeometry args={[500, 25]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
    </mesh>

    {/* Runway centerline dashes */}
    {Array.from({ length: 30 }).map((_, i) => (
      <mesh key={`cl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-100 + i * 18, 0.02, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
    ))}

    {/* Runway threshold markings */}
    {[-1.5, 0, 1.5].map((z, i) => (
      <mesh key={`th${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-96, 0.02, z * 4]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}

    {/* Runway edge lights */}
    {Array.from({ length: 20 }).map((_, i) => (
      <group key={`rl${i}`}>
        <mesh position={[-90 + i * 20, 0.4, 13]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
        <mesh position={[-90 + i * 20, 0.4, -13]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
      </group>
    ))}

    {/* Hangar */}
    <StaticBox position={[-50, 6, -60]} args={[40, 12, 25]} color="#888" />
    {/* Tower */}
    <StaticBox position={[-60, 10, 40]} args={[5, 20, 5]} color="#aaa" />
    <StaticBox position={[-60, 22, 40]} args={[8, 4, 8]} color="#999" />
    <mesh position={[-60, 22, 40]}>
      <boxGeometry args={[8, 4, 8]} />
      <meshStandardMaterial color="#88aacc" metalness={0} roughness={0} transparent opacity={0.4} />
    </mesh>

    {/* Wind sock */}
    <StaticBox position={[-30, 5, 20]} args={[0.2, 10, 0.2]} color="#333" />
    <mesh position={[-30, 10.5, 20.8]}>
      <coneGeometry args={[0.4, 1.5, 8]} />
      <meshStandardMaterial color="#ff6600" />
    </mesh>

    {/* Checkpoint rings (altitude gates) */}
    {[0, 1, 2].map((i) => (
      <group key={`ag${i}`} position={[50 + i * 80, 15 + i * 8, 0]}>
        <mesh>
          <torusGeometry args={[12, 0.6, 8, 24]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={1} />
        </mesh>
        <pointLight color="#ffdd00" intensity={3} distance={20} />
      </group>
    ))}

    {/* Taxiways */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-70, 0.01, -30]}>
      <planeGeometry args={[60, 10]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
  </>
);

export default TrackPlane1;
