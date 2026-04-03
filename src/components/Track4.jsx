import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const SnowWall = ({ position, args, color = "#ddeeff", emissive = "#aabbcc", emissiveIntensity = 0.05 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.9} metalness={0.05} />
    </mesh>
  );
};

const IceTile = ({ position, args, color = "#c8e0f0" }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.1} metalness={0.4} />
  </mesh>
);

const Pine = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.5, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 3, 8]} />
      <meshStandardMaterial color="#5c3d1e" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3.5, 0]}>
      <coneGeometry args={[1.2, 3, 8]} />
      <meshStandardMaterial color="#1a4a2e" roughness={0.9} />
    </mesh>
    <mesh position={[0, 5.2, 0]}>
      <coneGeometry args={[0.8, 2.5, 8]} />
      <meshStandardMaterial color="#1a5a35" roughness={0.9} />
    </mesh>
    <mesh position={[0, 6.5, 0]}>
      <coneGeometry args={[0.5, 1, 8]} />
      <meshStandardMaterial color="#eef5ff" roughness={0.7} />
    </mesh>
  </group>
);

const SnowStripe = ({ position, args }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0} opacity={0.6} transparent />
  </mesh>
);

const Track4 = () => {
  return (
    <>
      <mesh position={[0, -0.05, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#b0cfe8" roughness={0.95} metalness={0.05} />
      </mesh>

      <IceTile position={[0, 0.01, 0]} args={[32, 0.08, 22]} color="#9fcde0" />

      <IceTile position={[0, 0.01, -16]}  args={[56, 0.1, 11]} color="#b8d4e8" />
      <IceTile position={[0, 0.01, 16]}   args={[56, 0.1, 11]} color="#b8d4e8" />
      <IceTile position={[-22, 0.01, 0]}  args={[12, 0.1, 22]} color="#b8d4e8" />
      <IceTile position={[22, 0.01, 0]}   args={[12, 0.1, 22]} color="#b8d4e8" />
      <IceTile position={[-22, 0.01, -16]} args={[12, 0.1, 11]} color="#c0daf0" />
      <IceTile position={[22, 0.01, -16]}  args={[12, 0.1, 11]} color="#c0daf0" />
      <IceTile position={[-22, 0.01, 16]}  args={[12, 0.1, 11]} color="#c0daf0" />
      <IceTile position={[22, 0.01, 16]}   args={[12, 0.1, 11]} color="#c0daf0" />

      {[-16, -8, 0, 8, 16].map((x, i) => (
        <SnowStripe key={`sm-s-${i}`} position={[x, 0.06, -16]} args={[0.3, 0.04, 7]} />
      ))}
      {[-16, -8, 0, 8, 16].map((x, i) => (
        <SnowStripe key={`sm-n-${i}`} position={[x, 0.06, 16]} args={[0.3, 0.04, 7]} />
      ))}

      <SnowWall position={[0, 2.5, -22.5]}  args={[60, 5, 2.5]} color="#e8f4ff" />
      <SnowWall position={[0, 2.5, 22.5]}   args={[60, 5, 2.5]} color="#e8f4ff" />
      <SnowWall position={[-29, 2.5, 0]}    args={[2.5, 5, 50]} color="#e8f4ff" />
      <SnowWall position={[29, 2.5, 0]}     args={[2.5, 5, 50]} color="#e8f4ff" />

      <SnowWall position={[0, 1.5, -10.5]}  args={[34, 3, 2]}   color="#cce0f5" emissive="#aaccff" emissiveIntensity={0.1} />
      <SnowWall position={[0, 1.5, 10.5]}   args={[34, 3, 2]}   color="#cce0f5" emissive="#aaccff" emissiveIntensity={0.1} />
      <SnowWall position={[-17, 1.5, 0]}    args={[2, 3, 22]}   color="#cce0f5" emissive="#aaccff" emissiveIntensity={0.1} />
      <SnowWall position={[17, 1.5, 0]}     args={[2, 3, 22]}   color="#cce0f5" emissive="#aaccff" emissiveIntensity={0.1} />

      <SnowWall position={[-7, 1.5, -16]}  args={[2.5, 3, 7]}  color="#ddeeff" />
      <SnowWall position={[7, 1.5, 16]}    args={[2.5, 3, 7]}  color="#ddeeff" />

      {[[-26,-20],[-13,-20],[0,-20],[13,-20],[26,-20]].map(([x,z],i) => <Pine key={`pine-s-${i}`} position={[x, 0, z]} />)}
      {[[-26, 20],[-13, 20],[0, 20],[13, 20],[26, 20]].map(([x,z],i) => <Pine key={`pine-n-${i}`} position={[x, 0, z]} />)}
      {[[-29,-12],[-29,0],[-29,12]].map(([x,z],i) => <Pine key={`pine-w-${i}`} position={[x, 0, z]} />)}
      {[[29,-12],[29,0],[29,12]].map(([x,z],i) => <Pine key={`pine-e-${i}`} position={[x, 0, z]} />)}

      {[-12,-6,0,6,12].map((x, i) => (
        <mesh key={`ic-s-${i}`} position={[x, 2.3, -10.5]}>
          <coneGeometry args={[0.12, 0.8, 6]} />
          <meshStandardMaterial color="#c8eaff" emissive="#88ccff" emissiveIntensity={0.4} roughness={0.1} metalness={0.6} />
        </mesh>
      ))}
      {[-12,-6,0,6,12].map((x, i) => (
        <mesh key={`ic-n-${i}`} position={[x, 2.3, 10.5]}>
          <coneGeometry args={[0.12, 0.8, 6]} />
          <meshStandardMaterial color="#c8eaff" emissive="#88ccff" emissiveIntensity={0.4} roughness={0.1} metalness={0.6} />
        </mesh>
      ))}

      {[[-28,-21.5],[28,-21.5],[-28,21.5],[28,21.5]].map(([x,z],i) => (
        <group key={`flag-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 8, 6]} />
            <meshStandardMaterial color="#aabbcc" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.5, 7, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.05]} />
            <meshStandardMaterial color={["#ff4444","#4444ff","#44ff44","#ffff44"][i]} emissive={["#ff2222","#2222ff","#22ff22","#ffff22"][i]} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default Track4;
