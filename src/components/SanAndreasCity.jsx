import { useRef } from "react";
import { useBox, useCylinder } from "@react-three/cannon";

// PHYSICAL Box
const StaticBox = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useBox(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

// PHYSICAL Cylinder
const StaticCylinder = ({ position, args, color = "#888", rotation = [0, 0, 0] }) => {
  useCylinder(() => ({ type: "Static", args, position, rotation }), useRef(null));
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

// PHYSICAL Road surface to prevent sinking
const Road = ({ position, args, rotation = [0, 0, 0], color = "#2c2c2c" }) => {
  // Use a thin box for the road surface physics
  useBox(() => ({ 
    type: "Static", 
    args: [args[0], 0.1, args[1]], 
    position: [position[0], position[1] - 0.05, position[2]], 
    rotation 
  }), useRef(null));
  
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

const Tree = ({ position }) => (
  <group position={position}>
    <StaticBox position={[0, 2, 0]} args={[0.6, 4, 0.6]} color="#4a3018" />
    <mesh position={[0, 7, 0]} castShadow>
      <sphereGeometry args={[3, 16, 16]} />
      <meshStandardMaterial color="#2d5a27" />
    </mesh>
  </group>
);

const StreetLight = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <StaticBox position={[0, 6, 0]} args={[0.3, 12, 0.3]} color="#333" />
    <StaticBox position={[0, 12, 1.5]} args={[0.3, 0.3, 3]} color="#333" />
    <mesh position={[0, 11.8, 2.8]}>
      <sphereGeometry args={[0.6, 8, 8]} />
      <meshStandardMaterial color="#fff" emissive="#ffffaa" emissiveIntensity={2} />
    </mesh>
    <pointLight position={[0, 11, 3]} intensity={15} distance={40} color="#ffffaa" />
  </group>
);

const SanAndreasCity = () => {
  return (
    <>
      {/* =========================================
          GANTON & GROVE STREET (Denser Neighborhood)
      ========================================= */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[45, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        
        <Road position={[0, 0.01, -90]} rotation={[-Math.PI / 2, 0, 0]} args={[25, 150]} />
        
        {/* Houses & Local Shops */}
        <StaticBox position={[-35, 4, 25]}  args={[12, 8, 16]} color="#7a907a" />
        <StaticBox position={[-40, 4, -15]} args={[14, 8, 14]} color="#b0a080" />
        <StaticBox position={[45, 4, 25]}   args={[16, 8, 12]} color="#806050" />
        <StaticBox position={[40, 4, -15]}  args={[12, 8, 14]} color="#909090" />
        <StaticBox position={[0, 4, 45]}    args={[18, 8, 14]} color="#607080" />
        
        {/* Small Detail Props */}
        {[...Array(6)].map((_, i) => (
          <StaticBox key={`f-${i}`} position={[-25 + i * 10, 1, 40]} args={[8, 2, 1]} color="#444" />
        ))}

        <StreetLight position={[20, 0, 10]} rotation={[0, -Math.PI / 2, 0]} />
        <StreetLight position={[-20, 0, -10]} rotation={[0, Math.PI / 2, 0]} />
      </group>

      {/* =========================================
          FREEWAY & MAJOR BOULEVARDS
      ========================================= */}
      <Road position={[0, 0.02, -500]} rotation={[-Math.PI / 2, 0, 0]} args={[4000, 60]} color="#111" />
      <StaticBox position={[0, 0.5, -500]} args={[4000, 1.2, 2.5]} color="#777" /> 

      <Road position={[-600, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[60, 4000]} color="#111" />
      <StaticBox position={[-600, 0.5, 0]} args={[2.5, 1.2, 4000]} color="#777" />

      {/* Dense Grid Districts */}
      {[...Array(12)].map((_, i) => (
        <Road key={`gr-h-${i}`} position={[0, 0.01, -700 - (i * 200)]} rotation={[-Math.PI / 2, 0, 0]} args={[1600, 30]} />
      ))}
      {[...Array(16)].map((_, i) => (
        <Road key={`gr-v-${i}`} position={[-800 + (i * 120), 0.01, -1500]} rotation={[-Math.PI / 2, 0, 0]} args={[30, 1800]} />
      ))}

      {/* =========================================
          DOWNTOWN (EXTREME DENSITY)
      ========================================= */}
      <group position={[-400, 0, -900]}>
        {/* Maze Bank Tower */}
        <StaticCylinder position={[0, 200, 0]} args={[50, 50, 400, 16]} color="#eef" />
        <StaticCylinder position={[0, 420, 0]} args={[30, 30, 60, 16]} color="#eef" />
        <StaticBox position={[0, 460, 0]} args={[2, 80, 2]} color="#f00" />

        {/* 100+ Skyscrapers & Commercial Buildings */}
        {[...Array(80)].map((_, i) => (
          <StaticBox 
            key={`dt-dense-${i}`}
            position={[
              (i % 10) * 80 - 400, 
              (40 + Math.random() * 120), 
              Math.floor(i / 10) * 80 - 400
            ]}
            args={[55, 80 + Math.random() * 240, 55]}
            color={["#1e272e", "#485460", "#2f3542", "#57606f", "#dfe4ea", "#ced6e0"][i % 6]}
          />
        ))}
        
        {/* Sky-bridges between towers */}
        <StaticBox position={[80, 150, 0]} args={[160, 5, 8]} color="#333" />
        <StaticBox position={[-80, 120, 80]} args={[8, 5, 160]} color="#333" />
      </group>

      {/* =========================================
          STADIUM (LS FORUM)
      ========================================= */}
      <group position={[500, 0, -400]}>
        <StaticCylinder position={[0, 35, 0]} args={[200, 220, 70, 32]} color="#d0c9b8" />
        <StaticCylinder position={[0, 75, 0]} args={[200, 200, 15, 32]} color="#ff4444" />
        
        {/* Parking Lot */}
        <Road position={[0, 0.01, 300]} rotation={[-Math.PI / 2, 0, 0]} args={[600, 400]} color="#333" />
        {[...Array(40)].map((_, i) => (
          <StaticBox key={`st-p-${i}`} position={[(i % 10) * 50 - 225, 0.5, 200 + Math.floor(i / 10) * 50]} args={[15, 1, 30]} color="#111" />
        ))}
      </group>

      {/* =========================================
          THE PORT & BEACH
      ========================================= */}
      <group position={[1000, 0, 800]}>
        {/* Santa Maria Pier */}
        <StaticBox position={[-150, 3, 0]} args={[80, 6, 800]} color="#a6815a" />
        <Road position={[-150, 6.1, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[80, 800]} color="#423526" />
        
        {/* Ferris Wheel */}
        <StaticCylinder position={[-150, 50, 150]} rotation={[0, 0, Math.PI / 2]} args={[55, 55, 12, 16]} color="#f9ca24" />
        
        {/* Beach Boardwalk with Shops */}
        {[...Array(15)].map((_, i) => (
          <StaticBox key={`bh-${i}`} position={[50, 10, -350 + i * 50]} args={[40, 20, 30]} color="#7ed6df" />
        ))}
      </group>

      {/* =========================================
          AIRPORT (LS INT)
      ========================================= */}
      <group position={[-1200, 0, 800]}>
        <Road position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[1200, 1600]} color="#222" />
        {/* Main Runways with Lights */}
        <Road position={[300, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 1500]} color="#000" />
        <Road position={[-300, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 1500]} color="#000" />
        
        {/* Hangers and Terminals */}
        {[...Array(6)].map((_, i) => (
          <StaticBox key={`hgr-${i}`} position={[550, 20, -600 + i * 200]} args={[100, 40, 160]} color="#95afc0" />
        ))}
        
        <StaticCylinder position={[0, 100, -700]} args={[20, 25, 200, 16]} color="#ccd" />
      </group>

      {/* =========================================
          VINEWOOD
      ========================================= */}
      <group position={[0, 0, -2200]}>
        <group position={[0, 140, 0]}>
          {["V", "I", "N", "E", "W", "O", "O", "D"].map((letter, i) => (
            <StaticBox key={i} position={[(i - 3.5) * 80, 0, 0]} args={[60, 120, 10]} color="#fff" />
          ))}
        </group>
        {/* Vinewood Lights */}
        {[...Array(12)].map((_, i) => (
          <pointLight key={`v-l-${i}`} position={[(i - 5.5) * 120, 80, -80]} intensity={15} color="#fff" />
        ))}
      </group>

      {/* =========================================
          INDUSTRIAL / DOCKS Detail
      ========================================= */}
      <group position={[1200, 0, -800]}>
        {[...Array(50)].map((_, i) => (
          <StaticBox 
            key={`cont-${i}`} 
            position={[(i % 5) * 45, 5 + Math.random() * 10, (i / 5) * 45]} 
            args={[40, 20, 20]} 
            color={["#eb4d4b", "#6ab04c", "#f0932b", "#130f40"][i % 4]} 
          />
        ))}
        <StaticBox position={[0, 60, 0]} args={[20, 120, 20]} color="#535c68" />
      </group>
    </>
  );
};

export default SanAndreasCity;
