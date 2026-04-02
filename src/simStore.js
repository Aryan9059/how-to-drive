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
  // Extras
  headlightsOn: false,
  hornActive: false,

  // Star Rating Telemetry
  metrics: {
    startTime: 0,
    endTime: 0,
    mistakes: 0,
    hardBrakes: 0,
    lastSpeed: 0,
    isHardBraking: false,
  },

  // Touch virtual keys (written by TouchControls, read by Car same as keyboard)
  touch: {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    KeyE: false,
    KeyQ: false,
    KeyI: false,
    KeyH: false,
    KeyF: false,
  },
};

export default simStore;