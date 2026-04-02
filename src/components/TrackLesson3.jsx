// Lesson 3: Changing Gears — road with 3 labeled gear gates spaced apart
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

// Gate arch with gear label colour
const GearGate = ({ x, label, color, emissive }) => (
  <group position={[x, 0, -3]}>
    {/* Left post */}
    <StaticBox position={[-0, 2, 5.5]} args={[0.4, 4, 0.4]} color={color} emissive={emissive} emissiveIntensity={0.7} />
    {/* Right post */}
    <StaticBox position={[-0, 2, -11.5]} args={[0.4, 4, 0.4]} color={color} emissive={emissive} emissiveIntensity={0.7} />
    {/* Crossbar */}
    <mesh position={[0, 4.3, -3]}>
      <boxGeometry args={[0.3, 0.4, 17]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} />
    </mesh>
    {/* Hanging label panel */}
    <mesh position={[0, 3.5, -3]}>
      <boxGeometry args={[0.15, 1.2, 3]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.8} />
    </mesh>
    {/* Ground stripe */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3]}>
      <planeGeometry args={[0.5, 17]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} opacity={0.7} transparent />
    </mesh>
  </group>
);

const TrackLesson3 = () => (
  <>
    {/* Ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 60]} />
      <meshStandardMaterial color="#3d6b3d" roughness={1} />
    </mesh>

    {/* Road */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.01, -3]} receiveShadow>
      <planeGeometry args={[200, 14]} />
      <meshStandardMaterial color="#303030" roughness={0.9} />
    </mesh>

    {/* Centre line dashes */}
    {Array.from({ length: 36 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-38 + i * 6, 0.02, -3]}>
        <planeGeometry args={[3, 0.2]} />
        <meshStandardMaterial color="#ffee00" opacity={0.6} transparent />
      </mesh>
    ))}

    {/* Road shoulders */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.02, 3.5]}>
      <planeGeometry args={[200, 0.3]} />
      <meshStandardMaterial color="#fff" opacity={0.5} transparent />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.02, -9.5]}>
      <planeGeometry args={[200, 0.3]} />
      <meshStandardMaterial color="#fff" opacity={0.5} transparent />
    </mesh>

    {/* 3 gear gates: 2nd at x=15, 3rd at x=45, 4th at x=80 */}
    <GearGate x={15}  label="2" color="#22cc44" emissive="#00ff44" />
    <GearGate x={50}  label="3" color="#ffaa00" emissive="#ffcc00" />
    <GearGate x={90}  label="4" color="#cc2222" emissive="#ff4400" />

    {/* Acceleration zone before each gate — rumble strips */}
    {[5,40,78].map((x,i) => Array.from({length:5}).map((_,j) => (
      <mesh key={`rz-${i}-${j}`} rotation={[-Math.PI/2,0,0]} position={[x+j*1.2, 0.025, -3]}>
        <planeGeometry args={[0.5, 14]} />
        <meshStandardMaterial color={j%2===0 ? "#ffcc00" : "#303030"} />
      </mesh>
    )))}

    {/* Start line */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.03, -3]}>
      <planeGeometry args={[0.5, 14]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {/* Finish line */}
    {[0,1,2,3,4,5,6].map(i => (
      <mesh key={`fl-${i}`} rotation={[-Math.PI/2,0,0]} position={[110, 0.03, -0.5 + i*-1.4]}>
        <planeGeometry args={[0.6, 1.3]} />
        <meshStandardMaterial color={i%2===0 ? "#000" : "#fff"} />
      </mesh>
    ))}

    {/* Trees along road */}
    {Array.from({ length: 20 }).map((_, i) => (
      <group key={`t${i}`}>
        <group position={[-35 + i * 11, 0, 9]}>
          <mesh position={[0,1,0]} castShadow><cylinderGeometry args={[0.3,0.4,2]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
          <mesh position={[0,3,0]} castShadow><coneGeometry args={[2,4,7]} /><meshStandardMaterial color="#1e5422" /></mesh>
        </group>
        <group position={[-35 + i * 11, 0, -15]}>
          <mesh position={[0,1,0]} castShadow><cylinderGeometry args={[0.3,0.4,2]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
          <mesh position={[0,3,0]} castShadow><coneGeometry args={[2,4,7]} /><meshStandardMaterial color="#1e5422" /></mesh>
        </group>
      </group>
    ))}
  </>
);

export default TrackLesson3;
