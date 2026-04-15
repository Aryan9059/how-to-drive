
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

const TrackPlane1 = () => (
  <>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[900, 800]} />
      <meshStandardMaterial color="#5a8a3a" roughness={1} />
    </mesh>

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-120, 0.005, 0]} receiveShadow>
      <planeGeometry args={[100, 80]} />
      <meshStandardMaterial color="#b0b0b0" roughness={0.8} />
    </mesh>

    {}
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.01, 0]} receiveShadow>
      <planeGeometry args={[600, 28]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
    </mesh>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.015, 13.8]}>
      <planeGeometry args={[600, 0.4]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[150, 0.015, -13.8]}>
      <planeGeometry args={[600, 0.4]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {}
    {[-9, -6, -3, 0, 3, 6, 9].map((z, i) => (
      <mesh key={`th${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.02, z]}>
        <planeGeometry args={[8, 1.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}

    {}
    {Array.from({ length: 32 }).map((_, i) => (
      <mesh key={`cl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-76 + i * 18, 0.02, 0]}>
        <planeGeometry args={[9, 0.45]} />
        <meshStandardMaterial color="#ffffff" opacity={0.85} transparent />
      </mesh>
    ))}

    {}
    {[1, 2, 3].map((n) =>
      [-7, -3.5, 3.5, 7].map((z, j) => (
        <mesh key={`tz${n}${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-75 + n * 30, 0.02, z]}>
          <planeGeometry args={[15, 1.8]} />
          <meshStandardMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      ))
    )}

    {}
    {Array.from({ length: 28 }).map((_, i) => (
      <group key={`rel${i}`}>
        <mesh position={[-82 + i * 22, 0.3, 15]}>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
        </mesh>
        <mesh position={[-82 + i * 22, 0.3, -15]}>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
        </mesh>
      </group>
    ))}

    {}
    {[-12, -8, -4, 0, 4, 8, 12].map((z, i) => (
      <mesh key={`thl${i}`} position={[-94, 0.3, z]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={5} />
      </mesh>
    ))}

    {}
    {[0, 1, 2, 3].map((i) => (
      <mesh key={`papi${i}`} position={[20 + i * 3, 0.5, 22]}>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial
          color={i < 2 ? "#ff2200" : "#ffffff"}
          emissive={i < 2 ? "#ff2200" : "#ffffff"}
          emissiveIntensity={2}
        />
      </mesh>
    ))}

    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-110, 0.008, -20]} receiveShadow>
      <planeGeometry args={[60, 10]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-80, 0.008, -18]} receiveShadow>
      <planeGeometry args={[10, 26]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>
    {}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-110, 0.012, -20]}>
      <planeGeometry args={[60, 0.25]} />
      <meshStandardMaterial color="#ffcc00" />
    </mesh>

    {}
    <StaticBox position={[-60, 9, -80]} args={[60, 18, 35]} color="#8a8a8a" />
    {}
    <StaticBox position={[-60, 9, -62.5]} args={[55, 16, 0.5]} color="#666" />

    {}
    <StaticBox position={[-150, 12, 60]} args={[8, 24, 8]} color="#aaa" />
    {}
    <mesh position={[-150, 26, 60]}>
      <boxGeometry args={[12, 5, 12]} />
      <meshStandardMaterial color="#88aacc" metalness={0.1} roughness={0} transparent opacity={0.45} />
    </mesh>
    {}
    <mesh position={[-150, 29.5, 60]}>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
    </mesh>
    <pointLight position={[-150, 29, 60]} color="#ff2200" intensity={4} distance={60} />

    {}
    <StaticBox position={[-180, 7, 30]} args={[0.22, 14, 0.22]} color="#333" />
    <mesh position={[-180, 14.8, 31.5]} rotation={[0.5, 0, 0]} castShadow>
      <coneGeometry args={[0.5, 2.0, 8]} />
      <meshStandardMaterial color="#ff8800" />
    </mesh>

    {}
    {[
      { pos: [50, 15, 0],  color: "#ffdd00" },
      { pos: [130, 23, 0], color: "#ff8800" },
      { pos: [210, 31, 0], color: "#ff4400" },
    ].map(({ pos, color }, i) => (
      <group key={`ag${i}`} position={pos}>
        <mesh>
          <torusGeometry args={[12, 0.65, 8, 28]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
        <pointLight color={color} intensity={4} distance={25} />
      </group>
    ))}

    {}
    {[-12, -8, -4, 0, 4, 8, 12].map((z, i) => (
      <mesh key={`rel2_${i}`} position={[410, 0.3, z]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={5} />
      </mesh>
    ))}
  </>
);

export default TrackPlane1;
