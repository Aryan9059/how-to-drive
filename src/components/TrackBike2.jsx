/**
 * TrackBike2.jsx – Mountain hairpin track for bike missions
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

const TrackBike2 = () => (
  <>
    {/* Ground */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#6b7c52" roughness={1} />
    </mesh>

    {/* Road segment 1 - going east */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, 0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Bend south */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[110, 0.01, -20]} receiveShadow>
      <planeGeometry args={[12, 40]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Road segment 2 - going west */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, 0.01, -40]} receiveShadow>
      <planeGeometry args={[120, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Bend south 2 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.01, -60]} receiveShadow>
      <planeGeometry args={[12, 40]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Road segment 3 - going east again */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, 0.01, -80]} receiveShadow>
      <planeGeometry args={[120, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Guardrails on curves */}
    {Array.from({ length: 8 }).map((_, i) => (
      <StaticBox key={`gr${i}`} position={[113, 1, -5 - i * 4.5]} args={[0.5, 2, 0.5]} color="#cc4400" />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <StaticBox key={`gr2${i}`} position={[-13, 1, -45 - i * 4.5]} args={[0.5, 2, 0.5]} color="#cc4400" />
    ))}

    {/* Center lane dashes */}
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={`ld${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0 + i * 10, 0.02, 0]}>
        <planeGeometry args={[4, 0.2]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}

    {/* Finish arch */}
    <StaticBox position={[108, 4, 6]} args={[0.4, 8, 0.4]} color="#00ff88" />
    <StaticBox position={[108, 4, -86]} args={[0.4, 8, 0.4]} color="#00ff88" />

    {/* Trees on sides */}
    {Array.from({ length: 15 }).map((_, i) => (
      <group key={`tr${i}`} position={[-5 + i * 12, 0, 10]}>
        <mesh position={[0, 2, 0]} castShadow>
          <coneGeometry args={[1.2, 4, 8]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 1.2, 6]} />
          <meshStandardMaterial color="#5c3b1e" roughness={1} />
        </mesh>
      </group>
    ))}
  </>
);

export default TrackBike2;
