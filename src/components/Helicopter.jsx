import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

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
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  const rotorAngle = useRef(0);
  const rotorRef = useRef();
  const tailRotorRef = useRef(); // Added reference for spinning tail rotor

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

    // Throttle/Collective
    if (k.KeyW) collective.current = Math.min(1, collective.current + delta * 1.2);
    else if (k.KeyS) collective.current = Math.max(0, collective.current - delta * 0.8);
    else collective.current += (0.5 - collective.current) * Math.min(1, delta * 0.5);

    // Yaw (Tail Rotor Control)
    if (k.KeyA) yaw.current += delta * 1.8;
    if (k.KeyD) yaw.current -= delta * 1.8;

    // Pitch (Forward/Back)
    const targetPitch = k.ArrowUp || k.KeyI || k.ShiftLeft || k.ShiftRight ? -0.5 : k.ArrowDown || k.KeyK || k.Space ? 0.35 : 0;
    pitch.current += (targetPitch - pitch.current) * Math.min(1, delta * 5);

    // --- BUG FIX: Inverted Roll ---
    // Swapped the input values: Left is now -0.45, Right is now 0.45
    const targetRoll = k.ArrowLeft || k.KeyJ ? -0.45 : k.ArrowRight || k.KeyL ? 0.45 : 0;
    roll.current += (targetRoll - roll.current) * Math.min(1, delta * 5);

    if (!k.ArrowUp && !k.ArrowDown && !k.KeyI && !k.KeyK && !k.ShiftLeft && !k.ShiftRight && !k.Space) {
      pitch.current *= 0.97;
    }
    if (!k.ArrowLeft && !k.ArrowRight && !k.KeyJ && !k.KeyL) {
      roll.current *= 0.97;
    }

    const [vx, vy, vz] = velocity.current;
    const currentSpeedKmh = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3.6;

    simStore.speed = currentSpeedKmh;
    simStore.engineState = "on";
    simStore.gear = collective.current > 0.1 ? 1 : 0;
    simStore.rpm = collective.current * 8000;
    simStore.altitude = position.current.y;

    // Lift Force
    const WEIGHT = 1200 * 9.82;
    const liftForce = collective.current * WEIGHT * 2.2;
    bodyApi.applyForce([0, liftForce - WEIGHT, 0], [0, 0, 0]);

    // Calculate Directional Vectors
    const fwdX = -Math.sin(yaw.current);
    const fwdZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);

    // --- BUG FIX: Physics Force Application ---
    // Changed '- roll.current' to '+ roll.current' to align with the new input signs
    const horizontalForce = 8000 * Math.max(0.3, collective.current);
    bodyApi.applyForce([
      (fwdX * pitch.current + rightX * roll.current) * horizontalForce,
      0,
      (fwdZ * pitch.current + rightZ * roll.current) * horizontalForce,
    ], [0, 0, 0]);

    // Visual Rotation (Keeps the negative multiplier to ensure it leans into the turn visually)
    const visQuat = new Quaternion();
    visQuat.setFromEuler(new Euler(-pitch.current * 0.5, yaw.current, -roll.current * 0.5, 'YXZ'));
    bodyApi.quaternion.set(visQuat.x, visQuat.y, visQuat.z, visQuat.w);

    // Rotor Animations
    rotorAngle.current += delta * (collective.current > 0.05 ? 25 : 5);
    if (rotorRef.current) rotorRef.current.rotation.y = rotorAngle.current;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x = rotorAngle.current * 4;

    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);
      collective.current = 0;
      pitch.current = 0;
      roll.current = 0;
      yaw.current = startRotation[1];
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

      {/* Main Cabin (Aerodynamic stretched sphere) */}
      <mesh castShadow position={[0, 0, 0]} scale={[1.1, 1.3, 2.2]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color="#223344" metalness={0.6} roughness={0.4} />
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

      {/* Tail Boom */}
      <mesh position={[0, 0.3, -2.8]} rotation={[0.03, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.1, 3.8, 16]} />
        <meshStandardMaterial color="#1a2533" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Tail Fin (Vertical Stabilizer) */}
      <mesh position={[0, 0.7, -4.5]} scale={[0.08, 1.2, 0.7]} rotation={[-0.15, 0, 0]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#223344" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Tail Wing (Horizontal Stabilizer) */}
      <mesh position={[0, 0.4, -4.2]} scale={[1.2, 0.04, 0.3]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#1a2533" metalness={0.5} roughness={0.4} />
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