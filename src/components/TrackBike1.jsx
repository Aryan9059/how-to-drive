/**
 * TrackBike1.jsx – City Circuit
 * Start straight → chicane → 90° right → back straight → slalom cones → finish gate
 * Road runs along +X. Start at x=-15, finish gate at x=112.
 */
import { useRef } from "react";
import { useBox } from "@react-three/cannon";

const StaticBox = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

const Cone = ({ position }) => (
  <mesh position={position} castShadow>
    <coneGeometry args={[0.22, 0.65, 8]} />
    <meshStandardMaterial color="#ff4400" />
  </mesh>
);

const StreetLight = ({ position }) => (
  <group position={position}>
    <StaticBox position={[0, 3, 0]} args={[0.14, 6, 0.14]} color="#333" />
    <mesh position={[0.6, 5.85, 0]} rotation={[0, 0, -0.25]}>
      <boxGeometry args={[1.2, 0.08, 0.08]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    <mesh position={[1.15, 5.7, 0]}>
      <boxGeometry args={[0.22, 0.1, 0.38]} />
      <meshStandardMaterial color="#ffffee" emissive="#ffddaa" emissiveIntensity={2} />
    </mesh>
    <pointLight position={[1.15, 5.5, 0]} intensity={2} distance={22} color="#ffddaa" />
  </group>
);

const Building = ({ position, args, color }) => (
  <StaticBox position={position} args={args} color={color} />
);

const Barrier = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <StaticBox position={[0, 0.5, 0]} args={[1.8, 1.0, 0.4]} color="#cc2200" />
    {/* White stripe */}
    <mesh position={[0, 0.65, 0.21]}>
      <boxGeometry args={[1.6, 0.18, 0.01]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

const TrackBike1 = () => (
  <>
    {/* ── GROUND ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 300]} />
      <meshStandardMaterial color="#4a7c4e" roughness={1} />
    </mesh>

    {/* ── ROADS ── */}
    {/* Start straight (x: -20 → 50) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.01, -3]} receiveShadow>
      <planeGeometry args={[70, 10]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* Chicane connector (x: 40 → 60, slight Z shift) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[55, 0.01, -8]} receiveShadow>
      <planeGeometry args={[30, 10]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* After-chicane straight (x: 60 → 120) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[90, 0.01, -13]} receiveShadow>
      <planeGeometry args={[60, 10]} />
      <meshStandardMaterial color="#333" roughness={0.95} />
    </mesh>

    {/* Road markings – center dashes, start straight */}
    {Array.from({ length: 7 }).map((_, i) => (
      <mesh key={`cd${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-12 + i * 10, 0.02, -3]}>
        <planeGeometry args={[5, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.75} transparent />
      </mesh>
    ))}

    {/* ── CRASH BARRIERS (road sides) ── */}
    {/* North side of start straight */}
    {Array.from({ length: 8 }).map((_, j) => (
      <Barrier key={`bn${j}`} position={[-18 + j * 9, 0, 1.8]} />
    ))}
    {/* South side */}
    {Array.from({ length: 8 }).map((_, j) => (
      <Barrier key={`bs${j}`} position={[-18 + j * 9, 0, -7.8]} />
    ))}
    {/* After chicane, north */}
    {Array.from({ length: 6 }).map((_, j) => (
      <Barrier key={`bcn${j}`} position={[62 + j * 9, 0, -8.3]} />
    ))}
    {/* After chicane, south */}
    {Array.from({ length: 6 }).map((_, j) => (
      <Barrier key={`bcs${j}`} position={[62 + j * 9, 0, -17.3]} />
    ))}

    {/* ── CHICANE BARRIERS (forces S-bend) ── */}
    {/* Block 1 – forces left (south) */}
    {[0, 1, 2].map((i) => (
      <Barrier key={`ch1${i}`} position={[45 + i * 2, 0, -5]} />
    ))}
    {/* Block 2 – forces right (north) */}
    {[0, 1, 2].map((i) => (
      <Barrier key={`ch2${i}`} position={[56 + i * 2, 0, -11]} />
    ))}

    {/* ── SLALOM CONES (on after-chicane straight) ── */}
    {Array.from({ length: 8 }).map((_, i) => (
      <Cone key={`cone${i}`} position={[65 + i * 7, 0.33, i % 2 === 0 ? -10.5 : -15.5]} />
    ))}

    {/* ── STREET LIGHTS ── */}
    {Array.from({ length: 7 }).map((_, i) => (
      <StreetLight key={`sl${i}`} position={[-15 + i * 11, 0, 2.5]} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <StreetLight key={`slr${i}`} position={[65 + i * 11, 0, -7.5]} />
    ))}

    {/* ── CITY BUILDINGS (decorative) ── */}
    {/* Left side row */}
    <Building position={[-10, 5, 25]} args={[12, 10, 15]} color="#8a8a9a" />
    <Building position={[15, 8, 28]} args={[10, 16, 12]} color="#7a8090" />
    <Building position={[40, 6, 26]} args={[11, 12, 14]} color="#9090a0" />
    <Building position={[65, 9, 22]} args={[12, 18, 12]} color="#888898" />
    <Building position={[90, 7, 20]} args={[10, 14, 14]} color="#7a7a8a" />
    {/* Right side row */}
    <Building position={[5, 6, -25]} args={[10, 12, 12]} color="#8a8898" />
    <Building position={[30, 10, -28]} args={[12, 20, 10]} color="#909088" />
    <Building position={[55, 7, -30]} args={[11, 14, 12]} color="#888880" />
    <Building position={[80, 9, -28]} args={[10, 18, 14]} color="#7a8080" />

    {/* ── FINISH GATE ── */}
    <StaticBox position={[112, 5, -8]} args={[0.4, 10, 0.4]} color="#ffdd00" />
    <StaticBox position={[112, 5, -18]} args={[0.4, 10, 0.4]} color="#ffdd00" />
    {/* Crossbeam */}
    <mesh position={[112, 10.2, -13]}>
      <boxGeometry args={[0.3, 0.3, 10]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.8} />
    </mesh>
    {/* Finish line strip */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[112, 0.02, -13]}>
      <planeGeometry args={[1.5, 10]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    <pointLight position={[112, 9, -13]} color="#ffdd00" intensity={6} distance={20} />
  </>
);

export default TrackBike1;
