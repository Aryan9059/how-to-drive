
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888" }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

const Helipad = ({ position }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[6, 24]} />
      <meshStandardMaterial color="#444" roughness={0.8} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[4.5, 5.8, 24]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.5} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[3, 0.6]} />
      <meshStandardMaterial color="#ff4400" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[3, 0.6]} />
      <meshStandardMaterial color="#ff4400" />
    </mesh>
  </group>
);

const TrackHelicopter2 = () => (
  <>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[800, 800]} />
      <meshStandardMaterial color="#9a6a3a" roughness={1} />
    </mesh>

    {}
    <StaticBox position={[0, 20, -120]} args={[300, 60, 30]} color="#8b6530" />
    <StaticBox position={[0, 20, 120]} args={[300, 60, 30]} color="#8b6530" />
    <StaticBox position={[-150, 20, 0]} args={[30, 60, 210]} color="#7a5525" />
    <StaticBox position={[150, 20, 0]} args={[30, 60, 210]} color="#7a5525" />

    {}
    {[
      { pos: [30, 15, -40], s: 10, h: 30 },
      { pos: [-40, 20, 30], s: 12, h: 40 },
      { pos: [70, 12, 20], s: 8, h: 24 },
      { pos: [-70, 18, -50], s: 11, h: 36 },
      { pos: [0, 10, 60], s: 9, h: 20 },
    ].map(({ pos, s, h }, i) => (
      <StaticBox key={i} position={pos} args={[s, h, s]} color="#8a6535" />
    ))}

    {}
    <Helipad position={[-100, -4.9, -80]} />

    {}
    <StaticBox position={[0, 5, 0]} args={[15, 10, 15]} color="#666" />
    <Helipad position={[0, 10.05, 0]} />

    <StaticBox position={[80, 18, -60]} args={[12, 36, 12]} color="#555" />
    <Helipad position={[80, 36.05, -60]} />

    {}
    <StaticBox position={[-50, -4.5, 40]} args={[8, 0.4, 2]} color="#888" />
    <StaticBox position={[-50, -4.5, 40]} args={[1.5, 2, 0.3]} color="#888" />

    {}
    {[[80, 37, -60], [0, 11, 0], [-100, 0, -80]].map((pos, i) => (
      <pointLight key={i} position={pos} color={i === 0 ? "#ff4400" : "#ffdd00"} intensity={5} distance={30} />
    ))}

    {}
    {[
      { pos: [-60, 15, -20], color: "#00ffcc" },
      { pos: [40, 25, -20], color: "#ff6600" },
      { pos: [80, 30, -30], color: "#ffdd00" },
    ].map(({ pos, color }, i) => (
      <group key={`wp${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[6, 0.4, 8, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
        <pointLight color={color} intensity={2} distance={20} />
      </group>
    ))}
  </>
);

export default TrackHelicopter2;
