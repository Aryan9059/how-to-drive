/**
 * TrackPlane3.jsx – Canyon Flythrough
 * Plane starts at x=-200 facing +X. Canyon corridor runs along X axis.
 * Canyon walls at z=±22, from x=-80 to x=320.
 * 4 gate rings matching LessonMonitor: (0,20,0), (80,20,0), (160,20,0), (240,20,0).
 * Entry funnel widens at x=-80, overhead rock bridges, exit at x=320.
 */
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

// Canyon wall segment with colour variation
const WallSegment = ({ x, zSide, width, height, color }) => (
  <StaticBox
    position={[x, height / 2, zSide]}
    args={[width, height, 8]}
    color={color}
  />
);

const TrackPlane3 = () => {
  // Canyon wall sections with height variation to look organic
  const wallSections = [
    { xCenter: -60, width: 40, heightL: 55, heightR: 62 },
    { xCenter: 0,   width: 50, heightL: 68, heightR: 58 },
    { xCenter: 60,  width: 50, heightL: 52, heightR: 72 },
    { xCenter: 120, width: 50, heightL: 70, heightR: 60 },
    { xCenter: 180, width: 50, heightL: 58, heightR: 65 },
    { xCenter: 240, width: 50, heightL: 65, heightR: 55 },
    { xCenter: 298, width: 40, heightL: 50, heightR: 60 },
  ];

  const rockColors = ["#7a6a55", "#7c6e5a", "#8a7060", "#7e6c58", "#8c7262"];

  return (
    <>
      {/* ── GROUND ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, 0, 0]} receiveShadow>
        <planeGeometry args={[800, 200]} />
        <meshStandardMaterial color="#9a8870" roughness={1} />
      </mesh>

      {/* ── OPEN APPROACH AREA (pre-canyon) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-150, 0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 60]} />
        <meshStandardMaterial color="#7a9a5a" roughness={1} />
      </mesh>

      {/* ── CANYON FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[120, 0.01, 0]} receiveShadow>
        <planeGeometry args={[420, 40]} />
        <meshStandardMaterial color="#8a7860" roughness={1} />
      </mesh>

      {/* ── CANYON WALLS ── */}
      {wallSections.map(({ xCenter, width, heightL, heightR }, i) => {
        const color = rockColors[i % rockColors.length];
        return (
          <group key={i}>
            {/* North wall (Z-) */}
            <WallSegment x={xCenter} zSide={-24} width={width} height={heightL} color={color} />
            {/* South wall (Z+) */}
            <WallSegment x={xCenter} zSide={24} width={width} height={heightR} color={rockColors[(i + 2) % rockColors.length]} />
          </group>
        );
      })}

      {/* ── ENTRY FUNNEL (widens at approach) ── */}
      {/* Angled guide walls */}
      <StaticBox position={[-88, 25, -35]} args={[25, 50, 8]} rotation={[0, 0.25, 0]} color="#7a6a55" />
      <StaticBox position={[-88, 25, 35]} args={[25, 50, 8]} rotation={[0, -0.25, 0]} color="#7a6a55" />

      {/* ── OVERHEAD ROCK BRIDGES (fly under) ── */}
      {[50, 140, 230].map((x, i) => (
        <group key={`br${i}`}>
          {/* Bridge span */}
          <mesh position={[x, 42, 0]} castShadow>
            <boxGeometry args={[12, 6, 46]} />
            <meshStandardMaterial color={rockColors[i % rockColors.length]} roughness={0.95} />
          </mesh>
          {/* Visual underside */}
          <mesh position={[x, 39.2, 0]}>
            <boxGeometry args={[10, 0.5, 44]} />
            <meshStandardMaterial color="#5a4a3a" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* ── GATE RINGS (match LessonMonitor: x=0,80,160,240 at y=20) ── */}
      {[
        { pos: [0, 20, 0],   color: "#00ffcc", label: "1" },
        { pos: [80, 20, 0],  color: "#ff8800", label: "2" },
        { pos: [160, 20, 0], color: "#6600ff", label: "3" },
        { pos: [240, 20, 0], color: "#ffdd00", label: "4" },
      ].map(({ pos, color }, i) => (
        <group key={`gate${i}`} position={pos}>
          <mesh>
            <torusGeometry args={[13, 0.8, 8, 28]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
          <pointLight color={color} intensity={5} distance={30} />
          {/* Floor marker */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pos[1] + 0.1, 0]}>
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial color={color} opacity={0.3} transparent />
          </mesh>
        </group>
      ))}

      {/* ── EXIT OPENING ── */}
      {/* Wider exit walls */}
      <StaticBox position={[340, 25, -36]} args={[30, 50, 8]} rotation={[0, -0.2, 0]} color="#7a6a55" />
      <StaticBox position={[340, 25, 36]} args={[30, 50, 8]} rotation={[0, 0.2, 0]} color="#7a6a55" />

      {/* ── FINISH MARKER ── */}
      <group position={[318, 20, 0]}>
        <mesh>
          <torusGeometry args={[16, 1.0, 8, 28]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
        </mesh>
        <pointLight color="#ffffff" intensity={8} distance={40} />
      </group>

      {/* ── APPROACH GUIDE LIGHTS ── */}
      {[-160, -130, -110].map((x, i) => (
        <mesh key={`gl${i}`} position={[x, 5, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={3} />
        </mesh>
      ))}
    </>
  );
};

export default TrackPlane3;
