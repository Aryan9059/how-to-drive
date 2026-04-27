import { useSphere } from "@react-three/cannon";
import { useFrame, extend } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { shaderMaterial } from "@react-three/drei";
import useControls from "../hooks/useControls";
import * as THREE from "three";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

// ═══════════════════════════════════════════════════════════════
// CUSTOM GLSL SHADER MATERIAL (OpenGL Shading Language)
// Uses drei's shaderMaterial for GPU-accelerated helicopter rendering
// ═══════════════════════════════════════════════════════════════

// --- Helicopter Cabin Shader ---
// Dynamic metallic paint with animated fresnel glow and iridescence
const CabinShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color("#223344"),
    uGlowColor: new THREE.Color("#44aaff"),
    uMetalness: 0.65,
  },

  // Vertex Shader (GLSL - OpenGL)
  `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `,

  // Fragment Shader (GLSL - OpenGL)
  `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uGlowColor;
    uniform float uMetalness;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      // Directional lighting (sun from above-right)
      vec3 lightDir = normalize(vec3(1.0, 2.0, 0.5));
      float NdotL = max(dot(vNormal, lightDir), 0.0);
      float diffuse = 0.4 + 0.6 * NdotL;

      // Fresnel rim lighting (classic OpenGL technique)
      float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.5);

      // Animated iridescent color shift based on view angle
      float iriAngle = dot(vNormal, vViewDir) * 6.2832;
      float iriShift = sin(iriAngle + uTime * 0.8) * 0.5 + 0.5;
      vec3 iriColor = mix(uGlowColor, vec3(0.2, 0.6, 1.0), iriShift * 0.5);

      // Specular highlight (Blinn-Phong OpenGL model)
      vec3 halfDir = normalize(lightDir + vViewDir);
      float specular = pow(max(dot(vNormal, halfDir), 0.0), 64.0);

      // Fake environment reflection
      vec3 reflectDir = reflect(-vViewDir, vNormal);
      float envReflect = smoothstep(-0.2, 1.0, reflectDir.y);
      vec3 envColor = mix(vec3(0.05, 0.08, 0.12), vec3(0.3, 0.5, 0.7), envReflect);

      // Combine all lighting
      vec3 color = uBaseColor * diffuse;
      color += iriColor * fresnel * 1.2;
      color += vec3(1.0) * specular * 0.4;
      color += envColor * uMetalness * 0.35;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// --- Tail Boom Energy Pulse Shader ---
// Animated flowing energy along the tail boom with pulsing glow
const TailGlowMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#1a2533"),
    uPulseColor: new THREE.Color("#00ffaa"),
  },
  // Vertex Shader (GLSL - OpenGL)
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  // Fragment Shader (GLSL - OpenGL)
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uPulseColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      // Animated energy flow along UV.y (length of the boom)
      float flow = sin(vUv.y * 20.0 - uTime * 5.0) * 0.5 + 0.5;
      flow = smoothstep(0.25, 0.75, flow);

      // Circular pulse ring traveling along the boom
      float ring = sin(vUv.y * 40.0 - uTime * 8.0) * 0.5 + 0.5;
      ring = pow(ring, 12.0);

      // Fresnel edge glow
      float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);

      // Combine dark base with energy pulse
      vec3 energyColor = mix(uColor, uPulseColor, flow * 0.2 + ring * 0.6);
      energyColor += uPulseColor * fresnel * 0.4;

      // Breathing pulse
      float pulse = sin(uTime * 3.0) * 0.08 + 0.92;
      energyColor *= pulse;

      gl_FragColor = vec4(energyColor, 1.0);
    }
  `
);

// Register shader materials with React Three Fiber's extend system
extend({ CabinShaderMaterial, TailGlowMaterial });

