import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

/**
 * Plane flight physics (fixed forward-direction convention):
 * - W = throttle / accelerate
 * - S = reduce throttle
 * - A = bank left (yaw left)
 * - D = bank right (yaw right)
 * - Space = pitch up (nose up / climb)
 * - Shift = pitch down / dive
 * - R = respawn
 *
 * Physics: realistic lift/drag model with stall below 35 km/h airborne.
 * Forward direction: sin(yaw)/cos(yaw) so yaw=π/2 → faces +X world axis.
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
    const climbInput = !!k.Space;
    const diveInput = !!k.ShiftLeft || !!k.ShiftRight;

    // Throttle
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

    // Yaw from banking
    if (bankLeft) yaw.current += delta * airFactor * 1.2;
    if (bankRight) yaw.current -= delta * airFactor * 1.2;

    // Pitch
    if (climbInput) pitch.current = Math.min(Math.PI / 4, pitch.current + delta * 2.0);
    else if (diveInput) pitch.current = Math.max(-Math.PI / 3, pitch.current - delta * 2.0);
    else pitch.current += (0 - pitch.current) * Math.min(1, delta * 2);

    // Roll for visual effect
    if (bankLeft) roll.current = Math.min(0.8, roll.current + delta * 3);
    else if (bankRight) roll.current = Math.max(-0.8, roll.current - delta * 3);
    else roll.current += (0 - roll.current) * Math.min(1, delta * 4);

    // Forward direction: yaw=π/2 → faces +X
    const forwardDir = new Vector3(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current)
    );

    // Apply thrust — applyForce is integrated by cannon each step, do NOT multiply by delta
    const thrustForce = throttle.current * 12000;
    bodyApi.applyForce(
      [forwardDir.x * thrustForce, forwardDir.y * thrustForce, forwardDir.z * thrustForce],
      [0, 0, 0]
    );

    // ── Aerodynamic Lift / Drag / Stall ──
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

    // Lift (world up)
    if (isAirborne || currentSpeedKmh > STALL_SPEED_KMH) {
      bodyApi.applyForce([0, liftMag * groundEffect, 0], [0, 0, 0]);
    }

    // Drag (opposing velocity direction, scaled by drag magnitude)
    if (currentSpeedMs > 0.5) {
      const dragScale = dragMag / currentSpeedMs;
      bodyApi.applyForce([
        -vx * dragScale * 0.8,
        -vy * dragScale * 0.3,
        -vz * dragScale * 0.8,
      ], [0, 0, 0]);
    }

    // Stall drop — extra gravity when too slow while airborne
    if (currentSpeedKmh < STALL_SPEED_KMH && isAirborne) {
      const stallSeverity = 1 - (currentSpeedKmh / STALL_SPEED_KMH);
      bodyApi.applyForce([0, -9.82 * 800 * stallSeverity, 0], [0, 0, 0]);
    }

    // Ground rolling resistance
    if (!isAirborne) {
      bodyApi.applyForce([-vx * 300, 0, -vz * 300], [0, 0, 0]);
    }

    // Set visual rotation
    const newQuat = new Quaternion();
    newQuat.setFromEuler(new Euler(pitch.current, yaw.current, roll.current, 'YXZ'));
    bodyApi.quaternion.set(newQuat.x, newQuat.y, newQuat.z, newQuat.w);

    // Animate propeller
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

    // Camera — behind the plane
    if (cameraView === 0) return;
    const pos = position.current;
    simStore.position = [pos.x, pos.y, pos.z];
    const camOffset = new Vector3(
      -Math.sin(yaw.current) * 12,
      3 + pitch.current * 3,
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
      {/* ── FUSELAGE ── nose points toward local +Z */}

      {/* Nose cone */}
      <mesh position={[0, 0, 2.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 10]} />
        <meshStandardMaterial color="#e4eef8" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Mid cabin */}
      <mesh position={[0, 0.08, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 3.0, 10]} />
        <meshStandardMaterial color="#e4eef8" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Tail boom */}
      <mesh position={[0, -0.05, -2.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.56, 2.4, 10]} />
        <meshStandardMaterial color="#e4eef8" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* ── WINGS (high-wing, slight dihedral) ── */}
      {/* Left wing */}
      <mesh position={[-3.0, 0.42, 0.2]} rotation={[0, 0, -0.055]} castShadow>
        <boxGeometry args={[5.6, 0.11, 1.5]} />
        <meshStandardMaterial color="#d8e4f0" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Right wing */}
      <mesh position={[3.0, 0.42, 0.2]} rotation={[0, 0, 0.055]} castShadow>
        <boxGeometry args={[5.6, 0.11, 1.5]} />
        <meshStandardMaterial color="#d8e4f0" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* Wing struts */}
      {[-2.2, 2.2].map((x, i) => (
        <mesh key={i} position={[x, -0.18, 0.25]} rotation={[0.05, 0, i === 0 ? 0.32 : -0.32]}>
          <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
          <meshStandardMaterial color="#888" metalness={0.7} />
        </mesh>
      ))}

      {/* ── TAIL SURFACES ── */}
      {/* Horizontal stabilizer */}
      <mesh position={[0, 0.1, -3.5]} castShadow>
        <boxGeometry args={[3.6, 0.09, 0.75]} />
        <meshStandardMaterial color="#d0dce8" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Vertical fin */}
      <mesh position={[0, 0.82, -3.4]} castShadow>
        <boxGeometry args={[0.09, 1.3, 0.85]} />
        <meshStandardMaterial color="#d0dce8" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── ENGINE COWLING ── */}
      <mesh position={[0, 0, 2.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.72, 10]} />
        <meshStandardMaterial color="#c0ccd8" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Radial engine cylinder stubs */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 0.44, Math.cos(angle) * 0.44, 2.62]}
            rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.25, 6]} />
            <meshStandardMaterial color="#999" metalness={0.8} />
          </mesh>
        );
      })}

      {/* ── PROPELLER (animated) ── */}
      <group ref={propRef} position={[0, 0, 3.05]}>
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <mesh key={i} rotation={[angle, 0, 0]}>
            <boxGeometry args={[0.1, 1.8, 0.07]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} />
          </mesh>
        ))}
        {/* Spinner cone */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.3, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      </group>

      {/* ── COCKPIT WINDOWS ── */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.59, 0.35, 1.0]}>
          <boxGeometry args={[0.04, 0.42, 0.72]} />
          <meshStandardMaterial color="#88aadd" metalness={0.1} roughness={0} transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Top windshield */}
      <mesh position={[0, 0.63, 1.32]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[1.05, 0.08, 0.52]} />
        <meshStandardMaterial color="#99bbee" transparent opacity={0.5} />
      </mesh>

      {/* ── LANDING GEAR ── */}
      {[-1.1, 1.1].map((x, i) => (
        <group key={i}>
          {/* Leg */}
          <mesh position={[x, -0.7, 0.5]}>
            <cylinderGeometry args={[0.055, 0.055, 0.7, 6]} />
            <meshStandardMaterial color="#333" metalness={0.7} />
          </mesh>
          {/* Wheel */}
          <mesh position={[x, -1.06, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.14, 10]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Tail wheel */}
      <mesh position={[0, -0.65, -0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.48, 6]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.9, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 8]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>

      {/* ── NAV LIGHTS ── */}
      <pointLight position={[-5.8, 0.42, 0.2]} color="#ff3333" intensity={3} distance={8} />
      <pointLight position={[5.8, 0.42, 0.2]} color="#33ff33" intensity={3} distance={8} />
      {/* Landing / taxi light from nose */}
      <pointLight position={[0, 0, 3.1]} color="#ffffff" intensity={18} distance={50} />
    </group>
  );
};

export default Plane;
