import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

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
      linearDamping: 0.15,
      angularDamping: 0.95,
      allowSleep: false,
    }),
    useRef(null)
  );

  const propRef = useRef();
  const keys = useControls({});
  const velocity = useRef([0, 0, 0]);
  const position = useRef(new Vector3(...startPosition));
  const throttle = useRef(0);
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
    return unsubPos;
  }, [bodyApi]);

  const MAX_THROTTLE = 1;
  const STALL_SPEED_KMH = 35;

  useFrame((state, delta) => {
    const k = keys.current;
    const thrInput = !!k.KeyW;
    const brakeInput = !!k.KeyS;
    const bankLeft = !!k.KeyA;
    const bankRight = !!k.KeyD;
    const climbInput = !!k.Space || !!k.ArrowUp;
    const diveInput = !!k.ShiftLeft || !!k.ShiftRight || !!k.ArrowDown;

    if (thrInput) throttle.current = Math.min(MAX_THROTTLE, throttle.current + delta * 0.5);
    else if (brakeInput) throttle.current = Math.max(0, throttle.current - delta * 0.8);
    else throttle.current = Math.max(0, throttle.current - delta * 0.1);

    const [vx, vy, vz] = velocity.current;
    const currentSpeedMs = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const currentSpeedKmh = currentSpeedMs * 3.6;

    simStore.speed = currentSpeedKmh;
    simStore.engineState = "on";
    simStore.gear = Math.ceil(throttle.current * 4) || 0;
    simStore.rpm = throttle.current * 8000;
    simStore.altitude = position.current.y;

    const isAirborne = position.current.y > 1.5;
    const airFactor = Math.min(1, currentSpeedKmh / STALL_SPEED_KMH);

    if (bankLeft) yaw.current += delta * airFactor * 1.2;
    if (bankRight) yaw.current -= delta * airFactor * 1.2;

    if (climbInput) pitch.current = Math.min(Math.PI / 4, pitch.current + delta * 2.0);
    else if (diveInput) pitch.current = Math.max(-Math.PI / 3, pitch.current - delta * 2.0);
    else pitch.current += (0 - pitch.current) * Math.min(1, delta * 2);

    if (bankLeft) roll.current = Math.min(0.8, roll.current + delta * 3);
    else if (bankRight) roll.current = Math.max(-0.8, roll.current - delta * 3);
    else roll.current += (0 - roll.current) * Math.min(1, delta * 4);

    const forwardDir = new Vector3(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current)
    );

    const thrustForce = throttle.current * 12000;
    bodyApi.applyForce(
      [forwardDir.x * thrustForce, forwardDir.y * thrustForce, forwardDir.z * thrustForce],
      [0, 0, 0]
    );

    const rho = 1.225;
    const wingArea = 12;
    const Cl = 0.9;
    const Cd0 = 0.04;
    const kDrag = 0.05;

    const dynamicPressure = 0.5 * rho * currentSpeedMs * currentSpeedMs;
    const liftMag = dynamicPressure * wingArea * Cl * airFactor * airFactor;
    const dragCoeff = Cd0 + kDrag * Cl * Cl;
    const dragMag = dynamicPressure * wingArea * dragCoeff;
    const groundEffect = position.current.y < 3 ? 1.3 : 1.0;

    if (isAirborne || currentSpeedKmh > STALL_SPEED_KMH) {
      bodyApi.applyForce([0, liftMag * groundEffect, 0], [0, 0, 0]);
    }

    if (currentSpeedMs > 0.5) {
      const dragScale = dragMag / currentSpeedMs;
      bodyApi.applyForce([
        -vx * dragScale * 0.8,
        -vy * dragScale * 0.3,
        -vz * dragScale * 0.8,
      ], [0, 0, 0]);
    }

    if (currentSpeedKmh < STALL_SPEED_KMH && isAirborne) {
      const stallSeverity = 1 - (currentSpeedKmh / STALL_SPEED_KMH);
      bodyApi.applyForce([0, -9.82 * 800 * stallSeverity, 0], [0, 0, 0]);
    }

    if (!isAirborne) {
      bodyApi.applyForce([-vx * 300, 0, -vz * 300], [0, 0, 0]);
    }

    const newQuat = new Quaternion();
    newQuat.setFromEuler(new Euler(-pitch.current, yaw.current, roll.current, 'YXZ'));
    bodyApi.quaternion.set(newQuat.x, newQuat.y, newQuat.z, newQuat.w);

    if (propRef.current) propRef.current.rotation.z += throttle.current * delta * 25;

    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);
      throttle.current = 0;
      pitch.current = 0;
      roll.current = 0;
      yaw.current = startRotation[1];
    }

    if (cameraView === 0) return;
    const pos = position.current;
    simStore.position = [pos.x, pos.y, pos.z];
    const camOffset = new Vector3(
      -Math.sin(yaw.current) * 12,
      3 - pitch.current * 4,
      -Math.cos(yaw.current) * 12
    );
    const desiredCam = pos.clone().add(camOffset);
    cameraPos.current.lerp(desiredCam, Math.min(1, delta * 5));
    cameraTarget.current.lerp(pos, Math.min(1, delta * 5));
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