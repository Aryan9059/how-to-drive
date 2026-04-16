import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler, MathUtils } from "three";
import simStore from "../simStore";

// Utility: linear interpolation for smooth input (from PlaneController)
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

const Plane = ({
  cameraView,
  startPosition = [0, 5, 0],
  startRotation = [0, Math.PI / 2, 0],
}) => {
  // Kinematic body — we drive position & rotation directly (matches reference approach)
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

  const propRef = useRef();
  const keys = useControls({});
  const position = useRef(new Vector3(...startPosition));
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  // ═══════════════════════════════════════════════════════════
  // PLANE PHYSICS STATE (ported from PlanePhysics class)
  // ═══════════════════════════════════════════════════════════
  const physics = useRef({
    speed: 100,
    maxSpeed: 1000,
    minSpeed: 100,
    throttle: 0.5,
    enginePower: 1.2,
    drag: 0.005,
    liftFactor: 0.002,
    gravity: 9.8,

    pitch: 0,    // degrees
    roll: 0,     // degrees
    heading: MathUtils.radToDeg(startRotation[1]),

    pitchRate: 1.2,
    rollRate: 2.5,
    yawRate: 0.5,

    // Boost system
    isBoosting: false,
    boostTimeRemaining: 0,
    boostDuration: 2.5,
    boostMultiplier: 1.5,
    boostRotations: 2,
    boostPressed: false,

    // Quaternion-based orientation (core of the reference physics)
    quaternion: new Quaternion().setFromEuler(
      new Euler(0, startRotation[1], 0, 'YXZ')
    ),
  });

  // ═══════════════════════════════════════════════════════════
  // SMOOTHED INPUT STATE (ported from PlaneController class)
  // ═══════════════════════════════════════════════════════════
  const input = useRef({
    throttle: 0.5,
    pitch: 0,
    roll: 0,
    yaw: 0,
    boost: false,
  });

  // World-space movement scale (adjusts reference speed units to scene scale)
  const WORLD_SCALE = 0.1;

  useEffect(() => {
    const unsubPos = bodyApi.position.subscribe((p) => {
      position.current.set(p[0], p[1], p[2]);
    });
    return unsubPos;
  }, [bodyApi]);

  useFrame((state, delta) => {
    const k = keys.current;
    const dt = Math.min(delta, 0.05); // Cap delta to prevent physics explosions
    const p = physics.current;
    const inp = input.current;

    // ──────────────────────────────────────────────
    // INPUT PROCESSING (from PlaneController.update)
    // Inputs are lerped for smooth, non-twitchy control
    // ──────────────────────────────────────────────

    // Throttle: W = increase, S = decrease (gradual, like reference accelRate)
    const accelRate = 0.5;
    if (k.KeyW) {
      inp.throttle = Math.min(1, inp.throttle + accelRate * dt);
    } else if (k.KeyS) {
      inp.throttle = Math.max(0, inp.throttle - accelRate * dt);
    }

    // Pitch: Space/ArrowDown = climb (nose up), Shift/ArrowUp = dive (nose down)
    const pitchUp = k.Space || k.ArrowDown;
    const pitchDown = k.ShiftLeft || k.ShiftRight || k.ArrowUp;
    const pitchTarget = pitchUp ? 1 : pitchDown ? -1 : 0;
    inp.pitch = lerp(inp.pitch, pitchTarget, 0.1);

    // Roll: ArrowRight = roll left, ArrowLeft = roll right
    const rollTarget = k.ArrowRight ? 1 : k.ArrowLeft ? -1 : 0;
    inp.roll = lerp(inp.roll, rollTarget, 0.1);

    // Yaw: A = turn left, D = turn right
    const yawTarget = k.KeyA ? 1 : k.KeyD ? -1 : 0;
    inp.yaw = lerp(inp.yaw, yawTarget, 0.1);

    // Boost: B key (Space is used for pitch in this project)
    inp.boost = !!k.KeyB;

    // ──────────────────────────────────────────────
    // PHYSICS UPDATE (from PlanePhysics.update)
    // ──────────────────────────────────────────────

    // --- Boost logic ---
    if (p.boostTimeRemaining > 0) {
      p.boostTimeRemaining -= dt;
      if (p.boostTimeRemaining <= 0) {
        p.isBoosting = false;
        p.boostTimeRemaining = 0;
      }
    }

    if (inp.boost) {
      if (!p.boostPressed && !p.isBoosting) {
        p.isBoosting = true;
        p.boostTimeRemaining = p.boostDuration;
      }
      p.boostPressed = true;
    } else {
      p.boostPressed = false;
    }

    // --- Speed calculation ---
    p.throttle = inp.throttle;
    let targetSpeed = p.minSpeed + (p.throttle * (p.maxSpeed - p.minSpeed));

    if (p.isBoosting) {
      targetSpeed = p.maxSpeed * p.boostMultiplier;
    }

    // Speed lerps toward target (smoother than instant changes)
    p.speed += (targetSpeed - p.speed) * dt * (p.isBoosting ? 4 : 2);

    // --- Control effectiveness (controls are weaker at low speed) ---
    const controlEffectiveness = p.speed > p.minSpeed ? 1 : (p.speed / p.minSpeed);

    // --- Quaternion-based rotation (core reference physics) ---
    // Each axis rotation is applied as a local-space quaternion multiplication.
    // This prevents gimbal lock and gives proper 3D flight behavior.
    const localPitch = inp.pitch * p.pitchRate * dt * controlEffectiveness;
    const localRoll = inp.roll * p.rollRate * dt * controlEffectiveness;
    const localYaw = inp.yaw * p.yawRate * dt * controlEffectiveness;

    const qPitch = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), localPitch);
    const qRoll = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), localRoll);
    const qYaw = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), localYaw);

    // Order: yaw → pitch → roll (same as reference)
    p.quaternion.multiply(qYaw);
    p.quaternion.multiply(qPitch);
    p.quaternion.multiply(qRoll);
    p.quaternion.normalize();

    // Extract Euler angles for HUD display and position calculation
    const euler = new Euler().setFromQuaternion(p.quaternion, 'YXZ');
    p.heading = MathUtils.radToDeg(euler.y);
    p.pitch = MathUtils.radToDeg(euler.x);
    p.roll = MathUtils.radToDeg(euler.z);

    // ──────────────────────────────────────────────
    // POSITION UPDATE
    // Forward direction derived from heading + pitch (matches reference movePosition)
    // ──────────────────────────────────────────────
    const headingRad = MathUtils.degToRad(p.heading);
    const pitchRad = MathUtils.degToRad(p.pitch);

    const moveDistance = p.speed * dt * WORLD_SCALE;

    const dx = moveDistance * Math.sin(headingRad) * Math.cos(pitchRad);
    const dy = moveDistance * Math.sin(pitchRad);
    const dz = moveDistance * Math.cos(headingRad) * Math.cos(pitchRad);

    const pos = position.current;
    const newX = pos.x + dx;
    const newY = Math.max(0.5, pos.y + dy); // Ground clamp
    const newZ = pos.z + dz;

    // Apply to physics body
    bodyApi.position.set(newX, newY, newZ);
    bodyApi.quaternion.set(p.quaternion.x, p.quaternion.y, p.quaternion.z, p.quaternion.w);
    bodyApi.velocity.set(0, 0, 0);
    bodyApi.angularVelocity.set(0, 0, 0);

    // ──────────────────────────────────────────────
    // SIM STORE UPDATE
    // ──────────────────────────────────────────────
    simStore.speed = p.speed;
    simStore.engineState = "on";
    simStore.gear = Math.ceil(p.throttle * 4) || 0;
    simStore.rpm = p.throttle * 8000;
    simStore.altitude = newY;

    // Propeller animation (speed based on throttle)
    if (propRef.current) {
      propRef.current.rotation.z += p.throttle * dt * 25;
    }

    // ──────────────────────────────────────────────
    // RESET (R key)
    // ──────────────────────────────────────────────
    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);

      p.speed = 100;
      p.throttle = 0.5;
      p.isBoosting = false;
      p.boostTimeRemaining = 0;
      p.boostPressed = false;
      p.heading = MathUtils.radToDeg(startRotation[1]);
      p.pitch = 0;
      p.roll = 0;
      p.quaternion.setFromEuler(new Euler(0, startRotation[1], 0, 'YXZ'));

      inp.throttle = 0.5;
      inp.pitch = 0;
      inp.roll = 0;
      inp.yaw = 0;
    }

    // ──────────────────────────────────────────────
    // CAMERA
    // ──────────────────────────────────────────────
    if (cameraView === 0) return;
    simStore.position = [newX, newY, newZ];

    const camOffset = new Vector3(
      -Math.sin(headingRad) * 15,
      5 - pitchRad * 4,
      -Math.cos(headingRad) * 15
    );
    const desiredCam = new Vector3(newX, newY, newZ).add(camOffset);

    cameraPos.current.lerp(desiredCam, Math.min(1, dt * 5));
    cameraTarget.current.lerp(new Vector3(newX, newY, newZ), Math.min(1, dt * 5));
    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={body}>
      {/* ========================================= */}
      {/* UPGRADED VISUAL MODEL */}
      {/* ========================================= */}

      {/* Main Fuselage (Aerodynamic stretched sphere) */}
      <mesh castShadow position={[0, 0, -0.5]} scale={[0.7, 0.8, 3.5]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color="#f0f5fa" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Red Accent Paint/Striping */}
      <mesh castShadow position={[0, 0, -0.5]} scale={[0.72, 0.3, 3.5]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color="#c42b2b" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Engine Cowling (Nose) */}
      <mesh castShadow position={[0, 0, 2.7]} scale={[0.65, 0.7, 0.8]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#f0f5fa" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Cockpit Canopy (Refractive Glass) */}
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

      {/* Main Wings (Elliptical flattened spheres) */}
      <mesh castShadow position={[0, -0.15, 0.5]} scale={[4.8, 0.06, 0.85]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color="#e0e8f0" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Tail - Horizontal Stabilizer */}
      <mesh castShadow position={[0, 0.1, -3.4]} scale={[1.8, 0.04, 0.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#e0e8f0" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Tail - Vertical Stabilizer */}
      <mesh castShadow position={[0, 0.8, -3.5]} scale={[0.05, 0.9, 0.6]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c42b2b" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Propeller System */}
      <group ref={propRef} position={[0, 0, 3.45]}>
        {/* Spinner Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.25, 0.6, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Blades */}
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.8, 0]}>
              <boxGeometry args={[0.12, 1.4, 0.03]} />
              <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Yellow Blade Tips */}
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[0.125, 0.2, 0.035]} />
              <meshStandardMaterial color="#ffd700" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Landing Gear - Tricycle Setup */}
      {/* Main Gear (Rear) */}
      {[-1.2, 1.2].map((x, i) => (
        <group key={i} position={[x, -0.7, 0.5]}>
          {/* Strut */}
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#666" metalness={0.8} />
          </mesh>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.16, 16]} />
            <meshStandardMaterial color="#ccc" metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Front Nose Wheel */}
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

      {/* Dynamic Lighting Highlights */}
      <pointLight position={[-6, 0.5, 0.5]} color="#ff3333" intensity={2} distance={5} />
      <pointLight position={[6, 0.5, 0.5]} color="#33ff33" intensity={2} distance={5} />
      <pointLight position={[0, 2, -3]} color="#ffffff" intensity={5} distance={10} />
    </group>
  );
};

export default Plane;