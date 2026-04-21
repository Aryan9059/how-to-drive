import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

// Traffic light states
export const TL_STATE = {
  RED: "red",
  YELLOW: "yellow",
  GREEN: "green",
};

const LIGHT_COLORS = {
  red:    { on: "#ff2200", off: "#330000", emissive: "#ff2200" },
  yellow: { on: "#ffcc00", off: "#332200", emissive: "#ffcc00" },
  green:  { on: "#00ff44", off: "#003311", emissive: "#00ff44" },
};

const TrafficLight = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  state = TL_STATE.RED,
  showLabel = true,
}) => {
  const poleRef = useRef();
  const redRef = useRef();
  const yellowRef = useRef();
  const greenRef = useRef();

  useFrame(({ clock }) => {
    // Blinking yellow
    if (state === TL_STATE.YELLOW && yellowRef.current) {
      const blink = Math.sin(clock.getElapsedTime() * 6) > 0;
      yellowRef.current.material.emissiveIntensity = blink ? 3 : 0.1;
    }
  });

  const isRed    = state === TL_STATE.RED;
  const isYellow = state === TL_STATE.YELLOW;
  const isGreen  = state === TL_STATE.GREEN;

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 5, 10]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Housing Box */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1.8, 0.5]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>

      {/* Red Light */}
      <mesh ref={redRef} position={[0, 6.1, 0.26]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial
          color={LIGHT_COLORS.red.on}
          emissive={isRed ? LIGHT_COLORS.red.emissive : LIGHT_COLORS.red.off}
          emissiveIntensity={isRed ? 4 : 0.2}
        />
      </mesh>
      {isRed && (
        <pointLight position={[0, 6.1, 0.4]} color="#ff2200" intensity={8} distance={12} />
      )}

      {/* Yellow Light */}
      <mesh ref={yellowRef} position={[0, 5.5, 0.26]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial
          color={LIGHT_COLORS.yellow.on}
          emissive={isYellow ? LIGHT_COLORS.yellow.emissive : LIGHT_COLORS.yellow.off}
          emissiveIntensity={isYellow ? 3 : 0.2}
        />
      </mesh>
      {isYellow && (
        <pointLight position={[0, 5.5, 0.4]} color="#ffcc00" intensity={6} distance={10} />
      )}

      {/* Green Light */}
      <mesh ref={greenRef} position={[0, 4.9, 0.26]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial
          color={LIGHT_COLORS.green.on}
          emissive={isGreen ? LIGHT_COLORS.green.emissive : LIGHT_COLORS.green.off}
          emissiveIntensity={isGreen ? 4 : 0.2}
        />
      </mesh>
      {isGreen && (
        <pointLight position={[0, 4.9, 0.4]} color="#00ff44" intensity={8} distance={12} />
      )}

      {/* Signal Label */}
      {showLabel && (
        <Text
          position={[0, 7.8, 0]}
          fontSize={0.45}
          color={isRed ? "#ff4444" : isYellow ? "#ffcc00" : "#44ff88"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000"
        >
          {isRed ? "STOP" : isYellow ? "SLOW" : "GO"}
        </Text>
      )}
    </group>
  );
};

export default TrafficLight;
