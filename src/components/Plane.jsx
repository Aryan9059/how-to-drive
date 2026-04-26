import { useSphere } from "@react-three/cannon";
import { useFrame, extend } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { shaderMaterial } from "@react-three/drei";
import useControls from "../hooks/useControls";
import * as THREE from "three";
import { Vector3, Quaternion, Euler, MathUtils } from "three";
import simStore from "../simStore";

// ═══════════════════════════════════════════════════════════════
// CUSTOM GLSL SHADER MATERIALS (OpenGL Shading Language)
// Uses drei's shaderMaterial for GPU-accelerated vehicle rendering
// ═══════════════════════════════════════════════════════════════

// --- Fuselage Holographic Metal Shader ---
const FuselageShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color("#e8edf2"),
    uFresnelColor: new THREE.Color("#66ccff"),
    uMetalness: 0.7,
  },
  /* glsl */ `
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
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uFresnelColor;
    uniform float uMetalness;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
      float iridescence = sin(dot(vNormal, vViewDir) * 6.2832 + uTime * 0.5) * 0.5 + 0.5;
      vec3 iriColor = mix(uFresnelColor, vec3(0.6, 0.3, 1.0), iridescence * 0.3);
      float envReflect = smoothstep(0.0, 1.0, dot(reflect(-vViewDir, vNormal), vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
      vec3 diffuse = uBaseColor * (0.6 + 0.4 * dot(vNormal, normalize(vec3(1.0, 2.0, 1.0))));
      vec3 specular = iriColor * fresnel * 1.5;
      vec3 envColor = mix(vec3(0.1, 0.15, 0.2), vec3(0.6, 0.7, 0.9), envReflect) * uMetalness;
      vec3 finalColor = diffuse + specular + envColor * 0.3;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// --- Accent Energy Stripe Shader ---
const AccentEnergyMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#c42b2b"),
    uGlowColor: new THREE.Color("#ff6644"),
  },
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
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float flow = sin(vUv.x * 25.0 - uTime * 4.0) * 0.5 + 0.5;
      flow = smoothstep(0.3, 0.7, flow);
      float scanLine = sin(vUv.y * 60.0 + uTime * 3.0) * 0.5 + 0.5;
      scanLine = pow(scanLine, 4.0);
      float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);
      vec3 energyColor = mix(uColor, uGlowColor, flow * 0.4 + scanLine * 0.2);
      energyColor += uGlowColor * fresnel * 0.5;
      float pulse = sin(uTime * 2.5) * 0.1 + 0.9;
      energyColor *= pulse;
      gl_FragColor = vec4(energyColor, 1.0);
    }
  `
);

extend({ FuselageShaderMaterial, AccentEnergyMaterial });

const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

// ── Flap Notches ─────────────────────────────────────────────
// Notch 0 = 0°, 1 = 10°, 2 = 20°, 3 = 30°, 4 = 40°
const FLAP_ANGLES = [0, 10, 20, 30, 40];
const FLAP_DRAG   = [0, 0.005, 0.012, 0.022, 0.035];
const FLAP_LIFT   = [0, 0.0005, 0.001, 0.0014, 0.0016];

