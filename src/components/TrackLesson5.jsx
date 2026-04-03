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

const ParkedCar = ({ position, rotation = [0,0,0], color = "#3355aa" }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[2.6, 0.9, 1.2]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
    </mesh>
    <mesh position={[0, 1.05, 0.1]} castShadow>
      <boxGeometry args={[1.6, 0.7, 1.15]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
    </mesh>
    {[[-0.9,-0.5],[-0.9,0.5],[0.9,-0.5],[0.9,0.5]].map(([x,z],i)=>(
      <mesh key={i} position={[x, 0.22, z]} castShadow>
        <cylinderGeometry args={[0.28,0.28,0.2,12]} rotation={[Math.PI/2,0,0]}/>
        <meshStandardMaterial color="#111" />
      </mesh>
    ))}
  </group>
);

const TrackLesson5 = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 80]} />
      <meshStandardMaterial color="#606060" roughness={0.95} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.01, -3]} receiveShadow>
      <planeGeometry args={[70, 40]} />
      <meshStandardMaterial color="#252525" roughness={0.9} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.01, -3]} receiveShadow>
      <planeGeometry args={[16, 10]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>

    {[0,1,2,3,4,5].map(i => (
      <group key={`bay-${i}`}>
        <mesh rotation={[-Math.PI/2,0,0]} position={[5 + i*5.5, 0.02, 8]}>
          <planeGeometry args={[0.15, 8]} />
          <meshStandardMaterial color={i===2 ? "#ffdd00" : "#ffffff"} emissive={i===2?"#ffaa00":"#000"} emissiveIntensity={i===2?0.5:0} />
        </mesh>
        <mesh rotation={[-Math.PI/2,0,0]} position={[5 + i*5.5 + 5.5, 0.02, 8]}>
          <planeGeometry args={[0.15, 8]} />
          <meshStandardMaterial color={i===2 ? "#ffdd00" : "#ffffff"} />
        </mesh>
        <mesh rotation={[-Math.PI/2,0,0]} position={[5 + i*5.5 + 2.75, 0.02, 12]}>
          <planeGeometry args={[5.5, 0.15]} />
          <meshStandardMaterial color={i===2 ? "#ffdd00" : "#ffffff"} />
        </mesh>
        {i === 2 && (
          <mesh rotation={[-Math.PI/2,0,0]} position={[5 + i*5.5 + 2.75, 0.015, 8]}>
            <planeGeometry args={[5.3, 7.7]} />
            <meshStandardMaterial color="#ffdd00" opacity={0.12} transparent />
          </mesh>
        )}
      </group>
    ))}

    <ParkedCar position={[7.75, 0, 8]}  rotation={[0, 0, 0]} color="#cc3333" />
    <ParkedCar position={[13.25, 0, 8]} rotation={[0, 0, 0]} color="#336633" />
    <ParkedCar position={[24.5, 0, 8]}  rotation={[0, 0, 0]} color="#884422" />
    <ParkedCar position={[30, 0, 8]}    rotation={[0, 0, 0]} color="#224488" />
    <ParkedCar position={[35.5, 0, 8]}  rotation={[0, 0, 0]} color="#558855" />

    {[0,1,2,3,4,5].map(i => (
      <ParkedCar key={`opp-${i}`} position={[5 + i*5.5 + 2.75, 0, -14]} rotation={[0, Math.PI, 0]} color="#555566" />
    ))}

    {[0,1,2].map(i => (
      <mesh key={`arr-${i}`} rotation={[-Math.PI/2, 0, 0]} position={[10 + i*12, 0.02, -3]}>
        <planeGeometry args={[0.3, 6]} />
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>
    ))}

    <StaticBox position={[19, 1.5, 14.5]} args={[0.15, 3, 0.15]} color="#777" />
    <mesh position={[19, 3.2, 14.5]}>
      <boxGeometry args={[1.4, 1.0, 0.15]} />
      <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.5} />
    </mesh>

    <StaticBox position={[43, 1.5, -3]}  args={[1, 3, 40]} color="#444" />
    <StaticBox position={[-8, 1.5, 18]}  args={[54, 3, 1]} color="#444" />
    <StaticBox position={[-8, 1.5, -23]} args={[54, 3, 1]} color="#444" />

    <StaticBox position={[-16.5, 1, -3]} args={[0.2, 2, 0.2]} color="#777" />
    <mesh position={[-16.5, 2.1, 1]}>
      <boxGeometry args={[0.15, 0.2, 8]} />
      <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.4} />
    </mesh>

    <mesh rotation={[-Math.PI/2,0,0]} position={[8, -0.02, -3]}>
      <planeGeometry args={[100, 80]} />
      <meshStandardMaterial color="#3a6b3a" roughness={1} />
    </mesh>
  </>
);

export default TrackLesson5;
