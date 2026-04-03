import { useRef } from "react";
import { useBox, useCylinder } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.8} />
    </mesh>
  );
};

const TrackLesson7 = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[150, 150]} />
      <meshStandardMaterial color="#4a7040" roughness={1} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <circleGeometry args={[6, 32]} />
      <meshStandardMaterial color="#3a6830" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[6, 6.5, 32]} />
      <meshStandardMaterial color="#dddddd" />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[6.5, 16, 48]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>

    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const r = 11.25;
      return (
        <mesh key={`ld-${i}`} rotation={[-Math.PI/2, 0, angle]} position={[Math.cos(angle)*r, 0.02, Math.sin(angle)*r]}>
          <planeGeometry args={[0.2, 1.8]} />
          <meshStandardMaterial color="#fff" opacity={0.4} transparent />
        </mesh>
      );
    })}

    <mesh rotation={[-Math.PI/2,0,0]} position={[0, 0.01, -32]}>
      <planeGeometry args={[10, 32]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0, 0.01, 32]}>
      <planeGeometry args={[10, 32]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[32, 0.01, 0]}>
      <planeGeometry args={[32, 10]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[-32, 0.01, 0]}>
      <planeGeometry args={[32, 10]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>

    {[[0,-17],[0,17],[17,0],[-17,0]].map(([x,z],i) => (
      <mesh key={`yl-${i}`} rotation={[-Math.PI/2, 0, i<2?0:Math.PI/2]} position={[x, 0.03, z]}>
        <planeGeometry args={[10, 0.4]} />
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
    ))}

    {[[0,-19],[0,19],[19,0],[-19,0]].map(([x,z],i) => (
      <group key={`gw-${i}`} position={[x+5.5*(i===2?0:i===3?0:1), 0, z+5.5*(i<2?0:i===2?-1:1)]}>
        <StaticBox position={[0,1.2,0]} args={[0.12,2.4,0.12]} color="#aaa" />
        <mesh position={[0,2.8,0]}>
          <cylinderGeometry args={[0.6,0.6,0.08,3]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
      </group>
    ))}

    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[2.5, 10, 8]} />
      <meshStandardMaterial color="#2a7020" roughness={1} />
    </mesh>

    {[0,1,2,3].map(i => {
      const a = (i/4)*Math.PI*2;
      return (
        <group key={`lp-${i}`} position={[Math.cos(a)*4.5, 0, Math.sin(a)*4.5]}>
          <mesh position={[0,2,0]} castShadow>
            <cylinderGeometry args={[0.08,0.1,4,6]} />
            <meshStandardMaterial color="#888" metalness={0.7} />
          </mesh>
          <mesh position={[0,4.2,0]}>
            <sphereGeometry args={[0.25,8,6]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff88" emissiveIntensity={1} />
          </mesh>
        </group>
      );
    })}

    {Array.from({length:5}).map((_,i) => (
      <>
        <mesh key={`dn-${i}`} rotation={[-Math.PI/2,0,0]} position={[0, 0.02, -20+i*4]}>
          <planeGeometry args={[0.2, 2]} /><meshStandardMaterial color="#ffee00" opacity={0.5} transparent />
        </mesh>
        <mesh key={`ds-${i}`} rotation={[-Math.PI/2,0,0]} position={[0, 0.02, 20-i*4]}>
          <planeGeometry args={[0.2, 2]} /><meshStandardMaterial color="#ffee00" opacity={0.5} transparent />
        </mesh>
        <mesh key={`de-${i}`} rotation={[-Math.PI/2,0,0]} position={[20-i*4, 0.02, 0]}>
          <planeGeometry args={[2, 0.2]} /><meshStandardMaterial color="#ffee00" opacity={0.5} transparent />
        </mesh>
        <mesh key={`dw-${i}`} rotation={[-Math.PI/2,0,0]} position={[-20+i*4, 0.02, 0]}>
          <planeGeometry args={[2, 0.2]} /><meshStandardMaterial color="#ffee00" opacity={0.5} transparent />
        </mesh>
      </>
    ))}

    {Array.from({length:20}).map((_,i) => {
      const a = (i/20)*Math.PI*2;
      const r = 55;
      return (
        <group key={`tr-${i}`} position={[Math.cos(a)*r, 0, Math.sin(a)*r]}>
          <mesh position={[0,1.5,0]} castShadow><cylinderGeometry args={[0.35,0.45,3]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
          <mesh position={[0,4.5,0]} castShadow><sphereGeometry args={[2,8,7]} /><meshStandardMaterial color="#1e5c14" /></mesh>
        </group>
      );
    })}
  </>
);

export default TrackLesson7;
