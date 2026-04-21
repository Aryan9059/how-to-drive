import { useRef } from "react";
import { useBox } from "@react-three/cannon";
import TrafficLightController from "./TrafficLightController";
import { TL_STATE } from "./TrafficLight";

const StaticBox = ({ position, args, color = "#888", emissive = "#000", emissiveIntensity = 0 }) => {
  useBox(() => ({ type: "Static", args, position }), useRef(null));
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.8} />
    </mesh>
  );
};

const Footpath = ({ position, args }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#a0a0a0" roughness={0.9} />
  </mesh>
);

const StopSign = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <StaticBox position={[0, 1.5, 0]} args={[0.1, 3, 0.1]} color="#888" />
    <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.1, 8]} />
      <meshStandardMaterial color="#cc0000" />
    </mesh>
    <mesh position={[0, 3, 0.06]}>
      <planeGeometry args={[0.8, 0.2]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  </group>
);

const TrackLesson2 = ({ onTrafficViolation }) => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[130, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 100]} />
      <meshStandardMaterial color="#4a7040" roughness={1} />
    </mesh>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[140, 0.01, -3]} receiveShadow>
      <planeGeometry args={[360, 10]} />
      <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
    </mesh>

    <Footpath position={[140, 0.1, 2.75]} args={[360, 0.2, 1.5]} />
    <Footpath position={[140, 0.1, -8.75]} args={[360, 0.2, 1.5]} />

    {Array.from({ length: 55 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-25 + i * 6, 0.02, -3]}>
        <planeGeometry args={[3, 0.2]} />
        <meshStandardMaterial color="#ffee00" opacity={0.8} transparent />
      </mesh>
    ))}

    {/* Zebra crossing at stop area */}
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={`sl-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[300, 0.03, -0.5 + i * -1.5]}>
        <planeGeometry args={[0.6, 1.4]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ff2200" : "#ffffff"} />
      </mesh>
    ))}

    <StopSign position={[300, 0, 3.5]} rotation={[0, -Math.PI / 2, 0]} />
    <StopSign position={[300, 0, -9.5]} rotation={[0, -Math.PI / 2, 0]} />

    {/* Rumble strips */}
    {[286, 288, 290, 292, 294, 296, 298].map((x, i) => (
      <mesh key={`rz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, -3]}>
        <planeGeometry args={[0.5, 10]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ffcc00" : "#2c2c2c"} />
      </mesh>
    ))}

    <StaticBox position={[315, 2, -3]} args={[1, 4, 12]} color="#555" />

    {Array.from({ length: 40 }).map((_, i) => (
      <group key={`tr-${i}`}>
        <group position={[-28 + i * 9, 0, 7]}>
          <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.28, 0.35, 2]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0, 3.2, 0]} castShadow><sphereGeometry args={[1.5, 7, 6]} /><meshStandardMaterial color="#1e5c14" /></mesh>
        </group>
        <group position={[-28 + i * 9, 0, -14]}>
          <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.28, 0.35, 2]} /><meshStandardMaterial color="#4a2e0e" /></mesh>
          <mesh position={[0, 3.2, 0]} castShadow><sphereGeometry args={[1.5, 7, 6]} /><meshStandardMaterial color="#1e5c14" /></mesh>
        </group>
      </group>
    ))}

    {/* Traffic light 1 — mid-course, player encounters first */}
    <TrafficLightController
      id="tl-lesson2-a"
      position={[100, 0, 3]}
      offsets={[[0, 0, 0], [0, 0, -12]]}
      rotations={[[0, Math.PI, 0], [0, 0, 0]]}
      redDuration={6}
      greenDuration={5}
      yellowDuration={2}
      stopLineZ={-6}
      stopLineX={100}
      stopZoneWidth={12}
      stopZoneDepth={9}
      startState={TL_STATE.RED}
      onViolation={onTrafficViolation}
    />

    {/* Traffic light 2 — near final stop line */}
    <TrafficLightController
      id="tl-lesson2-b"
      position={[260, 0, 3]}
      offsets={[[0, 0, 0], [0, 0, -12]]}
      rotations={[[0, Math.PI, 0], [0, 0, 0]]}
      redDuration={5}
      greenDuration={4}
      yellowDuration={2}
      stopLineZ={-6}
      stopLineX={260}
      stopZoneWidth={12}
      stopZoneDepth={9}
      startState={TL_STATE.GREEN}
      onViolation={onTrafficViolation}
    />
  </>
);

export default TrackLesson2;
