// Lesson 1: Starting the Car — Simple open lot, one checkpoint gate ahead
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

const TrackLesson1 = () => (
  <>
    {/* Ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 80]} />
      <meshStandardMaterial color="#4a7c4e" roughness={1} />
    </mesh>

    {/* Tarmac apron — starting area */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.01, -3]} receiveShadow>
      <planeGeometry args={[60, 14]} />
      <meshStandardMaterial color="#2e2e2e" roughness={0.95} />
    </mesh>

    {/* White start line */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.02, -3]}>
      <planeGeometry args={[0.4, 14]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {/* Dashed centre line */}
    {[-2, 2, 6, 10, 14, 18, 22, 26, 30].map((x, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, -3]}>
        <planeGeometry args={[1.5, 0.2]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}

    {/* Boundary cones / curb left */}
    {[-6, -2, 2, 6, 10, 14, 18, 22, 26, 30, 34].map((x, i) => (
      <mesh key={`cl-${i}`} position={[x, 0.3, 3.8]} castShadow>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ff3300" : "#ffffff"} />
      </mesh>
    ))}
    {/* Boundary cones right */}
    {[-6, -2, 2, 6, 10, 14, 18, 22, 26, 30, 34].map((x, i) => (
      <mesh key={`cr-${i}`} position={[x, 0.3, -9.8]} castShadow>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ff3300" : "#ffffff"} />
      </mesh>
    ))}

    {/* Checkpoint gate posts */}
    <StaticBox position={[34, 2, 4.5]}  args={[0.4, 4, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    <StaticBox position={[34, 2, -10.5]} args={[0.4, 4, 0.4]} color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    {/* Gate crossbar (visual only) */}
    <mesh position={[34, 4.2, -3]}>
      <boxGeometry args={[0.3, 0.3, 15]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
    </mesh>

    {/* Scenery: instructor hut */}
    <StaticBox position={[-12, 1.5, 10]} args={[4, 3, 4]} color="#c8a96e" />
    <mesh position={[-12, 3.3, 10]} castShadow>
      <coneGeometry args={[3.2, 1.5, 4]} />
      <meshStandardMaterial color="#8b3a3a" />
    </mesh>

    {/* Background trees */}
    {[[-20,12],[-15,14],[-8,14],[5,14],[15,14],[25,14],[35,14],[-20,-18],[-10,-18],[5,-18],[20,-18],[35,-18]].map(([x,z],i) => (
      <group key={`t${i}`} position={[x, 0, z]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 2.4]} />
          <meshStandardMaterial color="#5c3d1e" />
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
          <coneGeometry args={[1.8, 4, 7]} />
          <meshStandardMaterial color="#2a5c1a" />
        </mesh>
      </group>
    ))}
  </>
);

export default TrackLesson1;
