import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const RockWall = ({ position, args, color = "#1a0a00", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.95} metalness={0.1} />
    </mesh>
  );
};

const BasaltTile = ({ position, args, color = "#1c1008" }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.85} metalness={0.15} />
  </mesh>
);

const LavaCrack = ({ position, args, color = "#ff4400" }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} roughness={0.4} />
  </mesh>
);

const LavaPillar = ({ position, lavaColor = "#ff6600" }) => (
  <group position={position}>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.8, 1.2, 4, 7]} />
      <meshStandardMaterial color="#2a1005" roughness={0.95} />
    </mesh>
    <mesh position={[0, 4.1, 0]}>
      <cylinderGeometry args={[0.6, 0.8, 0.3, 7]} />
      <meshStandardMaterial color={lavaColor} emissive={lavaColor} emissiveIntensity={4} />
    </mesh>
    <pointLight position={[0, 5, 0]} intensity={6} color={lavaColor} distance={14} decay={2} />
  </group>
);

const Track5 = () => {
  return (
    <>
      <mesh position={[0, -0.05, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#0c0500" roughness={1} />
      </mesh>

      <mesh position={[0, -0.3, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[33, 23]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={2} roughness={0.5} />
      </mesh>
      {[0, 45, 90, 135].map((angle, i) => (
        <LavaCrack key={`gorge-crack-${i}`}
          position={[Math.cos(angle * Math.PI/180) * 8, 0.05, Math.sin(angle * Math.PI/180) * 8]}
          args={[0.4, 0.05, 14]}
        />
      ))}

      <BasaltTile position={[0, 0.01, -16]}   args={[56, 0.1, 11]} color="#241008" />
      <BasaltTile position={[0, 0.01, 16]}    args={[56, 0.1, 11]} color="#241008" />
      <BasaltTile position={[-22, 0.01, 0]}   args={[12, 0.1, 22]} color="#241008" />
      <BasaltTile position={[22, 0.01, 0]}    args={[12, 0.1, 22]} color="#241008" />
      <BasaltTile position={[-22, 0.01, -16]} args={[12, 0.1, 11]} color="#2a1209" />
      <BasaltTile position={[22, 0.01, -16]}  args={[12, 0.1, 11]} color="#2a1209" />
      <BasaltTile position={[-22, 0.01, 16]}  args={[12, 0.1, 11]} color="#2a1209" />
      <BasaltTile position={[22, 0.01, 16]}   args={[12, 0.1, 11]} color="#2a1209" />

      {[-16,-8,0,8,16].map((x,i) => (
        <LavaCrack key={`lc-s-${i}`} position={[x, 0.07, -16]} args={[0.25, 0.05, 8]} color="#ff5500" />
      ))}
      {[-16,-8,0,8,16].map((x,i) => (
        <LavaCrack key={`lc-n-${i}`} position={[x, 0.07, 16]}  args={[0.25, 0.05, 8]} color="#ff5500" />
      ))}

      <RockWall position={[0, 3, -22.5]}  args={[60, 6, 2.5]} color="#180900" emissive="#ff3300" emissiveIntensity={0.15} />
      <RockWall position={[0, 3, 22.5]}   args={[60, 6, 2.5]} color="#180900" emissive="#ff8800" emissiveIntensity={0.15} />
      <RockWall position={[-29, 3, 0]}    args={[2.5, 6, 50]} color="#180900" emissive="#ff5500" emissiveIntensity={0.12} />
      <RockWall position={[29, 3, 0]}     args={[2.5, 6, 50]} color="#180900" emissive="#ff5500" emissiveIntensity={0.12} />

      <RockWall position={[0, 2, -10.5]}  args={[34, 4, 2]} color="#200800" emissive="#ff4400" emissiveIntensity={0.5} />
      <RockWall position={[0, 2, 10.5]}   args={[34, 4, 2]} color="#200800" emissive="#ff6600" emissiveIntensity={0.5} />
      <RockWall position={[-17, 2, 0]}    args={[2, 4, 22]} color="#200800" emissive="#ff4400" emissiveIntensity={0.5} />
      <RockWall position={[17, 2, 0]}     args={[2, 4, 22]} color="#200800" emissive="#ff6600" emissiveIntensity={0.5} />

      <RockWall position={[-6, 2, -16]}   args={[2.5, 4, 7]} color="#1a0700" emissive="#ff3300" emissiveIntensity={0.4} />
      <RockWall position={[6, 2, 16]}     args={[2.5, 4, 7]} color="#1a0700" emissive="#ff3300" emissiveIntensity={0.4} />

      <LavaPillar position={[-25, 0, -19.5]} lavaColor="#ff4400" />
      <LavaPillar position={[25, 0, -19.5]}  lavaColor="#ff6600" />
      <LavaPillar position={[-25, 0, 19.5]}  lavaColor="#ff8800" />
      <LavaPillar position={[25, 0, 19.5]}   lavaColor="#ffaa00" />
      <LavaPillar position={[0, 0, -22]}     lavaColor="#ff3300" />
      <LavaPillar position={[0, 0, 22]}      lavaColor="#ff5500" />

      {[-10, 0, 10].map((x, i) => (
        <group key={`vent-s-${i}`} position={[x, 0, -10.5]}>
          <LavaCrack position={[0, 1.5, 0]} args={[0.3, 3, 0.2]} color="#ff4400" />
          <pointLight position={[0, 2, 0]} intensity={4} color="#ff4400" distance={10} decay={2} />
        </group>
      ))}
      {[-10, 0, 10].map((x, i) => (
        <group key={`vent-n-${i}`} position={[x, 0, 10.5]}>
          <LavaCrack position={[0, 1.5, 0]} args={[0.3, 3, 0.2]} color="#ff6600" />
          <pointLight position={[0, 2, 0]} intensity={4} color="#ff6600" distance={10} decay={2} />
        </group>
      ))}

      <LavaCrack position={[-22, 0.03, 0]}  args={[0.3, 0.04, 20]} color="#ff4400" />
      <LavaCrack position={[22, 0.03, 0]}   args={[0.3, 0.04, 20]} color="#ff6600" />
      <LavaCrack position={[0, 0.03, -22]}  args={[44, 0.04, 0.3]} color="#ff3300" />
      <LavaCrack position={[0, 0.03, 22]}   args={[44, 0.04, 0.3]} color="#ff5500" />
    </>
  );
};

export default Track5;
