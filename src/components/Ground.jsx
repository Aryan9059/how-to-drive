import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import { TextureLoader } from "three";
import { usePlane } from "@react-three/cannon";

const Ground = () => {
  const alphaMap = useLoader(TextureLoader, "textures/ground_alpha.png");
  const aoMap = useLoader(TextureLoader, "textures/ground_ao.png");
  const gridMap = useLoader(TextureLoader, "textures/grid.png");

  const [ref] = usePlane(
    () => ({
      type: "Static",
      rotation: [-Math.PI / 2, 0, 0],
    }),
    useRef(null)
  );

  const gridRef = useRef(null);
  const groundRef = useRef(null);

  useEffect(() => {
    if (!gridMap) return;

    gridMap.anisotropy = 32;
  }, [gridMap]);

  return (
    <>
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2} ref={gridRef}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial opacity={0.325} alphaMap={gridMap} transparent={true} color={"white"} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation-x={-Math.PI / 2} ref={groundRef}>
        <circleGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          alphaMap={alphaMap}
          aoMap={aoMap}
          transparent={true}
          color={[0.4, 0.3, 0.3]}
          envMapIntensity={0.35}
          metalness={0.05}
          roughness={0.4}
          dithering={true}
          blur={[1024, 512]}
          mixBlur={3}
          mixStrength={30}
          resolution={1024}
          mirror={1}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          depthToBlurRatioBias={0.25}
        />
      </mesh>
    </>
  );
};

export default Ground;
