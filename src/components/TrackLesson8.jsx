import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", rotation = [0,0,0], emissive="#000", emissiveIntensity=0 }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.8} />
    </mesh>
  );
};

const TrackLesson8 = () => {
  const hillAngle = Math.PI / 10;
  const hillLength = 40;
  const hillRise = Math.sin(hillAngle) * hillLength;
  const hillRun = Math.cos(hillAngle) * hillLength;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0, -3]} receiveShadow>
        <planeGeometry args={[160, 60]} />
        <meshStandardMaterial color="#4a6e3a" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.01, -3]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>

      <StaticBox
        position={[hillRun / 2 + 10, hillRise / 2, -3]}
        args={[hillRun + 2, 0.5, 12]}
        rotation={[hillAngle, 0, 0]}
        color="#333"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[hillRun + 10 + 20, hillRise + 0.01, -3]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI/2, 0, 0]} position={[9, 0.02, -3]}>
        <planeGeometry args={[0.5, 12]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      <StaticBox position={[hillRun+11, hillRise+2, 5.5]}  args={[0.4,4,0.4]} color="#00dd00" emissive="#00ff00" emissiveIntensity={0.6} />
      <StaticBox position={[hillRun+11, hillRise+2, -11.5]} args={[0.4,4,0.4]} color="#00dd00" emissive="#00ff00" emissiveIntensity={0.6} />
      <mesh position={[hillRun+11, hillRise+4.3, -3]}>
        <boxGeometry args={[0.3, 0.4, 17]} />
        <meshStandardMaterial color="#00dd00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>

      <StaticBox position={[hillRun/2+10, hillRise/2+0.8, 5.8]}  args={[hillRun+2, 0.5, 0.2]} rotation={[hillAngle,0,0]} color="#dddddd" />
      <StaticBox position={[hillRun/2+10, hillRise/2+0.8, -11.8]} args={[hillRun+2, 0.5, 0.2]} rotation={[hillAngle,0,0]} color="#dddddd" />

      <mesh position={[hillRun/2+10, hillRise/4, -3]} rotation={[hillAngle+Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[hillRun+2, hillRise*2]} />
        <meshStandardMaterial color="#3a5a28" roughness={1} />
      </mesh>

      <group position={[10, 0, 5]}>
        <StaticBox position={[0,1.2,0]} args={[0.12,2.4,0.12]} color="#888" />
        <mesh position={[0,2.8,0]}>
          <boxGeometry args={[1.4,1.0,0.1]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {[0,1,2].map(i=>(
        <mesh key={`tm-${i}`} rotation={[-Math.PI/2,0,0]} position={[-8+i*4, 0.02, -3]}>
          <planeGeometry args={[2, 0.3]} />
          <meshStandardMaterial color="#111" opacity={0.5} transparent />
        </mesh>
      ))}

      {Array.from({length:12}).map((_,i)=>(
        <group key={`t${i}`}>
          <group position={[-18+i*11, 0, 9]}>
            <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.3,0.4,2.4]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
            <mesh position={[0,3.5,0]} castShadow><coneGeometry args={[1.8,4,7]} /><meshStandardMaterial color="#1e5c14" /></mesh>
          </group>
          <group position={[-18+i*11, 0, -16]}>
            <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.3,0.4,2.4]} /><meshStandardMaterial color="#5c3d1e" /></mesh>
            <mesh position={[0,3.5,0]} castShadow><coneGeometry args={[1.8,4,7]} /><meshStandardMaterial color="#1e5c14" /></mesh>
          </group>
        </group>
      ))}
    </>
  );
};

export default TrackLesson8;
