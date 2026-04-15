import { usePlane } from "@react-three/cannon";

const HighwayTrack = () => {
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.1 }
  }));

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, -0.01, -3]}>
        <planeGeometry args={[1200, 12]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, -0.05, -3]}>
        <planeGeometry args={[1200, 150]} />
        <meshStandardMaterial color="#3d5a3d" roughness={1.0} />
      </mesh>

      {Array.from({ length: 200 }).map((_, i) => (
        <mesh key={`line-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-20 + i * 6, 0.01, -3]}>
          <planeGeometry args={[3, 0.2]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      ))}

      {Array.from({ length: 50 }).map((_, i) => (
        <group key={`tree-L-${i}`} position={[-20 + i * 20, 0, -12 - Math.random() * 6]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial color="#4a3b2c" />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#2d4c1e" />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 50 }).map((_, i) => (
        <group key={`tree-R-${i}`} position={[-20 + i * 20, 0, 6 + Math.random() * 6]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2]} />
            <meshStandardMaterial color="#4a3b2c" />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#2d4c1e" />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, 0.01, -8.7]}>
        <planeGeometry args={[1200, 0.2]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[500, 0.01, 2.7]}>
        <planeGeometry args={[1200, 0.2]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
    </group>
  );
};

export default HighwayTrack;
