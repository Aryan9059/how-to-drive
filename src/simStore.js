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

  // ── Helicopter-specific telemetry ─────────────────────────────
  heliPitch: 0,         // degrees
  heliRoll: 0,          // degrees
  heliHeading: 0,       // 0-360
  heliVerticalSpeed: 0, // m/s
  heliThrottle: 0,      // 0-1 (collective %)
  heliGearDown: true,   // landing skid state

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
    // Car
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
    // Helicopter / shared
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyJ: false,
    KeyL: false,
    KeyK: false,
    ShiftLeft: false,
    ControlLeft: false,
    // Plane
    KeyB: false,
    KeyG: false,
    KeyR: false,
  },
};

export default simStore;
