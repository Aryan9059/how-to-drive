import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

/**
 * Plane flight physics:
 * - W = throttle / accelerate
 * - S = pitch down (nose down) when airborne
 * - A = roll left / bank left (yaw left at speed)
 * - D = roll right / bank right (yaw right at speed)
 * - Space = pitch up (nose up / climb)
 * - Shift = pitch down hard / dive
 * - R = respawn
 */

const Plane = ({
  cameraView,
  startPosition = [0, 5, 0],
  startRotation = [0, Math.PI / 2, 0],
}) => {
  const [body, bodyApi] = useSphere(
    () => ({
      mass: 800,
      args: [1],
      position: startPosition,
      rotation: startRotation,
      linearDamping: 0.05,
      angularDamping: 0.95,
      allowSleep: false,
    }),
    useRef(null)
  );

  const keys = useControls({});
  const velocity = useRef([0, 0, 0]);
  const position = useRef(new Vector3(...startPosition));
  const quaternion = useRef(new Quaternion());
  const eulerAngles = useRef(new Euler(0, startRotation[1], 0));
  const speed = useRef(0);
  const throttle = useRef(0);
  const lift = useRef(0);
  const pitch = useRef(0);
  const roll = useRef(0);
  const yaw = useRef(startRotation[1]);
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  useEffect(() => {
    const unsub = bodyApi.velocity.subscribe((v) => { velocity.current = v; });
    return unsub;
  }, [bodyApi]);

  useEffect(() => {
    const unsubPos = bodyApi.position.subscribe((p) => {
      position.current.set(p[0], p[1], p[2]);
    });
    const unsubQuat = bodyApi.quaternion.subscribe((q) => {
      quaternion.current.set(q[0], q[1], q[2], q[3]);
    });
    return () => { unsubPos(); unsubQuat(); };
  }, [bodyApi]);

  const MAX_THROTTLE = 1;
  const MAX_SPEED = 120; // km/h before conversion
  const LIFT_SPEED = 40; // km/h to start generating lift
  const GRAVITY_COMP = 9.82;

  useFrame((state, delta) => {
    const k = keys.current;
    const thrInput = !!k.KeyW;
    const brakeInput = !!k.KeyS;
    const bankLeft = !!k.KeyA;
    const bankRight = !!k.KeyD;
    const climbInput = !!k.Space;
    const diveInput = !!k.ShiftLeft || !!k.ShiftRight;

    // Throttle control (W increases, S decreases)
    if (thrInput) throttle.current = Math.min(MAX_THROTTLE, throttle.current + delta * 0.5);
    else if (brakeInput) throttle.current = Math.max(0, throttle.current - delta * 0.8);
    else throttle.current = Math.max(0, throttle.current - delta * 0.1);

    const [vx, vy, vz] = velocity.current;
    const currentSpeedMs = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const currentSpeedKmh = currentSpeedMs * 3.6;
    speed.current = currentSpeedKmh;

    simStore.speed = currentSpeedKmh;
    simStore.engineState = "on";
    simStore.gear = Math.ceil(throttle.current * 4) || 0;
    simStore.rpm = throttle.current * 8000;
    simStore.altitude = position.current.y;

    const isAirborne = position.current.y > 1.5;
    const airFactor = Math.min(1, currentSpeedKmh / LIFT_SPEED);

    // Yaw from banking (realistic: bank produces yaw when flying)
    if (bankLeft) yaw.current += delta * airFactor * 1.2;
    if (bankRight) yaw.current -= delta * airFactor * 1.2;

    // Pitch
    if (climbInput) pitch.current = Math.min(Math.PI / 4, pitch.current + delta * 1.5);
    else if (diveInput) pitch.current = Math.max(-Math.PI / 3, pitch.current - delta * 1.5);
    else pitch.current += (0 - pitch.current) * Math.min(1, delta * 2);

    // Roll for visual effect
    if (bankLeft) roll.current = Math.min(0.8, roll.current + delta * 3);
    else if (bankRight) roll.current = Math.max(-0.8, roll.current - delta * 3);
    else roll.current += (0 - roll.current) * Math.min(1, delta * 4);

    // Compute forward direction based on yaw+pitch
    const forwardDir = new Vector3(
      -Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      -Math.cos(yaw.current) * Math.cos(pitch.current)
    );

    // Apply thrust
    const thrustForce = throttle.current * 3500 * delta;
    bodyApi.applyForce(
      [forwardDir.x * thrustForce, forwardDir.y * thrustForce, forwardDir.z * thrustForce],
      [0, 0, 0]
    );

    // Apply lift when airborne and moving
    const liftForce = isAirborne || currentSpeedKmh > LIFT_SPEED
      ? airFactor * GRAVITY_COMP * 800 * delta
      : 0;
    bodyApi.applyForce([0, liftForce, 0], [0, 0, 0]);

    // Ground friction / rolling resistance
    if (!isAirborne) {
      bodyApi.applyForce([
        -vx * 200 * delta,
        0,
        -vz * 200 * delta,
      ], [0, 0, 0]);
    }

    // Set rotation visually to match yaw/pitch/roll
    const newQuat = new Quaternion();
    newQuat.setFromEuler(new Euler(pitch.current, yaw.current, roll.current, 'YXZ'));
    bodyApi.quaternion.set(newQuat.x, newQuat.y, newQuat.z, newQuat.w);

    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);
      throttle.current = 0;
      pitch.current = 0;
      roll.current = 0;
      yaw.current = startRotation[1];
    }

    // Camera
    if (cameraView === 0) return;
    const pos = position.current;
    simStore.position = [pos.x, pos.y, pos.z];
    const camOffset = new Vector3(
      Math.sin(yaw.current) * 10,
      3 + pitch.current * 3,
      Math.cos(yaw.current) * 10
    );
    const desiredCam = pos.clone().add(camOffset);
    cameraPos.current.lerp(desiredCam, Math.min(1, delta * 5));
    cameraTarget.current.lerp(pos, Math.min(1, delta * 5));
    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={body}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.35, 5, 12]} />
        <meshStandardMaterial color="#e8e8f0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[12, 0.15, 1.8]} />
        <meshStandardMaterial color="#d0d0e8" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Tail horizontal */}
      <mesh position={[0, 0.2, -2.2]} castShadow>
        <boxGeometry args={[4.5, 0.12, 0.9]} />
        <meshStandardMaterial color="#ccd" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Tail vertical */}
      <mesh position={[0, 0.9, -2.1]} castShadow>
        <boxGeometry args={[0.12, 1.6, 0.9]} />
        <meshStandardMaterial color="#ccd" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.5, 1.5]}>
        <sphereGeometry args={[0.45, 10, 6]} />
        <meshStandardMaterial color="#88aaff" metalness={0.1} roughness={0} transparent opacity={0.5} />
      </mesh>
      {/* Engine/propeller hub */}
      <mesh position={[0, 0, 2.7]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#444" metalness={0.9} />
      </mesh>
      {/* Propeller */}
      <mesh position={[0, 0, 2.95]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Landing gear */}
      <mesh position={[0, -0.9, 0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, -1.25, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
        <meshStandardMaterial color="#111" roughness={1} />
      </mesh>
      {/* Nav lights */}
      <pointLight position={[6, 0, 0]} color="#ff4444" intensity={2} distance={5} />
      <pointLight position={[-6, 0, 0]} color="#44ff44" intensity={2} distance={5} />
      <pointLight position={[0, 0, 2.8]} color="#ffffff" intensity={15} distance={40} />
    </group>
  );
};

export default Plane;
