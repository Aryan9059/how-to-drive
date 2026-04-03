import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.7} />
    </mesh>
  );
};

const TrackLesson4 = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0, 0]} receiveShadow>
      <planeGeometry args={[180, 70]} />
      <meshStandardMaterial color="#556b44" roughness={1} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, 0.01, -3]} receiveShadow>
      <planeGeometry args={[180, 12]} />
      <meshStandardMaterial color="#282828" roughness={0.9} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.015, -3]}>
      <planeGeometry args={[50, 12]} />
      <meshStandardMaterial color="#323232" roughness={0.85} />
    </mesh>

    {[-5, 5, 15, 25, 35].map((x,i) => (
      <group key={`sp-${i}`} position={[x, 0, 4.5]}>
        <StaticBox position={[0, 1.2, 0]} args={[0.12, 2.4, 0.12]} color="#666" />
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[1.4, 1.0, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    ))}

    {Array.from({ length: 25 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-50 + i * 6, 0.02, -3]}>
        <planeGeometry args={[3, 0.2]} />
        <meshStandardMaterial color="#ffee00" opacity={0.6} transparent />
      </mesh>
    ))}

    {Array.from({ length: 16 }).map((_, i) => (
      <mesh key={`bz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[55 + i * 1.4, 0.025, -3]}>
        <planeGeometry args={[1.2, 12]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ffcc00" : "#111"} />
      </mesh>
    ))}

    {[[55,"3"],[65,"2"],[75,"1"]].map(([x, label], i) => (
      <group key={`dm-${i}`} position={[x, 0, -10.5]}>
        <StaticBox position={[0, 1, 0]} args={[0.12, 2, 0.12]} color="#888" />
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[1.0, 0.8, 0.1]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.5} />
        </mesh>
      </group>
    ))}

    <StaticBox position={[85, 2, -3]} args={[0.8, 4, 14]} color="#cc1111" emissive="#ff0000" emissiveIntensity={0.5} />

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[84, 0.03, -3]}>
      <planeGeometry args={[0.6, 12]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
    </mesh>

    {Array.from({ length: 16 }).map((_, i) => (
      <group key={`ar-${i}`}>
        <StaticBox position={[-50 + i*9, 0.55, 4.2]}  args={[8.5, 0.3, 0.2]} color="#c0c0c0" />
        <StaticBox position={[-50 + i*9, 0.55, -10.2]} args={[8.5, 0.3, 0.2]} color="#c0c0c0" />
      </group>
    ))}

    {Array.from({ length: 16 }).map((_, i) => (
      <group key={`tr-${i}`}>
        <group position={[-48 + i * 11, 0, 9]}>
          <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.3,0.4,2.4]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0,3.6,0]} castShadow><sphereGeometry args={[1.6,7,6]} /><meshStandardMaterial color="#1a5010" /></mesh>
        </group>
        <group position={[-48 + i * 11, 0, -16]}>
          <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.3,0.4,2.4]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0,3.6,0]} castShadow><sphereGeometry args={[1.6,7,6]} /><meshStandardMaterial color="#1a5010" /></mesh>
        </group>
      </group>
    ))}
  </>
);

export default TrackLesson4;
