import { Sky, Stars, Clouds, Cloud } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const DynamicSky = ({ timeOfDay = "day" }) => {
  const sunPos = useMemo(() => {
    switch (timeOfDay) {
      case "dawn":  return [10, 0.4, -10];
      case "day":   return [10, 6, 10];
      case "dusk":  return [-10, 0.4, 0];
      case "night": return [0, -10, 0];
      default:      return [10, 10, 10];
    }
  }, [timeOfDay]);

  const config = useMemo(() => {
    switch (timeOfDay) {
      case "dawn":  return { turbidity: 10, rayleigh: 3, inclination: 0.5, azimuth: 0.25, mieCoefficient: 0.005 };
      case "day":   return { turbidity: 0.5, rayleigh: 1.5, inclination: 0.5, azimuth: 0.25, mieCoefficient: 0.005 };
      case "dusk":  return { turbidity: 12, rayleigh: 4, inclination: 0.5, azimuth: 0.25, mieCoefficient: 0.01 };
      case "night": return { turbidity: 1, rayleigh: 0.1, inclination: 0.5, azimuth: 0.25, mieCoefficient: 0.001 };
      default:      return { turbidity: 1, rayleigh: 2, inclination: 0.5, azimuth: 0.25, mieCoefficient: 0.005 };
    }
  }, [timeOfDay]);

  const moonRef = useRef();
  useFrame((state) => {
    if (moonRef.current && timeOfDay === "night") {
      moonRef.current.position.set(0, 100, -100);
    }
  });

  return (
    <>
      <Sky 
        distance={450000} 
        sunPosition={sunPos} 
        turbidity={config.turbidity}
        rayleigh={config.rayleigh}
        mieCoefficient={config.mieCoefficient}
        mieDirectionalG={0.8}
      />
      
      {timeOfDay === "night" && (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <mesh ref={moonRef} position={[0, 100, -100]}>
            <sphereGeometry args={[8, 32, 32]} />
            <meshStandardMaterial 
              color="#fffcf0" 
              emissive="#fffcf0" 
              emissiveIntensity={1.5} 
              roughness={0.5} 
            />
          </mesh>
          <pointLight position={[0, 90, -90]} intensity={1.5} color="#fff" distance={300} />
        </>
      )}

      {(timeOfDay === "day" || timeOfDay === "dawn" || timeOfDay === "dusk") && (
        <Clouds material={THREE.MeshLambertMaterial} limit={400}>
          <Cloud 
            segments={20} 
            bounds={[100, 20, 100]} 
            volume={10} 
            color={timeOfDay === "day" ? "#fff" : "#ffccaa"}
            position={[0, 100, 0]} 
            opacity={timeOfDay === "day" ? 0.6 : 0.8}
            seed={10}
            speed={0.2}
          />
          <Cloud 
            segments={20} 
            bounds={[100, 20, 100]} 
            volume={10} 
            color={timeOfDay === "day" ? "#fff" : "#ffaa88"}
            position={[-200, 80, -200]} 
            opacity={timeOfDay === "day" ? 0.4 : 0.6}
            seed={20}
            speed={0.1}
          />
        </Clouds>
      )}
    </>
  );
};

export default DynamicSky;