const Plane = ({
  cameraView: _cameraView, // accepted for compatibility; camera managed internally via C key
  startPosition = [0, 5, 0],
  startRotation = [0, Math.PI / 2, 0],
}) => {
  const [body, bodyApi] = useSphere(
    () => ({
      mass: 0,
      type: "Kinematic",
      args: [1.5],
      position: startPosition,
      rotation: startRotation,
      allowSleep: false,
    }),
    useRef(null)
  );

  const propRef       = useRef();
  const fuselageRef   = useRef();
  const accentRef     = useRef();
  const leftFlapRef   = useRef();
  const rightFlapRef  = useRef();
  const gearGroupRef  = useRef();
  const keys          = useControls({});
  const position      = useRef(new Vector3(...startPosition));
  const cameraPos     = useRef(new Vector3());
  const cameraTarget  = useRef(new Vector3());

  // ── camera mode: 0=chase, 1=cockpit, 2=chase-high ───────────
  const cameraMode    = useRef(0);
  const camKeyHeld    = useRef(false);

  // ── one-shot toggle trackers ─────────────────────────────────
  const gearKeyHeld   = useRef(false);
  const flapUpHeld    = useRef(false);
  const flapDnHeld    = useRef(false);
  const brakeHeld     = useRef(false);

  // ── Physics state ─────────────────────────────────────────────
  const physics = useRef({
    speed: 0,
    maxSpeed: 900,          // km/h equivalent
    throttle: 0,
    enginePower: 1.4,
    drag: 0.004,
    liftFactor: 0.0025,
    gravity: 9.8,

    pitch: 0,
    roll: 0,
    heading: MathUtils.radToDeg(startRotation[1]),

    pitchRate: 1.4,
    rollRate:  2.8,
    yawRate:   0.6,

    flaps: 0,        // notch index 0-4
    gearDown: true,
    brakeActive: false,
    prevAlt: startPosition[1],

    quaternion: new Quaternion().setFromEuler(
      new Euler(0, startRotation[1], 0, 'YXZ')
    ),
  });

  // ── Smoothed input ────────────────────────────────────────────
  const input = useRef({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });

  const WORLD_SCALE = 0.1;

  useEffect(() => {
    const unsub = bodyApi.position.subscribe((p) =>
      position.current.set(p[0], p[1], p[2])
    );
    return unsub;
  }, [bodyApi]);

  useFrame((state, delta) => {
    const k   = keys.current;
    const dt  = Math.min(delta, 0.05);
    const p   = physics.current;
    const inp = input.current;

    // ── Throttle: W = increase, S = decrease ─────────────────
    const accelRate = 0.45;
    if (k.KeyW) {
      inp.throttle = Math.min(1, inp.throttle + accelRate * dt);
    } else if (k.KeyS) {
      // Brake reduces throttle faster when brake held too
      const rate = p.brakeActive ? accelRate * 2.5 : accelRate;
      inp.throttle = Math.max(0, inp.throttle - rate * dt);
    }

    // ── Pitch: Arrow Up = nose up, Arrow Down = nose down ────
    const pitchTarget = k.ArrowUp ? 1 : k.ArrowDown ? -1 : 0;
    inp.pitch = lerp(inp.pitch, pitchTarget, 0.12);

    // ── Roll: Arrow Left = roll left, Arrow Right = roll right
    const rollTarget = k.ArrowLeft ? -1 : k.ArrowRight ? 1 : 0;
    inp.roll = lerp(inp.roll, rollTarget, 0.12);

    // ── Yaw (rudder): A = left, D = right ────────────────────
    const yawTarget = k.KeyA ? 1 : k.KeyD ? -1 : 0;
    inp.yaw = lerp(inp.yaw, yawTarget, 0.12);

    // ── Brake: B ─────────────────────────────────────────────
    p.brakeActive = !!k.KeyB;

    // ── Flaps: F = increase (one notch), G = decrease ────────
    if (k.KeyF && !flapUpHeld.current) {
      flapUpHeld.current = true;
      p.flaps = Math.min(4, p.flaps + 1);
    }
    if (!k.KeyF) flapUpHeld.current = false;

    if (k.KeyG && !flapDnHeld.current) {
      flapDnHeld.current = true;
      p.flaps = Math.max(0, p.flaps - 1);
    }
    if (!k.KeyG) flapDnHeld.current = false;

    // ── Landing gear: L = toggle ─────────────────────────────
    if (k.KeyL && !gearKeyHeld.current) {
      gearKeyHeld.current = true;
      p.gearDown = !p.gearDown;
    }
    if (!k.KeyL) gearKeyHeld.current = false;

    // ── Camera: C = cycle views ───────────────────────────────
    if (k.KeyC && !camKeyHeld.current) {
      camKeyHeld.current = true;
      cameraMode.current = (cameraMode.current + 1) % 3;
    }
    if (!k.KeyC) camKeyHeld.current = false;

    // ── Physics ───────────────────────────────────────────────
    p.throttle = inp.throttle;
    let targetSpeed = p.throttle * p.maxSpeed;

    // Brake friction (aerodynamic + wheel if gear down)
    let brakeFriction = 0;
    if (p.brakeActive) {
      brakeFriction = p.gearDown ? 60 : 15;
    }

    p.speed += ((targetSpeed - p.speed) * dt * 1.8) - brakeFriction * dt;
    p.speed = Math.max(0, p.speed);

    // Flap effects on drag
    const flapDrag = FLAP_DRAG[p.flaps];
    const extraDrag = p.speed * flapDrag;
    p.speed = Math.max(0, p.speed - extraDrag * dt * 30);

    // Control effectiveness (controls are sluggish at low speed)
    const controlEffectiveness = Math.min(1, Math.max(0, p.speed / 120));

    // Quaternion rotation
    const localPitch = inp.pitch * p.pitchRate * dt * controlEffectiveness;
    const localRoll  = inp.roll  * p.rollRate  * dt * controlEffectiveness;
    const localYaw   = inp.yaw   * p.yawRate   * dt * controlEffectiveness;

    const qPitch = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), localPitch);
    const qRoll  = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), localRoll);
    const qYaw   = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), localYaw);

    p.quaternion.multiply(qYaw).multiply(qPitch).multiply(qRoll).normalize();

    const euler = new Euler().setFromQuaternion(p.quaternion, 'YXZ');
    p.heading = MathUtils.radToDeg(euler.y);
    p.pitch   = MathUtils.radToDeg(euler.x);
    p.roll    = MathUtils.radToDeg(euler.z);

    // Position update
    const headingRad = MathUtils.degToRad(p.heading);
    const pitchRad   = MathUtils.degToRad(p.pitch);
    const moveDist   = p.speed * dt * WORLD_SCALE;

    const dx = moveDist * Math.sin(headingRad) * Math.cos(pitchRad);
    const dy = moveDist * Math.sin(pitchRad);
    const dz = moveDist * Math.cos(headingRad) * Math.cos(pitchRad);

    const pos  = position.current;
    const newX = pos.x + dx;
    const newY = Math.max(0.5, pos.y + dy);
    const newZ = pos.z + dz;

    bodyApi.position.set(newX, newY, newZ);
    bodyApi.quaternion.set(p.quaternion.x, p.quaternion.y, p.quaternion.z, p.quaternion.w);
    bodyApi.velocity.set(0, 0, 0);
    bodyApi.angularVelocity.set(0, 0, 0);

    // Vertical speed (m/s)
    const vsi = (newY - p.prevAlt) / dt;
    p.prevAlt = newY;

    // ── SimStore update ───────────────────────────────────────
    simStore.speed       = p.speed;
    simStore.engineState = "on";
    simStore.gear        = Math.ceil(p.throttle * 4) || 0;
    simStore.rpm         = p.throttle * 8000;
    simStore.altitude    = newY;
    simStore.throttle    = p.throttle;
    simStore.flaps       = p.flaps;
    simStore.gearDown    = p.gearDown;
    simStore.brakeActive = p.brakeActive;
    simStore.planePitch  = p.pitch;
    simStore.planeRoll   = p.roll;
    // Normalize heading to 0-360
    simStore.planeHeading = ((p.heading % 360) + 360) % 360;
    simStore.verticalSpeed = vsi;
    simStore.position    = [newX, newY, newZ];

    // ── Propeller animation ───────────────────────────────────
    if (propRef.current) {
      propRef.current.rotation.z += (0.2 + p.throttle * 0.8) * dt * 30;
    }

    // ── Flap visual angle ─────────────────────────────────────
    const flapAngleRad = MathUtils.degToRad(FLAP_ANGLES[p.flaps]);
    if (leftFlapRef.current)  leftFlapRef.current.rotation.x  =  flapAngleRad * 0.6;
    if (rightFlapRef.current) rightFlapRef.current.rotation.x =  flapAngleRad * 0.6;

    // ── Landing gear visual ───────────────────────────────────
    if (gearGroupRef.current) {
      const targetY = p.gearDown ? 0 : 0.9;
      gearGroupRef.current.position.y = lerp(gearGroupRef.current.position.y, targetY, 0.1);
    }

    // ── GLSL shader time uniforms ─────────────────────────────
    const elapsed = state.clock.elapsedTime;
    if (fuselageRef.current) fuselageRef.current.uTime = elapsed;
    if (accentRef.current)   accentRef.current.uTime   = elapsed;

    // ── Reset ─────────────────────────────────────────────────
    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);

      p.speed = 0;
      p.throttle = 0;
      p.flaps = 0;
      p.gearDown = true;
      p.brakeActive = false;
      p.heading = MathUtils.radToDeg(startRotation[1]);
      p.pitch = 0;
      p.roll = 0;
      p.prevAlt = startPosition[1];
      p.quaternion.setFromEuler(new Euler(0, startRotation[1], 0, 'YXZ'));

      inp.throttle = 0;
      inp.pitch = 0;
      inp.roll = 0;
      inp.yaw = 0;
    }

    // ── Camera ────────────────────────────────────────────────
    const mode = cameraMode.current;
    if (mode === 0) {
      // Chase cam — behind & above
      const camOffset = new Vector3(
        -Math.sin(headingRad) * 18,
        6 - pitchRad * 5,
        -Math.cos(headingRad) * 18
      );
      const desiredCam = new Vector3(newX, newY, newZ).add(camOffset);
      cameraPos.current.lerp(desiredCam, Math.min(1, dt * 4));
      cameraTarget.current.lerp(new Vector3(newX, newY, newZ), Math.min(1, dt * 6));
      state.camera.position.copy(cameraPos.current);
      state.camera.lookAt(cameraTarget.current);
    } else if (mode === 1) {
      // Cockpit / nose cam
      const fwd = new Vector3(
        Math.sin(headingRad) * Math.cos(pitchRad),
        Math.sin(pitchRad),
        Math.cos(headingRad) * Math.cos(pitchRad)
      );
      const camPos = new Vector3(newX, newY + 0.8, newZ).addScaledVector(fwd, 2.5);
      cameraPos.current.lerp(camPos, Math.min(1, dt * 12));
      cameraTarget.current.lerp(new Vector3(newX, newY, newZ).addScaledVector(fwd, 20), Math.min(1, dt * 12));
      state.camera.position.copy(cameraPos.current);
      state.camera.lookAt(cameraTarget.current);
    } else {
      // High-altitude / orbit cam
      const camOffset = new Vector3(
        -Math.sin(headingRad) * 30,
        20,
        -Math.cos(headingRad) * 30
      );
      const desiredCam = new Vector3(newX, newY, newZ).add(camOffset);
      cameraPos.current.lerp(desiredCam, Math.min(1, dt * 2.5));
      cameraTarget.current.lerp(new Vector3(newX, newY, newZ), Math.min(1, dt * 3));
      state.camera.position.copy(cameraPos.current);
      state.camera.lookAt(cameraTarget.current);
    }
  });

  return (
    <group ref={body}>
      {/* Main Fuselage — Holographic Metal Shader */}
      <mesh castShadow position={[0, 0, -0.5]} scale={[0.7, 0.8, 3.5]}>
        <sphereGeometry args={[1, 64, 32]} />
        <fuselageShaderMaterial ref={fuselageRef} />
      </mesh>

      {/* Accent stripe */}
      <mesh castShadow position={[0, 0, -0.5]} scale={[0.72, 0.3, 3.5]}>
        <sphereGeometry args={[1, 64, 32]} />
        <accentEnergyMaterial ref={accentRef} />
      </mesh>

      {/* Engine Cowling */}
      <mesh castShadow position={[0, 0, 2.7]} scale={[0.65, 0.7, 0.8]}>
        <sphereGeometry args={[1, 32, 32]} />
        <fuselageShaderMaterial />
      </mesh>

      {/* Cockpit Canopy */}
      <mesh castShadow position={[0, 0.6, 0.2]} scale={[0.5, 0.45, 0.9]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color="#aaddff"
          transmission={0.9}
          opacity={1}
          metalness={0.1}
          roughness={0.05}
          ior={1.5}
          thickness={0.2}
        />
      </mesh>

      {/* Main Wings */}
      <mesh castShadow position={[0, -0.15, 0.5]} scale={[4.8, 0.06, 0.85]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color="#e0e8f0" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Wing Flaps (animated) */}
      <mesh ref={leftFlapRef}  castShadow position={[-2.8, -0.18, -0.15]} scale={[1.6, 0.055, 0.45]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c8d8e8" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh ref={rightFlapRef} castShadow position={[ 2.8, -0.18, -0.15]} scale={[1.6, 0.055, 0.45]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c8d8e8" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Horizontal Stabilizer */}
      <mesh castShadow position={[0, 0.1, -3.4]} scale={[1.8, 0.04, 0.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#e0e8f0" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Vertical Stabilizer */}
      <mesh castShadow position={[0, 0.8, -3.5]} scale={[0.05, 0.9, 0.6]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c42b2b" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Propeller System */}
      <group ref={propRef} position={[0, 0, 3.45]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.25, 0.6, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[0.12, 1.4, 0.03]} />
              <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[0.125, 0.2, 0.035]} />
              <meshStandardMaterial color="#ffd700" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Landing Gear (animated) */}
      <group ref={gearGroupRef}>
        {/* Main gear */}
        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, -0.7, 0.5]}>
            <mesh position={[0, 0.3, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
              <meshStandardMaterial color="#666" metalness={0.8} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.16, 16]} />
              <meshStandardMaterial color="#ccc" metalness={0.7} />
            </mesh>
          </group>
        ))}
        {/* Nose wheel */}
        <group position={[0, -0.6, 2.2]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Nav lights */}
      <pointLight position={[-6, 0.5, 0.5]} color="#ff3333" intensity={2} distance={5} />
      <pointLight position={[ 6, 0.5, 0.5]} color="#33ff33" intensity={2} distance={5} />
      <pointLight position={[ 0, 2, -3]}    color="#ffffff" intensity={5} distance={10} />
    </group>
  );
};

export default Plane;