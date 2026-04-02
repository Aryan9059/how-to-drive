// Lesson 2: Moving & Stopping — straight road with a marked stop line at the end
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

const TrackLesson2 = () => (
  <>
    {/* Grassy ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 60]} />
      <meshStandardMaterial color="#4a7040" roughness={1} />
    </mesh>

    {/* Road surface — long straight */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0.01, -3]} receiveShadow>
      <planeGeometry args={[130, 10]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>

    {/* Road shoulder markings */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0.02, 1.8]}>
      <planeGeometry args={[130, 0.25]} />
      <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0.02, -7.8]}>
      <planeGeometry args={[130, 0.25]} />
      <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
    </mesh>

    {/* Centre dashes */}
    {Array.from({ length: 22 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-25 + i * 6, 0.02, -3]}>
        <planeGeometry args={[3, 0.2]} />
        <meshStandardMaterial color="#ffee00" opacity={0.8} transparent />
      </mesh>
    ))}

    {/* Speed markers on road every 10 units */}
    {[0, 10, 20, 30, 40, 50, 60].map((x, i) => (
      <mesh key={`sm-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, -3]}>
        <planeGeometry args={[0.15, 10]} />
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    ))}

    {/* Stop line — bold red/white zebra */}
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={`sl-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[72, 0.03, -0.5 + i * -1.5]}>
        <planeGeometry args={[0.6, 1.4]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ff2200" : "#ffffff"} />
      </mesh>
    ))}

    {/* Stop sign post */}
    <StaticBox position={[73, 1.5, 2.5]} args={[0.15, 3, 0.15]} color="#888" />
    <mesh position={[73, 3.2, 2.5]} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 0.12, 8]} />
      <meshStandardMaterial color="#cc0000" emissive="#aa0000" emissiveIntensity={0.4} />
    </mesh>

    {/* Braking zone indicator — yellow rumble strips */}
    {[58, 60, 62, 64, 66, 68, 70].map((x, i) => (
      <mesh key={`rz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, -3]}>
        <planeGeometry args={[0.5, 10]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ffcc00" : "#2c2c2c"} />
      </mesh>
    ))}

    {/* Wall blocker at end so car doesn't overshoot */}
    <StaticBox position={[80, 2, -3]} args={[1, 4, 12]} color="#555" />

    {/* Guardrails along sides */}
    {Array.from({ length: 14 }).map((_, i) => (
      <group key={`gr-${i}`}>
        <StaticBox position={[-30 + i * 10, 0.5, 3.2]} args={[9.5, 0.25, 0.12]} color="#cccccc" />
        <StaticBox position={[-30 + i * 10, 0.5, -9.2]} args={[9.5, 0.25, 0.12]} color="#cccccc" />
      </group>
    ))}

    {/* Trees flanking road */}
    {Array.from({ length: 14 }).map((_, i) => (
      <group key={`tr-${i}`}>
        <group position={[-28 + i * 9, 0, 7]}>
          <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.28, 0.35, 2]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0, 3.2, 0]} castShadow><sphereGeometry args={[1.5, 7, 6]} /><meshStandardMaterial color="#1e5c14" /></mesh>
        </group>
        <group position={[-28 + i * 9, 0, -14]}>
          <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.28, 0.35, 2]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0, 3.2, 0]} castShadow><sphereGeometry args={[1.5, 7, 6]} /><meshStandardMaterial color="#1e5c14" /></mesh>
        </group>
      </group>
    ))}
  </>
);

export default TrackLesson2;
