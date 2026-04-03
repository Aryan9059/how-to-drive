import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const Wall = ({ position, args, color = "#1a1a2e", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(
    () => ({ type: "Static", args, position }),
    useRef(null)
  );
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
};

const RoadTile = ({ position, args, color = "#111118" }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
  </mesh>
);

const NeonStrip = ({ position, args, color }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
  </mesh>
);

const Track3 = () => {
  return (
    <>
      <mesh position={[0, -0.05, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#07060f" roughness={1} />
      </mesh>

      <RoadTile position={[0, 0.01, -10.5]} args={[44, 0.1, 9]} />
      <RoadTile position={[0, 0.01, 10.5]} args={[44, 0.1, 9]} />
      <RoadTile position={[-17.5, 0.01, 0]} args={[9, 0.1, 12]} />
      <RoadTile position={[17.5, 0.01, 0]} args={[9, 0.1, 12]} />
      <RoadTile position={[-17.5, 0.01, -10.5]} args={[9, 0.1, 9]} />
      <RoadTile position={[17.5, 0.01, -10.5]} args={[9, 0.1, 9]} />
      <RoadTile position={[-17.5, 0.01, 10.5]} args={[9, 0.1, 9]} />
      <RoadTile position={[17.5, 0.01, 10.5]} args={[9, 0.1, 9]} />

      {[-12,-6,0,6,12].map((x, i) => (
        <NeonStrip key={`ns-${i}`} position={[x, 0.06, -10.5]} args={[0.3, 0.05, 6]} color="#ffff00" />
      ))}
      {[-12,-6,0,6,12].map((x, i) => (
        <NeonStrip key={`nn-${i}`} position={[x, 0.06, 10.5]} args={[0.3, 0.05, 6]} color="#ffff00" />
      ))}

      <Wall position={[0, 4, -16.5]}   args={[48, 8, 3]}  color="#0d0d1a" emissive="#ff00aa" emissiveIntensity={0.4} />
      <Wall position={[0, 4, 16.5]}    args={[48, 8, 3]}  color="#0d0d1a" emissive="#00aaff" emissiveIntensity={0.4} />
      <Wall position={[-23.5, 4, 0]}   args={[3, 8, 36]}  color="#0d0d1a" emissive="#aa00ff" emissiveIntensity={0.4} />
      <Wall position={[23.5, 4, 0]}    args={[3, 8, 36]}  color="#0d0d1a" emissive="#00ffaa" emissiveIntensity={0.4} />

      <Wall position={[0, 1.5, -5.5]}  args={[28, 3, 1.5]} color="#1a1a3a" emissive="#ff4400" emissiveIntensity={0.5} />
      <Wall position={[0, 1.5, 5.5]}   args={[28, 3, 1.5]} color="#1a1a3a" emissive="#0044ff" emissiveIntensity={0.5} />
      <Wall position={[-14, 1.5, 0]}   args={[1.5, 3, 12]} color="#1a1a3a" emissive="#ff4400" emissiveIntensity={0.5} />
      <Wall position={[14, 1.5, 0]}    args={[1.5, 3, 12]} color="#1a1a3a" emissive="#0044ff" emissiveIntensity={0.5} />

      <Wall position={[-6, 1.5, -11]}  args={[1.5, 3, 7]}  color="#222244" emissive="#ff8800" emissiveIntensity={0.6} />
      <Wall position={[6, 1.5, -10]}   args={[1.5, 3, 7]}  color="#222244" emissive="#ff8800" emissiveIntensity={0.6} />
      <Wall position={[6, 1.5, 11]}    args={[1.5, 3, 7]}  color="#222244" emissive="#44ffff" emissiveIntensity={0.6} />
      <Wall position={[-6, 1.5, 10]}   args={[1.5, 3, 7]}  color="#222244" emissive="#44ffff" emissiveIntensity={0.6} />

      {[[-22,-15],[22,-15],[-22,15],[22,15]].map(([x,z],i) => (
        <Wall key={i} position={[x, 5, z]} args={[3, 10, 3]}
          color="#0a0a1a"
          emissive={["#ff00aa","#00aaff","#aa00ff","#00ffaa"][i]}
          emissiveIntensity={1}
        />
      ))}

      <NeonStrip position={[-22, 0.03, 0]} args={[0.2, 0.03, 30]} color="#aa00ff" />
      <NeonStrip position={[22, 0.03, 0]}  args={[0.2, 0.03, 30]} color="#00ffaa" />
      <NeonStrip position={[0, 0.03, -16]} args={[44, 0.03, 0.2]} color="#ff00aa" />
      <NeonStrip position={[0, 0.03, 16]}  args={[44, 0.03, 0.2]} color="#00aaff" />
    </>
  );
};

export default Track3;
