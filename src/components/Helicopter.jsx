import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useControls from "../hooks/useControls";
import { Vector3, Quaternion, Euler } from "three";
import simStore from "../simStore";

/**
 * Helicopter flight physics:
 * - W = throttle up / collective pitch (go up)
 * - S = throttle down / collective down (descend)
 * - A = yaw left (rotate left)
 * - D = yaw right (rotate right)
 * - Arrow Up / I = pitch forward (tilt nose down = fly forward)
 * - Arrow Down / K = pitch backward (tilt nose up = fly backward)
 * - Arrow Left / J = roll left (strafe left)
 * - Arrow Right / L = roll right (strafe right)
 * - R = respawn
 */

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
      linearDamping: 0.7,
      angularDamping: 0.99,
      allowSleep: false,
    }),
    useRef(null)
  );

  const keys = useControls({});
  const velocity = useRef([0, 0, 0]);
  const position = useRef(new Vector3(...startPosition));
  const yaw = useRef(startRotation[1]);
  const pitch = useRef(0); // nose forward/back tilt
  const roll = useRef(0);  // side tilt
  const collective = useRef(0); // vertical thrust 0-1
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());
  const rotorAngle = useRef(0);
  const rotorRef = useRef();

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

    // Collective (vertical thrust)
    if (k.KeyW) collective.current = Math.min(1, collective.current + delta * 1.2);
    else if (k.KeyS) collective.current = Math.max(0, collective.current - delta * 0.8);
    else collective.current += (0.5 - collective.current) * Math.min(1, delta * 0.5); // Hover tendency

    // Yaw (tail rotor)
    if (k.KeyA) yaw.current += delta * 1.8;
    if (k.KeyD) yaw.current -= delta * 1.8;

    // Cyclic pitch (forward/back tilt) → forward flight
    const targetPitch = k.ArrowUp || k.KeyI ? -0.35
      : k.ArrowDown || k.KeyK ? 0.2
      : 0;
    pitch.current += (targetPitch - pitch.current) * Math.min(1, delta * 5);

    // Cyclic roll (left/right tilt) → lateral flight
    const targetRoll = k.ArrowLeft || k.KeyJ ? 0.3
      : k.ArrowRight || k.KeyL ? -0.3
      : 0;
    roll.current += (targetRoll - roll.current) * Math.min(1, delta * 5);

    // Self-leveling when no input
    if (!k.ArrowUp && !k.ArrowDown && !k.KeyI && !k.KeyK) {
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

    // Gravity compensation + vertical thrust
    const WEIGHT = 1200 * 9.82;
    const liftForce = collective.current * WEIGHT * 2.2;
    bodyApi.applyForce([0, liftForce - WEIGHT, 0], [0, 0, 0]);

    // Horizontal thrust from cyclic (tilt = thrust direction)
    const fwdX = -Math.sin(yaw.current);
    const fwdZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);

    const horizontalForce = 2800 * collective.current;
    bodyApi.applyForce([
      (fwdX * pitch.current + rightX * -roll.current) * horizontalForce,
      0,
      (fwdZ * pitch.current + rightZ * -roll.current) * horizontalForce,
    ], [0, 0, 0]);

    // Apply visual rotation
    const visQuat = new Quaternion();
    visQuat.setFromEuler(new Euler(pitch.current * 0.5, yaw.current, roll.current * 0.5, 'YXZ'));
    bodyApi.quaternion.set(visQuat.x, visQuat.y, visQuat.z, visQuat.w);

    // Spin rotor mesh
    rotorAngle.current += delta * (collective.current > 0.05 ? 25 : 5);
    if (rotorRef.current) rotorRef.current.rotation.y = rotorAngle.current;

    if (k.KeyR) {
      bodyApi.position.set(...startPosition);
      bodyApi.velocity.set(0, 0, 0);
      bodyApi.angularVelocity.set(0, 0, 0);
      collective.current = 0;
      pitch.current = 0;
      roll.current = 0;
      yaw.current = startRotation[1];
    }

    // Camera
    if (cameraView === 0) return;
    const pos = position.current;
    simStore.position = [pos.x, pos.y, pos.z];
    const camOffset = new Vector3(
      Math.sin(yaw.current) * 12,
      5,
      Math.cos(yaw.current) * 12
    );
    const desiredCam = pos.clone().add(camOffset);
    cameraPos.current.lerp(desiredCam, Math.min(1, delta * 4));
    cameraTarget.current.lerp(pos, Math.min(1, delta * 4));
    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={body}>
      {/* Main fuselage */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.1, 3.5]} />
        <meshStandardMaterial color="#2d6a2d" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Cockpit glass */}
      <mesh position={[0, 0.2, 1.4]}>
        <sphereGeometry args={[0.85, 10, 8]} />
        <meshStandardMaterial color="#88ccff" metalness={0} roughness={0} transparent opacity={0.4} />
      </mesh>
      {/* Tail boom */}
      <mesh position={[0, 0.1, -2.8]} rotation={[0.05, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.08, 4, 8]} />
        <meshStandardMaterial color="#1e5c1e" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 0.55, -4.7]} castShadow>
        <boxGeometry args={[0.08, 1.2, 0.8]} />
        <meshStandardMaterial color="#1e5c1e" />
      </mesh>
      {/* Tail rotor */}
      <group position={[0.3, 0.6, -4.6]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[1.5, 0.06, 0.2]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      </group>

      {/* Main rotor mast */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>

      {/* Spinning rotor group */}
      <group ref={rotorRef} position={[0, 1.2, 0]}>
        {/* 4 rotor blades */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (Math.PI / 2) * i, 0]} castShadow>
            <boxGeometry args={[6.5, 0.08, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Landing skids */}
      {[-0.7, 0.7].map((x) => (
        <group key={x} position={[x, -0.7, 0]}>
          <mesh rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 3.5, 8]} />
            <meshStandardMaterial color="#222" metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.15, 1.4]} rotation={[0, 0, Math.PI / 12]}>
            <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, -0.15, -1.4]} rotation={[0, 0, -Math.PI / 12]}>
            <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      ))}

      {/* Searchlight - downward beam */}
      <pointLight
        position={[0, -0.8, 1]}
        intensity={60}
        color="#fff8e0"
        distance={50}
      />
    </group>
  );
};

export default Helicopter;
