// Mutable singleton — Car.jsx writes every frame, SimHUD + LessonMonitor read via polling
const simStore = {
  // Telemetry (written by Car in useFrame)
  position: [0, 0, 0],
  speed: 0,          // km/h
  // Engine (written by useEngine via useEffect)
  engineState: "off", // "off" | "cranking" | "on" | "stalled"
  gear: 0,            // -1=R, 0=N, 1-5
  rpm: 0,
  // Input state (written by Car in useFrame)
  clutchPressed: false,
  handbrake: false,
};

export default simStore;
