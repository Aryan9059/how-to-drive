/**
 * TrackBike4.jsx – Track Day (Oval Circuit)
 * A closed oval circuit with banked corners, grandstand, and pit lane.
 * Start/finish line at x≈0, z≈10 (LessonMonitor checkpoint).
 * The oval: long straights along X, banked corners connecting them.
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

const Curb = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[i * 1.8 - 4.5, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 0.8]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#cc0000" : "#ffffff"} />
      </mesh>
    ))}
  </group>
);

const GrandstandRow = ({ position, width }) => (
  <StaticBox position={position} args={[width, 1.2, 2]} color="#7a7a8a" />
);

const TrackBike4 = () => (
  <>
    {/* ── INFIELD GRASS ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[600, 400]} />
      <meshStandardMaterial color="#4a7c4e" roughness={1} />
    </mesh>

    {/* ── OVAL ROAD SURFACE ── */}
    {/* Main straight (north) – runs along X */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 30]} receiveShadow>
      <planeGeometry args={[260, 12]} />
      <meshStandardMaterial color="#282828" roughness={0.85} />
    </mesh>
    {/* Back straight (south) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -30]} receiveShadow>
      <planeGeometry args={[260, 12]} />
      <meshStandardMaterial color="#282828" roughness={0.85} />
    </mesh>
    {/* East corner connector */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[132, 0.01, 0]} receiveShadow>
      <planeGeometry args={[12, 60]} />
      <meshStandardMaterial color="#282828" roughness={0.85} />
    </mesh>
    {/* West corner connector */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-132, 0.01, 0]} receiveShadow>
      <planeGeometry args={[12, 60]} />
      <meshStandardMaterial color="#282828" roughness={0.85} />
    </mesh>

    {/* ── CENTER DASHES – main straight ── */}
    {Array.from({ length: 15 }).map((_, i) => (
      <mesh key={`ds${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-112 + i * 16, 0.02, 30]}>
        <planeGeometry args={[8, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.75} transparent />
      </mesh>
    ))}
    {Array.from({ length: 15 }).map((_, i) => (
      <mesh key={`db${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-112 + i * 16, 0.02, -30]}>
        <planeGeometry args={[8, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.75} transparent />
      </mesh>
    ))}

    {/* ── APEX CURBING ── */}
    {/* East corner curbs */}
    <Curb position={[132, 0, 23]} />
    <Curb position={[132, 0, -23]} />
    {/* West corner curbs */}
    <Curb position={[-132, 0, 23]} />
    <Curb position={[-132, 0, -23]} />

    {/* ── PIT LANE (north side of main straight) ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 46]} receiveShadow>
      <planeGeometry args={[220, 8]} />
      <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
    </mesh>
    {/* Pit lane divider */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 41.5]}>
      <planeGeometry args={[220, 0.3]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Pit garage boxes */}
    {Array.from({ length: 8 }).map((_, i) => (
      <StaticBox key={`pg${i}`} position={[-84 + i * 24, 3, 53]} args={[20, 6, 8]} color="#6a6a7a" />
    ))}
    {/* Pit lane entrance/exit cones */}
    {[0, 1, 2].map((i) => (
      <mesh key={`pic${i}`} position={[-105 + i * 5, 0.33, 41]} castShadow>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshStandardMaterial color="#ff8800" />
      </mesh>
    ))}

    {/* ── GRANDSTAND (south side of main straight) ── */}
    <GrandstandRow position={[0, 0.6, -44]} width={240} />
    <GrandstandRow position={[0, 1.8, -46.5]} width={240} />
    <GrandstandRow position={[0, 3.0, -49]} width={240} />
    <GrandstandRow position={[0, 4.2, -51.5]} width={240} />
    <GrandstandRow position={[0, 5.4, -54]} width={240} />
    {/* Grandstand support pillars */}
    {Array.from({ length: 12 }).map((_, i) => (
      <StaticBox key={`gp${i}`} position={[-110 + i * 20, 2.5, -44]} args={[0.5, 5, 2]} color="#5a5a6a" />
    ))}

    {/* ── START/FINISH GANTRY ── */}
    {/* Pillars */}
    <StaticBox position={[0, 5, 35.5]} args={[0.5, 10, 0.5]} color="#888" />
    <StaticBox position={[0, 5, 24.5]} args={[0.5, 10, 0.5]} color="#888" />
    {/* Crossbeam with chequered emissive */}
    <mesh position={[0, 10.2, 30]}>
      <boxGeometry args={[2.5, 0.4, 11]} />
      <meshStandardMaterial color="#111" emissive="#333" emissiveIntensity={0.3} />
    </mesh>
    {/* Chequered finish line on road */}
    {Array.from({ length: 12 }).map((_, i) => (
      <mesh key={`fc${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.02, 24.5 + i]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ffffff" : "#000000"} />
      </mesh>
    ))}
    <pointLight position={[0, 9, 30]} color="#ffdd00" intensity={6} distance={25} />

    {/* ── GRID BOXES (starting positions) ── */}
    {Array.from({ length: 6 }).map((_, i) => (
      <group key={`grid${i}`}>
        {/* Left position */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8 - i * 6, 0.02, 28]}>
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
        {/* Right position */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8 - i * 6, 0.02, 32]}>
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
      </group>
    ))}

    {/* ── INFIELD GRASS DETAIL ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <planeGeometry args={[240, 40]} />
      <meshStandardMaterial color="#3a7030" roughness={1} />
    </mesh>
  </>
);

export default TrackBike4;
