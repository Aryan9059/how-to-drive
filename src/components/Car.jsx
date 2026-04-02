import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import useWheels from "../hooks/useWheels";
import useControls from "../hooks/useControls";
import useEngine from "../hooks/useEngine";
import { Quaternion, Vector3 } from "three";
import { ENGINE_CONFIG, GEAR_RATIOS } from "../gameConfig";
import simStore from "../simStore";

const loadCar = () => {
  const result = useLoader(GLTFLoader, "models/car.glb").scene.clone();
  return {
    CarBody: result.children[0],
    WheelRF: result.children[1],
    WheelLF: result.children[2],
    WheelLB: result.children[3],
    WheelRB: result.children[4],
  };
};

const Car = ({
  cameraView,
  startPosition = [-10, 3, -3],
  startRotation = [0, Math.PI / 2, 0],
  difficulty = "easy",
}) => {
  const { CarBody, WheelRF, WheelLF, WheelLB, WheelRB } = useMemo(() => loadCar(), []);

  const width = 1.2;
  const height = 0.7;
  const length = 2.8;
  const wheelRadius = 0.2;

  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: [width, height, length],
      mass: 500,                          // ✅ heavier = less bouncing
      rotation: startRotation,
      position: startPosition,
      linearDamping: 0.25,               // ✅ dampens sliding/drift
      angularDamping: 0.6,               // ✅ prevents flipping & wobble
    }),
    useRef(null)
  );

  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    const unsub = chassisApi.velocity.subscribe((v) => { velocity.current = v; });
    return unsub;
  }, [chassisApi]);

  const [wheels, wheelInfos] = useWheels(width, height, length, wheelRadius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({ chassisBody, wheelInfos, wheels }),
    useRef(null)
  );

  const { engineState, gear, toggleIgnition, shiftUp, shiftDown, stallEngine } = useEngine(difficulty);
  const keys = useControls({ toggleIgnition, shiftUp, shiftDown });

  const engineStateRef = useRef(engineState);
  const gearRef = useRef(gear);
  useEffect(() => { engineStateRef.current = engineState; }, [engineState]);
  useEffect(() => { gearRef.current = gear; }, [gear]);

  // ── Smoothing state refs ────────────────────────────────────────────────
  const currentSteer = useRef(0);        // interpolated steering angle
  const currentForce = useRef(0);        // interpolated engine force
  const cameraPos = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  useFrame((state, delta) => {
    const k = keys.current;

    const throttle = !!k.KeyW;
    const brake = !!k.KeyS;
    const handbrake = !!k.Space;
    const steerLeft = !!k.KeyA;
    const steerRight = !!k.KeyD;
    const clutch = difficulty === "easy" ? false : !!k.ControlLeft;

    simStore.clutchPressed = clutch;
    simStore.handbrake = handbrake;

    const eng = engineStateRef.current;
    const g = gearRef.current;

    // ── RPM simulation ────────────────────────────────────────────────────
    if (eng === "on") {
      const { idleRpm, maxRpm, rpmRiseRate, rpmFallRate, stallRpm } = ENGINE_CONFIG;
      const effectiveThrottle = throttle && !clutch;

      let rpm = simStore.rpm;
      rpm = effectiveThrottle
        ? Math.min(maxRpm, rpm + rpmRiseRate * delta)
        : Math.max(idleRpm, rpm - ((g !== 0 && !clutch) ? rpmFallRate * 1.3 : rpmFallRate) * delta);
      simStore.rpm = rpm;

      if (difficulty === "manual" && g > 0 && !clutch && rpm <= stallRpm) stallEngine();
    } else {
      simStore.rpm = 0;
    }

    // ── Engine force with smoothing ───────────────────────────────────────
    const canDrive = eng === "on";
    const clutchFactor = clutch ? 0 : 1;
    const ratio = GEAR_RATIOS[g] ?? 0;
    const rpmFactor = Math.max(0, Math.min(1,
      (simStore.rpm - ENGINE_CONFIG.idleRpm) /
      (ENGINE_CONFIG.maxRpm - ENGINE_CONFIG.idleRpm)
    ));
    const targetForce = (throttle && canDrive)
      ? ENGINE_CONFIG.maxEngineForce * ratio * rpmFactor * clutchFactor
      : 0;

    // Lerp engine force so acceleration ramps up instead of snapping
    const forceBlend = throttle ? Math.min(1, delta * 6) : Math.min(1, delta * 10);
    currentForce.current += (targetForce - currentForce.current) * forceBlend;

    vehicleApi.applyEngineForce(-currentForce.current, 2);
    vehicleApi.applyEngineForce(-currentForce.current, 3);

    // ── Braking ───────────────────────────────────────────────────────────
    const brakeForce = brake ? ENGINE_CONFIG.maxBrakeForce : 0;
    for (let i = 0; i < 4; i++) vehicleApi.setBrake(brakeForce, i);
    if (handbrake) {
      vehicleApi.setBrake(0, 0);
      vehicleApi.setBrake(0, 1);
      vehicleApi.setBrake(80, 2);        // ✅ rear only for handbrake
      vehicleApi.setBrake(80, 3);
    }

    // ── Smooth steering via lerp ──────────────────────────────────────────
    const speed = simStore.speed;                    // km/h
    const maxSteer = Math.max(0.2, 0.55 - speed * 0.004); // reduce steer at high speed
    const targetSteer = steerLeft ? maxSteer : steerRight ? -maxSteer : 0;
    const steerSpeed = steerLeft || steerRight ? 5 : 8;  // return-to-center faster
    currentSteer.current += (targetSteer - currentSteer.current) * Math.min(1, delta * steerSpeed);

    const s = currentSteer.current;
    vehicleApi.setSteeringValue(s, 0);
    vehicleApi.setSteeringValue(s, 1);
    vehicleApi.setSteeringValue(-s * 0.15, 2);  // slight rear counter-steer
    vehicleApi.setSteeringValue(-s * 0.15, 3);

    // ── Reset ─────────────────────────────────────────────────────────────
    if (k.KeyR) {
      chassisApi.position.set(...startPosition);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(...startRotation);
      currentSteer.current = 0;
      currentForce.current = 0;
    }

    // ── Speed telemetry ───────────────────────────────────────────────────
    const [vx, vy, vz] = velocity.current;
    simStore.speed = Math.sqrt(vx * vx + vy * vy + vz * vz) * 3.6;

    // ── Camera ────────────────────────────────────────────────────────────
    if (cameraView == 0) return;

    const worldPos = new Vector3();
    worldPos.setFromMatrixPosition(chassisBody.current.matrixWorld);
    simStore.position = [worldPos.x, worldPos.y, worldPos.z];

    const quaternion = new Quaternion();
    quaternion.setFromRotationMatrix(chassisBody.current.matrixWorld);

    let cameraDelta = new Vector3(0, 0.5, 0);
    let lookTarget = worldPos.clone();

    if (cameraView == 1) cameraDelta = new Vector3(0, 2, -5);
    if (cameraView == 2) cameraDelta = new Vector3(0, 2, 5);
    if (cameraView == 3) {
      const fwd = new Vector3(0, 0.45, 0.5).applyQuaternion(quaternion);
      lookTarget = worldPos.clone().add(fwd);
    }

    cameraDelta.applyQuaternion(quaternion);
    const desiredCamPos = worldPos.clone().add(cameraDelta);

    // ✅ Smooth camera with lerp so it doesn't snap/jerk
    const camBlend = Math.min(1, delta * 8);
    cameraPos.current.lerp(desiredCamPos, camBlend);
    cameraTarget.current.lerp(lookTarget, camBlend);

    state.camera.position.copy(cameraPos.current);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={vehicle} name="vehicle">
      <group ref={chassisBody} name="chassisBody">
        <primitive object={CarBody} rotation-y={-Math.PI / 2} position={[0, -0.15, 0]} />
      </group>
      <group ref={wheels[0]} name="WheelRF">
        <primitive object={WheelRF} rotation-y={-Math.PI / 2} position={[0, 0, 0]} />
      </group>
      <group ref={wheels[1]} name="WheelLF">
        <primitive object={WheelLF} rotation-y={-Math.PI / 2} position={[0, 0, 0]} />
      </group>
      <group ref={wheels[2]} name="WheelRB">
        <primitive object={WheelRB} rotation-y={-Math.PI / 2} position={[0, 0, 0]} />
      </group>
      <group ref={wheels[3]} name="WheelLB">
        <primitive object={WheelLB} rotation-y={-Math.PI / 2} position={[0, 0, 0]} />
      </group>
    </group>
  );
};

export default Car;