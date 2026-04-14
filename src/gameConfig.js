import { Key, TrafficCone, Settings, OctagonAlert, SquareParking, Map, RotateCcw, Mountain, Flag, Sun, Sunrise, Sunset, Moon, Compass, Trophy, ArrowUpCircle, Target, Navigation, Crosshair } from 'lucide-react';

export const GEAR_NAMES = { "-1": "R", 0: "N", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" };

export const GEAR_RATIOS = {
  "-1": -2.8,
  0: 0,
  1: 0.75,
  2: 1.0,
  3: 1.4,
  4: 2.0,
  5: 3.0,
};

export const ENGINE_CONFIG = {
  idleRpm: 800,
  maxRpm: 8000,
  redlineRpm: 7200,
  shiftUpRpm: 5500,
  shiftDownRpm: 1800,
  stallRpm: 700,
  maxEngineForce: 300,
  maxBrakeForce: 40,
  rpmRiseRate: 4500,
  rpmFallRate: 2800,
};



// ─── Car Missions ───────────────────────────────────────────────────────────
export const LESSONS = [
  {
    id: "lesson1",
    title: "Starting the Car",
    icon: Key,
    description: "Before you can drive, you need to start the engine, engage a gear and move off.",
    objective: "Start the engine and drive through the checkpoint gate ahead.",
    controlsHint: "Press I to start engine → Left Ctrl (clutch) → E for 1st gear → release clutch slowly + press W",
    easyHint: "Press I to start engine → E to select 1st gear → press W to move through the gate",
    stars: { time: 25, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "A driver's first responsibility is the safety of their passengers and others on the road.",
      knowledge: "The Internal Combustion Engine (ICE) requires an ignition sequence. The clutch disconnects the engine from the wheels to allow gear shifts.",
      training: "Ensure the handbrake is on before starting. Always check your surroundings before moving off."
    }
  },
  {
    id: "lesson2",
    title: "Moving & Stopping",
    icon: TrafficCone,
    description: "Good control means smooth stopping, not just movement.",
    objective: "Drive to the stop line and bring the car to a complete standstill.",
    controlsHint: "Use S to brake smoothly. Press Left Ctrl before stopping to avoid stalling.",
    easyHint: "Press W to drive. Press S to brake. Come to a full stop at the red line.",
    stars: { time: 40, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Anticipate road hazards early. Smooth braking prevents discomfort for others and saves fuel.",
      knowledge: "Braking converts kinetic energy into heat. Hard braking can lock wheels, reducing steering control.",
      training: "Keep a safe distance from stop lines. In manual mode, press the clutch before fully stopping to prevent an engine stall."
    }
  },
  {
    id: "lesson3",
    title: "Changing Gears",
    icon: Settings,
    description: "Each gate requires you to be in the right gear. Too low = sluggish. Too high = stall.",
    objective: "Pass through all three gates in the correct gear shown (2nd, 3rd, 4th).",
    controlsHint: "Left Ctrl + E = gear up. Watch the RPM — shift at 5000+ RPM.",
    easyHint: "Press E to shift up. Pass each gate in the gear shown on the arch.",
    stars: { time: 55, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Responsible drivers maintain their vehicle. Excessive RPM (redlining) causes premature engine wear and noise pollution.",
      knowledge: "Gears act as leverage. Lower gears provide high torque for starting; higher gears provide high speed and efficiency.",
      training: "Listen to the engine. If it's screaming, shift up (E). If it's struggling/shaking, shift down (Q)."
    }
  },
  {
    id: "lesson4",
    title: "Emergency Braking",
    icon: OctagonAlert,
    description: "Emergency stops require full brake force applied quickly.",
    objective: "Accelerate past 50 km/h, then stop completely before the red wall.",
    controlsHint: "Press Space (handbrake) + S (brake) together for maximum stopping power.",
    easyHint: "Press Space + S together to brake hard. Stop before the red wall.",
    stars: { time: 28, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Speeding is the leading cause of fatal accidents. Always drive at a speed where you can stop within the distance you see ahead.",
      knowledge: "Electronic Stability Control and ABS help, but physics can't be cheated—doubling speed quadruples your stopping distance.",
      training: "In an emergency, apply full pressure to both the foot brake and handbrake. Keep the steering straight to avoid skidding."
    }
  },
  {
    id: "lesson5",
    title: "Parking",
    icon: SquareParking,
    description: "Parking requires precise low-speed control and use of reverse.",
    objective: "Reverse into the yellow marked bay, stop completely and apply the handbrake.",
    controlsHint: "Q to select R (reverse) gear. Use A/D to steer while reversing. Space = handbrake.",
    easyHint: "Press Q twice to get to R gear. Reverse slowly into the yellow bay. Press Space to park.",
    stars: { time: 75, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Respect parking boundaries. Obstructing paths or other vehicles is a sign of a poor, inconsiderate driver.",
      knowledge: "Reversing changes your steering perspective. Small, slow adjustments are better than large, fast ones.",
      training: "Use the reverse gear (R). Shift using Q when stopped. Always apply the handbrake (Space) once fully parked."
    }
  },
  {
    id: "lesson6",
    title: "Highway Driving",
    icon: Map,
    description: "Highway driving means sustaining high speed in the right gear efficiently.",
    objective: "Maintain 40 km/h or faster in 4th gear or above for 15 seconds.",
    controlsHint: "Shift to 4th gear before reaching high speed. Keep RPM in the green zone.",
    easyHint: "Shift to 4th gear with E. Hold W and maintain 40+ km/h for 15 seconds.",
    stars: { time: 45, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Maintain lane discipline. Lanes are for safety, not for weaving. Keep left unless overtaking.",
      knowledge: "At high speeds, minor steering inputs have major effects. aerodynamics also play a huge role in fuel consumption.",
      training: "Maintain a steady throttle. Use 4th or 5th gear for maximum efficiency and lower engine noise."
    }
  },
  {
    id: "lesson7",
    title: "Roundabout",
    icon: RotateCcw,
    description: "Roundabouts require you to give way, enter smoothly and exit at the right point.",
    objective: "Enter the roundabout, complete one full loop and exit on the north road.",
    controlsHint: "Approach slowly in 1st or 2nd gear. Steer gradually. Watch your speed.",
    easyHint: "Drive around the circle slowly. Take the exit road at the top (north).",
    stars: { time: 60, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Always yield to traffic already in the roundabout. Patience at intersections prevents gridlock.",
      knowledge: "Roundabouts improve traffic flow and safety compared to traditional 4-way stops by slowing all vehicles down.",
      training: "Look to your right (or left depending on country) before entry. Signal your exit clearly."
    }
  },
  {
    id: "lesson9",
    title: "Slalom Course",
    icon: Flag,
    description: "Test your steering precision by weaving through the cone course without hitting any.",
    objective: "Weave through all the cones and reach the finish arch without knocking any over.",
    controlsHint: "Stay in 1st or 2nd gear. Use smooth A/D steering inputs. Don't rush.",
    easyHint: "Steer left and right through the cones. Drive slowly and carefully.",
    stars: { time: 65, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "A great driver is a precise driver. Control is more impressive than pure speed.",
      knowledge: "Car width awareness is vital for city driving and narrow passages. Understand your vehicle's 'pivot point'.",
      training: "Maintain a low, constant speed. Sudden acceleration during tight turns can cause loss of control."
    }
  },
];

// ─── Bike Missions ───────────────────────────────────────────────────────────
export const BIKE_MISSIONS = [
  {
    id: "bike1",
    title: "City Circuit",
    icon: Flag,
    description: "Weave through urban traffic cones and tight chicanes on your sport bike.",
    objective: "Weave through all cones and reach the finish gate. Lean into corners!",
    controlsHint: "W = throttle, S = brake, A/D = steer. Speed affects lean. Space = rear brake.",
    easyHint: "Use W to go, A/D to steer. Slow down before cone sections.",
    stars: { time: 60, mistakes: 2, hardBrakes: 5 },
    briefing: {
      ethics: "Motorcyclists are among the most vulnerable road users. Precision and caution save lives.",
      knowledge: "Countersteering: push the right bar to turn right at speed. At low speed, turn bars normally.",
      training: "Use body lean to initiate turns. Brake before corners, not in them."
    }
  },
  {
    id: "bike2",
    title: "Alpine Pass",
    icon: Mountain,
    description: "Tackle winding mountain switchbacks and hit all 3 speed checkpoints.",
    objective: "Complete the mountain course, hitting all 3 speed checkpoints above 60 km/h.",
    controlsHint: "High-speed cornering needs smooth throttle control. Trail-brake into turns.",
    easyHint: "W = go, S = slow, A/D = steer. Keep speed above 60 through the gates.",
    stars: { time: 90, mistakes: 1, hardBrakes: 3 },
    briefing: {
      ethics: "Mountain roads claim many riders. Respect blind corners and always assume oncoming traffic.",
      knowledge: "Weight transfer on a motorcycle is dramatic. Braking shifts weight forward, improving front grip but reducing rear traction.",
      training: "Enter corners wider, apex mid, exit wide. Look through the corner, not at the apex."
    }
  },
  {
    id: "bike3",
    title: "Coastal Sprint",
    icon: Flag,
    description: "Race 500 m along a coastal highway with a chicane in the middle.",
    objective: "Reach the finish line at the far end of the coastal road.",
    controlsHint: "W = throttle, S = brake, A/D = steer. Build speed on the straight sections.",
    easyHint: "Hold W to accelerate and steer through the chicane. Cross the finish arch.",
    stars: { time: 45, mistakes: 2, hardBrakes: 4 },
    briefing: {
      ethics: "Coastal roads can be treacherous. Watch for gravel and cross-winds near the sea.",
      knowledge: "High-speed stability on a bike requires smooth, measured inputs. Sudden movements cause wobble.",
      training: "Use early braking to set up the chicane. Roll the throttle on as you exit each bend."
    }
  },
  {
    id: "bike4",
    title: "Track Day",
    icon: Trophy,
    description: "Complete 2 laps of the oval circuit on your sport bike.",
    objective: "Cross the start/finish line twice to complete 2 full laps.",
    controlsHint: "W = throttle, S = brake, A/D = steer. Brake late into the banked corners.",
    easyHint: "Follow the circuit around twice. Cross the start/finish line to count each lap.",
    stars: { time: 120, mistakes: 1, hardBrakes: 6 },
    briefing: {
      ethics: "Track days require riders to respect circuit rules and other riders at all times.",
      knowledge: "Banked corners allow higher cornering speeds as the banking converts lateral g-force to vertical.",
      training: "Find the racing line: wide entry, late apex, wide exit. Consistent laps beat risky bursts of speed."
    }
  },
];

// ─── Plane Missions ──────────────────────────────────────────────────────────
export const PLANE_MISSIONS = [
  {
    id: "plane1",
    title: "Airfield Takeoff",
    icon: ArrowUpCircle,
    description: "Learn to taxi, accelerate down the runway and achieve lift-off.",
    objective: "Build speed on the runway, then climb through all 3 altitude gate rings.",
    controlsHint: "W = throttle. Hold W until 80+ km/h, then SPACE to pitch up for takeoff.",
    easyHint: "Hold W to go fast, then press SPACE to climb. Steer A/D to stay on course.",
    stars: { time: 90, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Aviation has strict protocols. Pre-flight checks and clearance procedures exist to prevent disasters.",
      knowledge: "Lift is generated by differential pressure over the wing. Speed creates lift — below stall speed, the wing stops working.",
      training: "Accelerate to at least 80 km/h, then raise the nose smoothly. Aggressive pitch-up at low speed causes a stall."
    }
  },
  {
    id: "plane2",
    title: "Mountain Gates",
    icon: Target,
    description: "Navigate your plane through 5 aerial rings set among mountain terrain.",
    objective: "Fly through all 5 glowing gate rings in order at altitude.",
    controlsHint: "Use SPACE/Shift for pitch, A/D for bank-and-turn. W = more throttle.",
    easyHint: "Aim through each glowing ring. Use A/D to turn, SPACE to climb.",
    stars: { time: 120, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Air traffic restrictions exist for good reason. Restricted airspace protects populated areas.",
      knowledge: "Banking (rolling) the aircraft and pulling back simultaneously produces a coordinated turn.",
      training: "Plan your approach to each ring from far away. Sudden control inputs at high speed are dangerous."
    }
  },
  {
    id: "plane3",
    title: "Canyon Flythrough",
    icon: Crosshair,
    description: "Fly low through a narrow canyon and hit all 4 inline gate rings.",
    objective: "Fly through all 4 glowing canyon gate rings without hitting the walls.",
    controlsHint: "Maintain altitude with SPACE. Use A/D to correct your heading. Keep throttle steady.",
    easyHint: "Fly straight through the canyon. Each glowing ring you pass counts toward completion.",
    stars: { time: 80, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Low-level flying is strictly regulated. Canyon flying is only permitted in designated areas.",
      knowledge: "Ground effect gives extra lift close to the ground, helping maintain altitude at lower speeds.",
      training: "Enter the canyon at a steady altitude and throttle. Avoid large pitch changes — there is no room to recover."
    }
  },
  {
    id: "plane4",
    title: "Aerobatics Challenge",
    icon: Navigation,
    description: "Fly through 6 rings arranged in a complex 3-D aerobatics course.",
    objective: "Fly through all 6 glowing aerobatics rings in order.",
    controlsHint: "SPACE = climb, Shift = dive, A/D = bank-and-turn. Combine inputs for 3-D manoeuvres.",
    easyHint: "Follow each numbered ring in sequence. Use SPACE to climb and Shift to dive.",
    stars: { time: 150, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Aerobatics require dedicated airspace clearance and trained pilots. Never attempt near populated areas.",
      knowledge: "Aerobatic manoeuvres exploit all three axes of aircraft motion simultaneously.",
      training: "Look ahead to plan the next gate while flying the current one. Rushing leads to missed rings."
    }
  },
];

// ─── Helicopter Missions ──────────────────────────────────────────────────────
export const HELICOPTER_MISSIONS = [
  {
    id: "heli1",
    title: "Helipad Hop",
    icon: Navigation,
    description: "Hover precisely over each helipad and land smoothly.",
    objective: "Take off from base, land on 3 elevated helipads in sequence.",
    controlsHint: "W = climb, S = descend, A/D = yaw (rotate). ↑↓←→ = fly forward/back/left/right.",
    easyHint: "W to go up, S to go down, arrow keys to fly sideways. Land on the yellow H pads.",
    stars: { time: 120, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Helicopter operations near populated areas require low noise and precise positioning to avoid accidents.",
      knowledge: "The collective controls altitude. The cyclic (tilting) controls direction. Anti-torque pedals control yaw.",
      training: "Apply power slowly. The helicopter responds to inputs with a lag — anticipate early. Hover before moving."
    }
  },
  {
    id: "heli2",
    title: "Canyon Rescue",
    icon: Crosshair,
    description: "Navigate a deep canyon to rescue survivors on remote platforms.",
    objective: "Fly through 3 waypoint rings in the canyon and land on the summit helipad.",
    controlsHint: "Use arrow keys for precise lateral movement. W/S for altitude. Watch for rock walls!",
    easyHint: "Fly through the colored rings, then land on the top platform. Stay high to avoid rocks.",
    stars: { time: 150, mistakes: 0, hardBrakes: 10 },
    briefing: {
      ethics: "Search and rescue pilots face extreme pressure. Precision and composure save lives where no one else can reach.",
      knowledge: "Canyon flying requires extra caution: downdrafts and turbulence from canyon walls can suddenly drop altitude.",
      training: "Never fly blind around corners. Choose altitude carefully and use hovering to assess your path before moving forward."
    }
  },
];

// ─── Free Roam ───────────────────────────────────────────────────────────────
export const FREE_DRIVE_TRACKS = [
  { id: "track1", name: "Stunt Track", icon: Mountain, desc: "A high-octane playground featuring steep ramps, loops, and technical obstacles." },
];

export const TIME_OF_DAY = [
  { id: "dawn", label: "Dawn", icon: Sunrise },
  { id: "day", label: "Day", icon: Sun },
  { id: "dusk", label: "Dusk", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
];

// ─── Start Positions ──────────────────────────────────────────────────────────
export const LESSON_CAR_STARTS = {
  lesson1: { position: [-10, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson2: { position: [-38, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson3: { position: [-18, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson4: { position: [-40, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson5: { position: [-20, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson6: { position: [-20, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson7: { position: [-2.5, 1, -70], rotation: [0, 0, 0] },
  lesson8: { position: [-15, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson9: { position: [-18, 1, -3], rotation: [0, Math.PI / 2, 0] },
};

export const LESSON_CAR_START = LESSON_CAR_STARTS.lesson1;

export const TRACK_CAR_STARTS = {
  track1: { position: [-10, 3, -3], rotation: [0, Math.PI / 2, 0] },
};

export const BIKE_STARTS = {
  bike1: { position: [-15, 1.5, -3], rotation: [0, Math.PI / 2, 0] },
  bike2: { position: [-15, 1.5, -3], rotation: [0, Math.PI / 2, 0] },
  bike3: { position: [-240, 1.5, 0],  rotation: [0, Math.PI / 2, 0] },
  bike4: { position: [-20, 1.5, 10],  rotation: [0, Math.PI / 2, 0] },
};

export const PLANE_STARTS = {
  plane1: { position: [-90, 1, 0],  rotation: [0, Math.PI / 2, 0] },
  plane2: { position: [-180, 1, 0], rotation: [0, Math.PI / 2, 0] },
  plane3: { position: [-200, 8, 0], rotation: [0, Math.PI / 2, 0] },
  plane4: { position: [0, 10, 0],   rotation: [0, Math.PI / 2, 0] },
};

export const HELICOPTER_STARTS = {
  heli1: { position: [0, 8, 0], rotation: [0, 0, 0] },
  heli2: { position: [-100, 5, -80], rotation: [0, 0, 0] },
};

// ─── Vehicle Category Info ───────────────────────────────────────────────────
export const VEHICLE_CATEGORIES = [
  {
    id: "car",
    label: "Car",
    emoji: "🚗",
    icon: "car",
    color: "#6366f1",
    missions: null, // uses LESSONS
    description: "Master the road with manual & automatic car controls.",
  },
  {
    id: "bike",
    label: "Bike",
    emoji: "🏍️",
    icon: "bike",
    color: "#f59e0b",
    missions: "BIKE_MISSIONS",
    description: "Feel the lean and thrill of motorcycle riding.",
  },
  {
    id: "plane",
    label: "Plane",
    emoji: "✈️",
    icon: "plane",
    color: "#22d3ee",
    missions: "PLANE_MISSIONS",
    description: "Take to the skies and master aerial navigation.",
  },
  {
    id: "helicopter",
    label: "Helicopter",
    emoji: "🚁",
    icon: "helicopter",
    color: "#34d399",
    missions: "HELICOPTER_MISSIONS",
    description: "Hover, ascend and navigate vertical flight.",
  },
];