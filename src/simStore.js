const simStore = {
  
  position: [0, 0, 0],
  speed: 0,
  
  engineState: "off",
  gear: 0,
  rpm: 0,
  
  clutchPressed: false,
  handbrake: false,
  
  headlightsOn: false,
  hornActive: false,

  
  metrics: {
    startTime: 0,
    endTime: 0,
    mistakes: 0,
    hardBrakes: 0,
    lastSpeed: 0,
    isHardBraking: false,
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