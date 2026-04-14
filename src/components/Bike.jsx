import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import useControls from "../hooks/useControls";
import { Quaternion, Vector3 } from "three";
import simStore from "../simStore";

const Bike = ({
  cameraView,
  startPosition = [0, 2, 0],
  startRotation = [0, Math.PI / 2, 0],
}) => {
  const wheelRadius = 0.3;
  const width = 0.5;
  const height = 0.6;
  const length = 1.8;

  const chassisRef = useRef(null);
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: [width, height, length],
      mass: 180,
      rotation: startRotation,
      position: startPosition,
      linearDamping: 0.3,
      angularDamping: 0.92,
    }),
    chassisRef
  );

  const wheel0 = useRef(null);
  const wheel1 = useRef(null);

  const wheelInfos = [
    {
      radius: wheelRadius,
      directionLocal: [0, -1, 0],
      suspensionStiffness: 45,
      suspensionRestLength: 0.3,
      maxSuspensionForce: 1e5,
      maxSuspensionTravel: 0.2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      frictionSlip: 5,
      rollInfluence: 0.05,
      axleLocal: [-1, 0, 0],
      chassisConnectionPointLocal: [0, -0.2, 0.7],
      isFrontWheel: true,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    },
    {
      radius: wheelRadius,
      directionLocal: [0, -1, 0],
      suspensionStiffness: 45,
      suspensionRestLength: 0.3,
      maxSuspensionForce: 1e5,
      maxSuspensionTravel: 0.2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      frictionSlip: 5,
      rollInfluence: 0.05,
      axleLocal: [-1, 0, 0],
      chassisConnectionPointLocal: [0, -0.2, -0.7],
      isFrontWheel: false,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    },
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({ chassisBody, wheelInfos, wheels: [wheel0, wheel1] }),
    useRef(null)
  );

  const keys = useControls({});

  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    const unsub = chassisApi.velocity.subscribe((v) => { velocity.current = v; });
    return unsub;
  }, [chassisApi]);

  const leanAngle = useRef(0);
  const currentSteer = useRef(0);
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  const MAX_SPEED_KMH = 180;
  const MAX_ENGINE_FORCE = 250;
  const MAX_BRAKE = 60;

  useFrame((state, delta) => {
    const k = keys.current;
    const throttle = !!k.KeyW;
    const brake = !!k.KeyS;
    const steerLeft = !!k.KeyA;
    const steerRight = !!k.KeyD;
    const handbrake = !!k.Space;

    simStore.bikeState = simStore.bikeState || "running";

    const [vx, vy, vz] = velocity.current;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3.6;
    simStore.speed = speed;
    simStore.gear = speed > 100 ? 5 : speed > 70 ? 4 : speed > 40 ? 3 : speed > 20 ? 2 : 1;
    simStore.rpm = Math.min(8000, 800 + (speed / MAX_SPEED_KMH) * 7200);
    simStore.engineState = "on";

    // Throttle
    const force = throttle ? MAX_ENGINE_FORCE : 0;
    vehicleApi.applyEngineForce(-force, 1);

    // Braking
    const brakeAmt = brake ? MAX_BRAKE : handbrake ? MAX_BRAKE * 0.8 : 0;
    vehicleApi.setBrake(brakeAmt * 0.4, 0);
    vehicleApi.setBrake(brakeAmt, 1);

    // Speed-sensitive steering
    const maxSteer = Math.max(0.15, 0.6 - speed * 0.005);
    const targetSteer = steerLeft ? maxSteer : steerRight ? -maxSteer : 0;
    currentSteer.current += (targetSteer - currentSteer.current) * Math.min(1, delta * 6);
    vehicleApi.setSteeringValue(currentSteer.current, 0);

    // Apply lean torque for realism
    const targetLean = -currentSteer.current * (speed / 40) * 0.5;
    leanAngle.current += (targetLean - leanAngle.current) * Math.min(1, delta * 4);
    chassisApi.applyTorque([0, 0, leanAngle.current * 20]);

    // Reset
    if (k.KeyR) {
      chassisApi.position.set(...startPosition);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(...startRotation);
      currentSteer.current = 0;
      leanAngle.current = 0;
    }

    // Camera
    if (cameraView === 0) return;
    const worldPos = new Vector3();
    worldPos.setFromMatrixPosition(chassisRef.current.matrixWorld);
    simStore.position = [worldPos.x, worldPos.y, worldPos.z];

    const quaternion = new Quaternion();
    quaternion.setFromRotationMatrix(chassisRef.current.matrixWorld);
    const cameraDelta = new Vector3(0, 1.5, -4).applyQuaternion(quaternion);
    const desiredCamPos = worldPos.clone().add(cameraDelta);
    cameraPos.current.lerp(desiredCamPos, Math.min(1, delta * 8));
    cameraTarget.current.lerp(worldPos, Math.min(1, delta * 8));
    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={vehicle}>
      <group ref={chassisRef}>
        {/* Bike body */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.45, 0.5, 1.6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Fuel tank */}
        <mesh position={[0, 0.4, 0.2]} castShadow>
          <boxGeometry args={[0.38, 0.25, 0.6]} />
          <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Handlebars */}
        <mesh position={[0, 0.6, 0.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} />
        </mesh>
        {/* Seat */}
        <mesh position={[0, 0.45, -0.3]} castShadow>
          <boxGeometry args={[0.35, 0.1, 0.7]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Exhaust */}
        <mesh position={[0.22, -0.1, -0.6]} rotation={[0, 0, Math.PI / 12]}>
          <cylinderGeometry args={[0.04, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#888" metalness={1} roughness={0.3} />
        </mesh>
        {/* Headlight */}
        <mesh position={[0, 0.3, 0.85]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffff88" emissiveIntensity={3} />
        </mesh>
        <pointLight position={[0, 0.3, 1.2]} intensity={8} distance={20} color="#fff8cc" />
      </group>

      {/* Front wheel */}
      <group ref={wheel0}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[wheelRadius, 0.1, 8, 16]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[wheelRadius * 0.6, wheelRadius * 0.6, 0.05, 16]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      </group>

      {/* Rear wheel */}
      <group ref={wheel1}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[wheelRadius, 0.12, 8, 16]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[wheelRadius * 0.6, wheelRadius * 0.6, 0.05, 16]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

export default Bike;
