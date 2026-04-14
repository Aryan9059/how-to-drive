import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
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
      mass: 220,
      rotation: startRotation,
      position: startPosition,
      linearDamping: 0.2,
      angularDamping: 0.8,
    }),
    chassisRef
  );

  const wheel0 = useRef(null);
  const wheel1 = useRef(null);

  const wheelInfos = [
    {
      radius: wheelRadius,
      directionLocal: [0, -1, 0],
      suspensionStiffness: 55,
      suspensionRestLength: 0.3,
      maxSuspensionForce: 1e5,
      maxSuspensionTravel: 0.2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      frictionSlip: 10,
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
      suspensionStiffness: 55,
      suspensionRestLength: 0.3,
      maxSuspensionForce: 1e5,
      maxSuspensionTravel: 0.2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      frictionSlip: 10,
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
  const MAX_ENGINE_FORCE = 800;
  const MAX_BRAKE = 80;

  useFrame((state, delta) => {
    const k = keys.current;
    const throttle = !!k.KeyW;
    const brake = !!k.KeyS;
    const steerLeft = !!k.KeyA;
    const steerRight = !!k.KeyD;
    const handbrake = !!k.Space;

    simStore.bikeState = simStore.bikeState || "running";

    const [vx, vy, vz] = velocity.current;
    const speedKmh = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3.6;
    simStore.speed = speedKmh;
    simStore.gear = speedKmh > 100 ? 5 : speedKmh > 70 ? 4 : speedKmh > 40 ? 3 : speedKmh > 20 ? 2 : 1;
    simStore.rpm = Math.min(8000, 800 + (speedKmh / MAX_SPEED_KMH) * 7200);
    simStore.engineState = "on";

    // Throttle
    const force = throttle ? MAX_ENGINE_FORCE : 0;
    vehicleApi.applyEngineForce(-force, 1);

    // Braking — front dominant (realistic)
    const brakeAmt = brake ? MAX_BRAKE : 0;
    vehicleApi.setBrake(brakeAmt * 0.7, 0); // front
    vehicleApi.setBrake(brakeAmt * 0.3, 1); // rear
    if (handbrake) vehicleApi.setBrake(MAX_BRAKE, 1); // rear lock

    // Speed-sensitive steering
    const maxSteer = Math.max(0.15, 0.6 - speedKmh * 0.005);
    const targetSteer = steerLeft ? maxSteer : steerRight ? -maxSteer : 0;
    currentSteer.current += (targetSteer - currentSteer.current) * Math.min(1, delta * 6);
    vehicleApi.setSteeringValue(currentSteer.current, 0);

    // Speed-proportional lean with gyroscopic self-balance
    const targetLean = -currentSteer.current * Math.min(1, speedKmh / 40) * 1.1;
    leanAngle.current += (targetLean - leanAngle.current) * Math.min(1, delta * 3);

    // Strong anti-tip: read actual chassis roll from the world matrix and actively correct it
    if (chassisRef.current) {
      const quat = new Quaternion();
      quat.setFromRotationMatrix(chassisRef.current.matrixWorld);
      // Extract the local X-axis (right) from quaternion to detect roll tilt
      const right = new Vector3(1, 0, 0).applyQuaternion(quat);
      const rollTilt = Math.asin(Math.max(-1, Math.min(1, right.y))); // how much the right vector points up/down
      const correctionTorque = -rollTilt * 600; // strong restoring torque
      chassisApi.applyTorque([0, 0, correctionTorque]);
    }

    // Yaw lean visual torque
    const gyro = Math.min(1, speedKmh / 20);
    chassisApi.applyTorque([0, 0, leanAngle.current * 50 * gyro]);

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

  const Spoke = ({ angle }) => (
    <mesh rotation={[angle, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.01, 0.01, wheelRadius * 1.75, 5]} />
      <meshStandardMaterial color="#888" metalness={0.85} />
    </mesh>
  );

  return (
    <group ref={vehicle}>
      <group ref={chassisRef}>
        {/* ── FRAME SPINE ── */}
        <mesh position={[0, 0.15, 0]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 1.4]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* ── ENGINE BLOCK ── */}
        <mesh position={[0, -0.08, 0.05]} castShadow>
          <boxGeometry args={[0.36, 0.38, 0.52]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Cylinder head stubs */}
        <mesh position={[0, 0.11, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.1, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.11, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.1, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>

        {/* ── FUEL TANK ── */}
        <mesh position={[0, 0.35, 0.12]} castShadow>
          <boxGeometry args={[0.33, 0.2, 0.52]} />
          <meshStandardMaterial color="#cc1a1a" metalness={0.55} roughness={0.2} />
        </mesh>

        {/* ── SEAT ── */}
        <mesh position={[0, 0.42, -0.22]} castShadow>
          <boxGeometry args={[0.28, 0.08, 0.55]} />
          <meshStandardMaterial color="#111" roughness={0.95} />
        </mesh>

        {/* ── REAR TAIL UNIT ── */}
        <mesh position={[0, 0.32, -0.65]} castShadow>
          <boxGeometry args={[0.26, 0.14, 0.32]} />
          <meshStandardMaterial color="#cc1a1a" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Brake light strip */}
        <mesh position={[0, 0.27, -0.83]}>
          <boxGeometry args={[0.2, 0.05, 0.03]} />
          <meshStandardMaterial color="#ff1100" emissive="#ff0000" emissiveIntensity={3} />
        </mesh>

        {/* ── FRONT FAIRING ── */}
        <mesh position={[0, 0.28, 0.76]} castShadow>
          <boxGeometry args={[0.36, 0.28, 0.22]} />
          <meshStandardMaterial color="#cc1a1a" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Headlight */}
        <mesh position={[0, 0.26, 0.88]}>
          <boxGeometry args={[0.22, 0.12, 0.03]} />
          <meshStandardMaterial color="#ffffee" emissive="#ffffcc" emissiveIntensity={5} />
        </mesh>
        <pointLight position={[0, 0.26, 1.1]} intensity={12} distance={30} color="#fff5cc" />

        {/* ── INSTRUMENT CLUSTER ── */}
        <mesh position={[0, 0.54, 0.65]}>
          <boxGeometry args={[0.16, 0.09, 0.07]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
        </mesh>

        {/* ── HANDLEBARS ── */}
        <mesh position={[0, 0.58, 0.66]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
        {[-0.27, 0.27].map((x, i) => (
          <mesh key={i} position={[x, 0.58, 0.66]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.1, 8]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
        ))}

        {/* ── FRONT FORKS ── */}
        {[-0.09, 0.09].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0.6]} rotation={[-0.18, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.7, 8]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}

        {/* ── SWINGARM ── */}
        <mesh position={[0, -0.2, -0.3]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.55]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* ── EXHAUST ── */}
        <mesh position={[0.2, -0.18, 0.0]} rotation={[-0.5, 0, -0.1]}>
          <cylinderGeometry args={[0.03, 0.035, 0.5, 8]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0.22, -0.25, -0.58]} rotation={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.048, 0.038, 0.42, 8]} />
          <meshStandardMaterial color="#999" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* ── FOOTPEGS ── */}
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, -0.32, -0.05]}>
            <boxGeometry args={[0.11, 0.025, 0.055]} />
            <meshStandardMaterial color="#555" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ── FRONT WHEEL ── */}
      <group ref={wheel0}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[wheelRadius, 0.09, 12, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
          <meshStandardMaterial color="#666" metalness={0.85} />
        </mesh>
        {/* Brake disc */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Spoke key={i} angle={i * Math.PI / 3} />
        ))}
      </group>

      {/* ── REAR WHEEL ── */}
      <group ref={wheel1}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[wheelRadius, 0.11, 12, 24]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
          <meshStandardMaterial color="#666" metalness={0.85} />
        </mesh>
        {/* Rear brake disc (smaller) */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.08, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Spoke key={i} angle={i * Math.PI / 3} />
        ))}
      </group>
    </group>
  );
};

export default Bike;
