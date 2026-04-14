/**
 * TrackBike3.jsx – Coastal Sprint
 * 500 m coastal road running west→east along X axis.
 * Start at x=-240, finish gate at x=240.
 * Ocean on the south (Z+) side, sandy cliffs on north (Z-).
 * Chicane (S-bend barriers) at x≈0.
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

const Barrier = ({ position }) => (
  <group position={position}>
    <StaticBox position={[0, 0.5, 0]} args={[1.8, 1.0, 0.4]} color="#cc2200" />
    <mesh position={[0, 0.65, 0.21]}>
      <boxGeometry args={[1.6, 0.18, 0.01]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

const PalmTree = ({ position }) => (
  <group position={position}>
    {/* Trunk – slight lean */}
    <mesh position={[0, 3, 0]} rotation={[0.1, 0, 0.12]} castShadow>
      <cylinderGeometry args={[0.15, 0.22, 6, 7]} />
      <meshStandardMaterial color="#8b6914" roughness={1} />
    </mesh>
    {/* Fronds */}
    {Array.from({ length: 6 }).map((_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(angle) * 1.5, 6.2, Math.cos(angle) * 1.5]}
          rotation={[0.7, angle, 0]} castShadow>
          <boxGeometry args={[0.2, 0.06, 2.2]} />
          <meshStandardMaterial color="#2a7a1a" roughness={0.9} />
        </mesh>
      );
    })}
  </group>
);

const TrackBike3 = () => (
  <>
    {/* ── SANDY GROUND ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]} receiveShadow>
      <planeGeometry args={[560, 50]} />
      <meshStandardMaterial color="#d4b483" roughness={1} />
    </mesh>

    {/* ── OCEAN ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 28]} receiveShadow>
      <planeGeometry args={[600, 40]} />
      <meshStandardMaterial color="#1a5a8a" roughness={0.05} metalness={0.3} />
    </mesh>

    {/* ── COASTAL ROAD ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[520, 10]} />
      <meshStandardMaterial color="#333" roughness={0.9} />
    </mesh>

    {/* Road edge lines */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]}>
      <planeGeometry args={[520, 0.25]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -5]}>
      <planeGeometry args={[520, 0.25]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>

    {/* Center line dashes */}
    {Array.from({ length: 30 }).map((_, i) => (
      <mesh key={`d${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-230 + i * 16, 0.02, 0]}>
        <planeGeometry args={[8, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.75} transparent />
      </mesh>
    ))}

    {/* ── ROAD BARRIERS (sides) ── */}
    {/* Ocean side (Z+) */}
    {Array.from({ length: 18 }).map((_, i) => {
      if (i >= 6 && i <= 8) return null; // gap at chicane entrance
      return <Barrier key={`bo${i}`} position={[-225 + i * 28, 0, 6.5]} />;
    })}
    {/* Cliff side (Z-) */}
    {Array.from({ length: 18 }).map((_, i) => {
      if (i >= 6 && i <= 8) return null;
      return <Barrier key={`bc${i}`} position={[-225 + i * 28, 0, -6.5]} />;
    })}

    {/* ── CHICANE BARRIERS (S-bend at x≈0) ── */}
    {/* Block 1: forces south (ocean side) */}
    {[0, 1, 2].map((i) => (
      <Barrier key={`ch1${i}`} position={[-8 + i * 2, 0, 3]} />
    ))}
    {/* Block 2: forces north (cliff side) */}
    {[0, 1, 2].map((i) => (
      <Barrier key={`ch2${i}`} position={[8 + i * 2, 0, -3]} />
    ))}

    {/* ── PALM TREES (ocean side) ── */}
    {Array.from({ length: 16 }).map((_, i) => (
      <PalmTree key={`pt${i}`} position={[-225 + i * 30, 0, 14 + (i % 3) * 2]} />
    ))}

    {/* ── COASTAL CLIFFS (north side, decorative) ── */}
    {Array.from({ length: 10 }).map((_, i) => (
      <StaticBox key={`cl${i}`}
        position={[-220 + i * 50, 5 + (i % 3) * 3, -25]}
        args={[40, 10 + (i % 3) * 6, 10]}
        color={i % 2 === 0 ? "#b8a070" : "#a89060"}
      />
    ))}

    {/* ── START BANNER ── */}
    <StaticBox position={[-240, 5, 6]} args={[0.4, 10, 0.4]} color="#ffdd00" />
    <StaticBox position={[-240, 5, -6]} args={[0.4, 10, 0.4]} color="#ffdd00" />
    <mesh position={[-240, 10.2, 0]}>
      <boxGeometry args={[0.25, 0.25, 12]} />
      <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.6} />
    </mesh>

    {/* ── FINISH ARCH ── */}
    <StaticBox position={[240, 5, 6]} args={[0.4, 10, 0.4]} color="#00ff88" />
    <StaticBox position={[240, 5, -6]} args={[0.4, 10, 0.4]} color="#00ff88" />
    <mesh position={[240, 10.2, 0]}>
      <boxGeometry args={[0.25, 0.25, 12]} />
      <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={1} />
    </mesh>
    {/* Chequered finish line */}
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={`fz${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[240, 0.02, -4.5 + i]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#ffffff" : "#000000"} />
      </mesh>
    ))}
    <pointLight position={[240, 9, 0]} color="#00ff88" intensity={6} distance={20} />
  </>
);

export default TrackBike3;