const Helicopter = ({
  cameraView,
  startPosition = [0, 8, 0],
  startRotation = [0, Math.PI / 2, 0],
}) => {
  const [body, bodyApi] = useSphere(
    () => ({
      mass: 1200,
      args: [1.2],
      position: startPosition,
      rotation: startRotation,
      linearDamping: 0.25,
      angularDamping: 0.99,
      allowSleep: false,
    }),
    useRef(null)
  );

  const keys = useControls({});
  const velocity = useRef([0, 0, 0]);
  const position = useRef(new Vector3(...startPosition));
  const yaw = useRef(startRotation[1]);
  const pitch = useRef(0);
  const roll = useRef(0);
  const collective = useRef(0);
  const gearDown = useRef(true);
  const prevGKey = useRef(false);
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  const rotorAngle = useRef(0);
  const rotorRef = useRef();
  const tailRotorRef = useRef();
  const cabinShaderRef = useRef(); // Ref for custom GLSL cabin shader material
  const tailGlowRef = useRef(); // Ref for custom GLSL tail glow shader material

  useEffect(() => {
    const unsub = bodyApi.velocity.subscribe((v) => { velocity.current = v; });
    return unsub;
  }, [bodyApi]);

  useEffect(() => {
    const unsubPos = bodyApi.position.subscribe((p) => {
      position.current.set(p[0], p[1], p[2]);
    });
    return unsubPos;
  }, [bodyApi]);

  useFrame((state, delta) => {
    const k = keys.current;

    // ── Landing Gear Toggle (G key, tap) ──────────────────────
    if (k.KeyG && !prevGKey.current) {
      gearDown.current = !gearDown.current;
    }
    prevGKey.current = !!k.KeyG;

    // ── Collective (W = climb, S = descend) ───────────────────
    if (k.KeyW) collective.current = Math.min(1, collective.current + delta * 1.2);
    else if (k.KeyS) collective.current = Math.max(0, collective.current - delta * 0.8);
    // Ctrl → gradual descent (reduces collective slowly)
    else if (k.ControlLeft) collective.current = Math.max(0, collective.current - delta * 0.4);
    else collective.current += (0.5 - collective.current) * Math.min(1, delta * 0.5);

    // ── Boost modifier (Shift) ────────────────────────────────
    const boostMul = (k.ShiftLeft || k.ShiftRight) ? 1.5 : 1.0;

    // ── Yaw (A = rotate left, D = rotate right) ──────────────
    if (k.KeyA) yaw.current += delta * 1.8;
    if (k.KeyD) yaw.current -= delta * 1.8;

    // ── Hover Stabilization (Space = auto-level) ─────────────
    if (k.Space) {
      // Rapidly return pitch and roll to 0
      pitch.current += (0 - pitch.current) * Math.min(1, delta * 8);
      roll.current += (0 - roll.current) * Math.min(1, delta * 8);
    } else {
      // ── Cyclic: Pitch (Arrow Up/Down) ──────────────────────
      const targetPitch = k.ArrowUp ? -0.5 * boostMul : k.ArrowDown ? 0.35 * boostMul : 0;
      pitch.current += (targetPitch - pitch.current) * Math.min(1, delta * 5);

      // ── Cyclic: Roll (Arrow Left/Right) ────────────────────
      const arrowRoll = k.ArrowLeft ? -0.45 * boostMul : k.ArrowRight ? 0.45 * boostMul : 0;
      // ── Fine Roll (Q/E) ────────────────────────────────────
      const fineRoll = k.KeyQ ? -0.2 : k.KeyE ? 0.2 : 0;
      const targetRoll = arrowRoll || fineRoll;
      roll.current += (targetRoll - roll.current) * Math.min(1, delta * 5);
    }

    // Natural damping when no input
    if (!k.ArrowUp && !k.ArrowDown && !k.Space) {
      pitch.current *= 0.97;
    }
    if (!k.ArrowLeft && !k.ArrowRight && !k.KeyQ && !k.KeyE && !k.Space) {
      roll.current *= 0.97;
    }

    // ── Telemetry ─────────────────────────────────────────────
    const [vx, vy, vz] = velocity.current;
    const horizontalSpeed = Math.sqrt(vx * vx + vz * vz) * 3.6;
    const totalSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3.6;

    // Heading from yaw (convert to 0-360 degrees)
    const headingDeg = (((-yaw.current * 180) / Math.PI) % 360 + 360) % 360;

    simStore.speed = totalSpeed;
    simStore.engineState = "on";
    simStore.gear = collective.current > 0.1 ? 1 : 0;
    simStore.rpm = collective.current * 8000;
    simStore.altitude = position.current.y;

    // Helicopter-specific telemetry for HUD
    simStore.heliPitch = pitch.current * (180 / Math.PI) * 3; // amplify for display
    simStore.heliRoll = roll.current * (180 / Math.PI) * 3;
    simStore.heliHeading = headingDeg;
    simStore.heliVerticalSpeed = vy;
    simStore.heliThrottle = collective.current;
    simStore.heliGearDown = gearDown.current;

    // ── Physics Forces ────────────────────────────────────────
    const WEIGHT = 1200 * 9.82;
    const liftForce = collective.current * WEIGHT * 2.2;
    bodyApi.applyForce([0, liftForce - WEIGHT, 0], [0, 0, 0]);

    // Directional Vectors
    const fwdX = -Math.sin(yaw.current);
    const fwdZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);

    const horizontalForce = 8000 * Math.max(0.3, collective.current) * boostMul;
    bodyApi.applyForce([
      (fwdX * pitch.current + rightX * roll.current) * horizontalForce,
      0,
      (fwdZ * pitch.current + rightZ * roll.current) * horizontalForce,
    ], [0, 0, 0]);

    // Visual Rotation
    const visQuat = new Quaternion();
    visQuat.setFromEuler(new Euler(-pitch.current * 0.5, yaw.current, -roll.current * 0.5, 'YXZ'));
    bodyApi.quaternion.set(visQuat.x, visQuat.y, visQuat.z, visQuat.w);

    // Rotor Animations
    rotorAngle.current += delta * (collective.current > 0.05 ? 25 : 5);
    if (rotorRef.current) rotorRef.current.rotation.y = rotorAngle.current;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x = rotorAngle.current * 4;

    // Update custom GLSL shader uniforms (OpenGL time animation)
    const elapsed = state.clock.elapsedTime;
    if (cabinShaderRef.current) {
      cabinShaderRef.current.uTime = elapsed;
    }
    if (tailGlowRef.current) {
      tailGlowRef.current.uTime = elapsed;
    }

    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);
      collective.current = 0;
      pitch.current = 0;
      roll.current = 0;
      yaw.current = startRotation[1];
      gearDown.current = true;
    }

    // Camera Logic
    if (cameraView === 0) return;
    const pos = position.current;
    simStore.position = [pos.x, pos.y, pos.z];
    const camOffset = new Vector3(
      -Math.sin(yaw.current) * 12,
      5,
      -Math.cos(yaw.current) * 12
    );
    const desiredCam = pos.clone().add(camOffset);
    cameraPos.current.lerp(desiredCam, Math.min(1, delta * 4));
    cameraTarget.current.lerp(pos, Math.min(1, delta * 4));
    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={body}>
      {/* ========================================= */}
      {/* UPGRADED VISUAL MODEL */}
      {/* ========================================= */}

      {/* Main Cabin — Custom GLSL Metallic Shader (OpenGL) */}
      <mesh castShadow position={[0, 0, 0]} scale={[1.1, 1.3, 2.2]}>
        <sphereGeometry args={[1, 64, 32]} />
        <cabinShaderMaterial ref={cabinShaderRef} />
      </mesh>

      {/* Cockpit Canopy (Refractive Glass) */}
      <mesh position={[0, 0.25, 1.4]} scale={[0.85, 0.85, 1.1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transmission={0.9}
          opacity={1}
          metalness={0.1}
          roughness={0.05}
          ior={1.5}
          thickness={0.2}
        />
      </mesh>

      {/* Tail Boom — Custom GLSL Energy Pulse Shader (OpenGL) */}
      <mesh position={[0, 0.3, -2.8]} rotation={[0.03, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.1, 3.8, 16]} />
        <tailGlowMaterial ref={tailGlowRef} />
      </mesh>

      {/* Tail Fin (Vertical Stabilizer) — Custom GLSL Shader (OpenGL) */}
      <mesh position={[0, 0.7, -4.5]} scale={[0.08, 1.2, 0.7]} rotation={[-0.15, 0, 0]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <cabinShaderMaterial />
      </mesh>

      {/* Tail Wing (Horizontal Stabilizer) — Custom GLSL Shader (OpenGL) */}
      <mesh position={[0, 0.4, -4.2]} scale={[1.2, 0.04, 0.3]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <tailGlowMaterial />
      </mesh>

      {/* Main Rotor Mast */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>

      {/* Main Rotor Assembly */}
      <group ref={rotorRef} position={[0, 1.75, 0]}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        {/* 4 Blades */}
        {[0, Math.PI / 2].map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0]} castShadow>
            <boxGeometry args={[8.5, 0.04, 0.35]} />
            <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Tail Rotor Hub & Blades */}
      <group position={[0.15, 1.1, -4.6]}>
        {/* Tail Hub */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        {/* Tail Blades */}
        <group ref={tailRotorRef} position={[0.1, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.04, 1.6, 0.15]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </group>

      {/* Landing Skids */}
      {[-0.85, 0.85].map((x, i) => (
        <group key={i} position={[x, -1.0, 0]}>
          {/* Main Skid Tube */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 4.5, 16]} />
            <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Front Curve Cap */}
          <mesh position={[0, 0, 2.25]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Strut Front */}
          <mesh position={[0, 0.5, 1.2]} rotation={[0, 0, x > 0 ? 0.25 : -0.25]}>
            <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Strut Rear */}
          <mesh position={[0, 0.5, -1.2]} rotation={[0, 0, x > 0 ? 0.25 : -0.25]}>
            <cylinderGeometry args={[0.05, 0.05, 1.1, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* Spotlight */}
      <pointLight position={[0, -0.8, 1.5]} intensity={80} color="#fff8e0" distance={60} />
    </group>
  );
};

export default Helicopter;