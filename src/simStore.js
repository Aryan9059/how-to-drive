const simStore = {
  
  position: [0, 0, 0],
  speed: 0,
  altitude: 0,
  
  engineState: "off",
  gear: 0,
  rpm: 0,
  
  clutchPressed: false,
  handbrake: false,
  
  headlightsOn: false,
  hornActive: false,
  musicMuted: false,

  // Traffic light violations (real-time HUD display)
  trafficViolations: 0,

  // ── Plane-specific telemetry ──────────────────────────────────
  throttle: 0,        // 0-1
  flaps: 0,           // 0-4 (notches)
  gearDown: true,     // landing gear extended
  brakeActive: false,

  // Attitude (degrees)
  planePitch: 0,
  planeRoll: 0,
  planeHeading: 0,    // 0-360

  // Rates
  verticalSpeed: 0,   // m/s (positive = climbing)

  metrics: {
    startTime: 0,
    endTime: 0,
    mistakes: 0,
    hardBrakes: 0,
    lastSpeed: 0,
    isHardBraking: false,
    trafficViolations: 0,
  },

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
