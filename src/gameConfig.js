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

import { Key, TrafficCone, Settings, OctagonAlert, SquareParking, Map, RotateCcw, Mountain, Flag, Trees, Sun, Building2, Snowflake, Flame, Sunrise, Sunset, Moon, Compass, Trophy } from 'lucide-react';

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
      training: "Look to your right (or left depending on country) before entry. Signal your exit clearly (though indicators are and upcoming feature!)."
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

export const FREE_DRIVE_TRACKS = [
  { id: "track1", name: "Stunt Track", icon: Mountain, desc: "A high-octane playground featuring steep ramps, loops, and technical obstacles." },
];

export const TIME_OF_DAY = [
  { id: "dawn", label: "Dawn", icon: Sunrise },
  { id: "day", label: "Day", icon: Sun },
  { id: "dusk", label: "Dusk", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
];

export const LESSON_CAR_STARTS = {
  lesson1: { position: [-10, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson2: { position: [-38, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson3: { position: [-18, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson4: { position: [-40, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson5: { position: [-20, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson6: { position: [-20, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson7: { position: [-2.5, 1, -70], rotation: [0, 0, 0] }, // Pushed way back and in opposite lane
  lesson8: { position: [-15, 1, -3], rotation: [0, Math.PI / 2, 0] },
  lesson9: { position: [-18, 1, -3], rotation: [0, Math.PI / 2, 0] },
};

export const LESSON_CAR_START = LESSON_CAR_STARTS.lesson1;

export const TRACK_CAR_STARTS = {
  track1: { position: [-10, 3, -3], rotation: [0, Math.PI / 2, 0] },
};