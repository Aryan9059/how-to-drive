/**
 * TrackBike2.jsx – Alpine Pass
 * Three switchback hairpins. Checkpoints at (80,1,0), (80,1,-40), (80,1,-80).
 * Road runs east (x+), bends south (z-), back west, bends south again, etc.
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

const Guardrail = ({ position }) => (
  <group position={position}>
    <StaticBox position={[0, 0.6, 0]} args={[0.5, 1.2, 0.18]} color="#cc4400" />
    {/* Reflector */}
    <mesh position={[0, 0.9, 0.1]}>
      <boxGeometry args={[0.18, 0.08, 0.02]} />
      <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
    </mesh>
  </group>
);

const PineTree = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <coneGeometry args={[0.8, 3.2, 7]} />
      <meshStandardMaterial color="#1e4a1e" roughness={0.95} />
    </mesh>
    <mesh position={[0, 3.4, 0]} castShadow>
      <coneGeometry args={[0.55, 2.5, 7]} />
      <meshStandardMaterial color="#1a421a" roughness={0.95} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.22, 1.0, 6]} />
      <meshStandardMaterial color="#5c3b1e" roughness={1} />
    </mesh>
  </group>
);

const TrackBike2 = () => (
  <>
    {/* ── GROUND ── */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#5a7045" roughness={1} />
    </mesh>

    {/* ── ROAD SEGMENTS ── */}
    {/* Segment 1: start straight going east (x: -20 → 110) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[45, 0.01, -3]} receiveShadow>
      <planeGeometry args={[130, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Hairpin 1 connector: bend south at x≈110 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[110, 0.01, -18]} receiveShadow>
      <planeGeometry args={[12, 30]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Segment 2: going west (x: -20 → 110) at z=-40 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[45, 0.01, -40]} receiveShadow>
      <planeGeometry args={[130, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Hairpin 2 connector: bend south at x≈-20 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.01, -55]} receiveShadow>
      <planeGeometry args={[12, 30]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* Segment 3: going east again at z=-80 */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[45, 0.01, -80]} receiveShadow>
      <planeGeometry args={[130, 12]} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
    </mesh>

    {/* ── CENTER LINE DASHES ── */}
    {Array.from({ length: 13 }).map((_, i) => (
      <mesh key={`d1_${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 10, 0.02, -3]}>
        <planeGeometry args={[5, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}
    {Array.from({ length: 13 }).map((_, i) => (
      <mesh key={`d2_${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 10, 0.02, -40]}>
        <planeGeometry args={[5, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}
    {Array.from({ length: 13 }).map((_, i) => (
      <mesh key={`d3_${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 10, 0.02, -80]}>
        <planeGeometry args={[5, 0.22]} />
        <meshStandardMaterial color="#ffdd00" opacity={0.7} transparent />
      </mesh>
    ))}

    {/* ── GUARDRAILS – outer cliff edge ── */}
    {/* Hairpin 1 (east side, z: 0 → -34) */}
    {Array.from({ length: 8 }).map((_, i) => (
      <Guardrail key={`gr1${i}`} position={[115, 0, -3 - i * 4.2]} />
    ))}
    {/* Segment 2 north edge */}
    {Array.from({ length: 13 }).map((_, i) => (
      <Guardrail key={`gr2n${i}`} position={[-18 + i * 10, 0, -45.5]} />
    ))}
    {/* Hairpin 2 (west side) */}
    {Array.from({ length: 8 }).map((_, i) => (
      <Guardrail key={`gr3${i}`} position={[-25, 0, -41 - i * 4.2]} />
    ))}
    {/* Segment 3 south edge */}
    {Array.from({ length: 13 }).map((_, i) => (
      <Guardrail key={`gr4${i}`} position={[-18 + i * 10, 0, -85.5]} />
    ))}

    {/* ── ROCKFACE CLIFFS (decorative) ── */}
    <StaticBox position={[130, 12, -40]} args={[4, 24, 100]} color="#6a6055" />
    <StaticBox position={[60, 8, -100]} args={[200, 16, 4]} color="#6a6055" />

    {/* ── PINE TREES ── */}
    {/* Along north of segment 1 */}
    {Array.from({ length: 12 }).map((_, i) => (
      <PineTree key={`t1${i}`} position={[-15 + i * 11, 0, 14 + (i % 3) * 4]} />
    ))}
    {/* Along south of segment 2 */}
    {Array.from({ length: 12 }).map((_, i) => (
      <PineTree key={`t2${i}`} position={[-15 + i * 11, 0, -52 - (i % 3) * 3]} />
    ))}
    {/* Along north of segment 3 */}
    {Array.from({ length: 12 }).map((_, i) => (
      <PineTree key={`t3${i}`} position={[-15 + i * 11, 0, -68 - (i % 3) * 3]} />
    ))}

    {/* ── FINISH ARCH ── */}
    <StaticBox position={[108, 5, 3]} args={[0.4, 10, 0.4]} color="#00ff88" />
    <StaticBox position={[108, 5, -86]} args={[0.4, 10, 0.4]} color="#00ff88" />
    <mesh position={[108, 10.2, -80]}>
      <boxGeometry args={[0.3, 0.3, 10]} />
      <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={1} />
    </mesh>
    <pointLight position={[108, 9, -80]} color="#00ff88" intensity={6} distance={20} />

    {/* ── SPEED CHECKPOINT SIGNAGE (visual markers for the 3 checkpoints) ── */}
    {[[80, 1, 0], [80, 1, -40], [80, 1, -80]].map(([x, y, z], i) => (
      <group key={`cp${i}`} position={[x, y, z]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color="#0066ff" />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[2, 0.5, 0.15]} />
          <meshStandardMaterial color="#0044cc" emissive="#0033aa" emissiveIntensity={0.5} />
        </mesh>
      </group>
    ))}
  </>
);

export default TrackBike2;
