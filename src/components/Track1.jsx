import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import ColliderBox from "./ColliderBox";
import Ramp from "./Ramp";

const Track1 = () => {
  const result = useLoader(GLTFLoader, "models/track.glb").scene;

  // Circular boundary parameters
  const radius = 70; // Adjust this to make the boundary larger or smaller
  const segments = 36;
  const height = 20; // High enough so the car doesn't fly over it
  const thickness = 2; // Thickness of the invisible wall
  // Calculate width of each segment (arc length + slight overlap to prevent gaps)
  const segmentLength = (2 * Math.PI * radius) / segments + 2;

  // Generate the invisible boundary boxes
  const boundaryBoxes = Array.from({ length: segments }).map((_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    // Calculate x and z positions on the circle
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return (
      <ColliderBox
        key={`boundary-${i}`}
        position={[x, height / 2, z]}
        scale={[segmentLength, height, thickness]}
        // Tangent rotation to make the box face the center
        rotation={[0, -angle + Math.PI / 2, 0]}
      />
    );
  });

  return (
    <>
      <primitive object={result} />

      {/* Existing track obstacles and inner colliders */}
      <ColliderBox position={[-2.8, 0, 9.55]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[-4.15, 0, 11.9]} rotation={[0, Math.PI / 3, 0]} />
      <ColliderBox position={[-5.75, 0, 9.85]} rotation={[0, Math.PI / 4, 0]} />

      <ColliderBox position={[10.02, 0, -16.35]} rotation={[0, -Math.PI / 6, 0]} />
      <ColliderBox position={[14.75, 0, 1.57]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[17.13, 0, 14.28]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[29.53, 0, -12.29]} rotation={[0, Math.PI / 4, 0]} />

      <ColliderBox position={[-26.41, 0, 5.65]} rotation={[0, Math.PI / 6, 0]} />
      <ColliderBox position={[-5.2, 0, -12.6]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[-16.48, 0, 16.62]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[-15.65, 0, -8.4]} rotation={[0, Math.PI / 4, 0]} />
      <ColliderBox position={[-24.47, 0, -12.27]} rotation={[0, Math.PI / 4, 0]} />

      <ColliderBox position={[-0.35, 0, -5.05]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-0.35, 0, -0.7]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-0.35, 2.4, -2.875]} scale={[0.5, 0.7, 5]} />

      <ColliderBox position={[-2.72, 0, -5.05]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-2.72, 0, -0.7]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-2.72, 2.4, -2.875]} scale={[0.5, 0.7, 5]} />

      <ColliderBox position={[-5.09, 0, -5.05]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-5.09, 0, -0.7]} scale={[0.5, 6, 0.7]} />
      <ColliderBox position={[-5.09, 2.4, -2.875]} scale={[0.5, 0.7, 5]} />
      <ColliderBox position={[2.6, 0, -12.85]} scale={[7.9, 8.5, 5.9]} />

      <ColliderBox position={[-7.25, 0, -6.095]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-7.25, 0, -7.825]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-8.98, 0, -6.095]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-8.98, 0, -7.825]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-8.115, 2, -6.96]} scale={[2.3, 0.9, 2.3]} />

      <ColliderBox position={[-10.63, 0, -6.095]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-10.63, 0, -7.825]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-12.36, 0, -6.095]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-12.36, 0, -7.825]} scale={[0.18, 4, 0.18]} />
      <ColliderBox position={[-11.495, 2, -6.96]} scale={[2.3, 0.9, 2.3]} />
      <ColliderBox position={[-10.33, 0, -0.275]} scale={[2, 1.7, 0.17]} />

      <ColliderBox position={[-21.36, 0, 1.2]} scale={[0.25, 2.6, 0.8]} />
      <ColliderBox position={[-20.33, 0, -2.83]} scale={[0.25, 2.6, 0.8]} rotation={[0, -Math.PI / 6, 0]} />
      <ColliderBox position={[-20.4, 0, 5.13]} scale={[0.25, 2.6, 0.8]} rotation={[0, Math.PI / 6, 0]} />
      <ColliderBox position={[4.6, 0, 0.1]} scale={[0.25, 2.6, 0.8]} rotation={[0, -Math.PI / 4, 0]} />

      <Ramp />

      {/* Invisible Circular Boundary */}
      {boundaryBoxes}
    </>
  );
};

export default Track1;