# HowToDrive

**HowToDrive** is a web-based 3D simulator that teaches driving (and flight basics) in a safe, structured, and visually rich environment. It blends realistic physics with guided missions, dynamic HUDs, and optional AI feedback for performance improvement.

## ⭐ Highlights
- **Multi-vehicle training**: Car, Plane, and Helicopter experiences.
- **Two game modes**: Structured Missions and open Free Roam.
- **Realistic simulation**: Manual clutch + gear logic, RPM control, braking dynamics.
- **Training-first design**: Briefing screens, ethics & safety tips, and mission objectives.
- **Performance feedback**: Star rating with traffic light penalties and AI instructor notes.
- **Mobile ready**: On-screen touch controls for phones and tablets.

## 🎯 Motivation and Problem
Learning to drive safely is expensive, risky, and not always accessible. Many learners lack structured practice, realistic feedback, and confidence before driving in the real world. HowToDrive bridges that gap with a safe simulation, guided lessons, and clear performance feedback.

## ✅ Solution Overview
Using Computer Graphics and 3D simulation, HowToDrive recreates real-world driving and flying scenarios (roads, traffic signals, gates, and landing zones). Learners practice controls, follow objectives, and receive immediate, measurable feedback.

## 🧩 Key Features
### Simulation and Missions
- **Manual and Easy Mode** for car control with engine, clutch, and stall logic.
- **Mission system** with objectives, checkpoints, and star-based scoring.
- **Traffic light enforcement** with penalties for signal violations.

### Vehicles and Tracks
- **Car lessons**: starting, braking, shifting, emergency stop, parking, highway, roundabout, slalom.
- **Plane missions**: takeoff, mountain gates, canyon flythrough, aerobatics.
- **Helicopter missions**: helipad hop, canyon rescue.
- **Free Roam**: Stunt Track for open practice.

### HUD and Feedback
- Dynamic HUDs for car and aircraft telemetry.
- Training briefing with ethics, technical knowledge, and tips.
- **AI Instructor feedback** powered by Mistral API (optional, via `VITE_MISTRAL_API_KEY`).

### Visuals and Interaction
- Custom GLSL shader effects for aircraft materials.
- Glassmorphism UI with responsive layouts.
- Mobile touch controls for all vehicle types.

## 🧭 Weekly Work Timeline (6 Weeks)
Evenly distributed timeline as requested for reporting and evaluation.

### Week 1: Discovery and Planning
- Defined learning goals and simulator flow.
- Finalized UI direction, branding, and user flow.
- Set up Vite + React + R3F project structure.
- Built base scene, lighting, and camera setup.

### Week 2: Core Car Simulation
- Implemented engine model, gears, clutch, RPM logic.
- Tuned braking, steering, traction, and stalling.
- Built mission checkpoints and gear gates.

### Week 3: Missions and Training
- Implemented car lessons with objectives and evaluation.
- Built training briefings with ethics and technical tips.
- Added star-based scoring and failure logic.

### Week 4: Vehicles and Environments
- Added plane and helicopter missions with custom controls.
- Built track geometry, ramps, parking bays, and stop lines.
- Integrated traffic light system and violations.

### Week 5: UI, HUD, and Controls
- Designed menu screens and click-to-launch system.
- Built dynamic HUDs for car, plane, and helicopter.
- Added touch controls for mobile devices.

### Week 6: AI Feedback and Polish
- Integrated AI instructor feedback workflow.
- Improved camera resets and performance tuning.
- Finalized documentation and presentation assets.

## ✅ Expanded Work Completed
### Simulation and Mechanics
- Engine + clutch + gear logic with stalls and recovery.
- Responsive steering, braking, and traction tuning.
- Physics-driven vehicle and collision interaction.

### Missions and Scoring
- Multi-stage mission scripting for car, plane, and helicopter.
- Star rating system based on time, mistakes, and hard braking.
- Traffic light violation tracking with penalties.

### UI and Training Experience
- Mission overlays for objectives, hints, and briefings.
- Real-time HUDs for speed, RPM, gear, throttle, altitude, and heading.
- AI-generated instructor feedback (optional).

### Visuals and Shaders
- Custom GLSL shader materials for aircraft bodies.
- Dynamic skies and time-of-day presets.
- Glassmorphism themed UI with modern typography.

## 🛠️ Tech Stack
- **React** for UI and state management.
- **React-Three-Fiber** + **Three.js** for 3D rendering.
- **Cannon.js** for physics and collision.
- **GLSL/OpenGL shaders** for custom visual effects.
- **Lucide-React** for iconography.
- **Mistral AI API** for optional instructor feedback.

## 🧪 Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to start the simulator.

## 🎮 Controls
### Car
- **I**: Ignition
- **W / S**: Accelerate / Brake
- **A / D**: Steering
- **E / Q**: Gear up / Gear down
- **CTRL**: Clutch
- **SPACE**: Handbrake
- **H**: Headlights
- **F**: Horn
- **R**: Reset
- **V**: Camera View
- **ESC**: Menu

### Plane
- **W / S**: Throttle up / down
- **A / D**: Bank left / right
- **SPACE / SHIFT**: Pitch up / down
- **Arrow Keys**: Pitch fine control
- **R**: Reset
- **ESC**: Menu

### Helicopter
- **W / S**: Climb / Descend
- **A / D**: Yaw left / right
- **Arrow Keys**: Move forward/back/left/right
- **R**: Reset
- **ESC**: Menu

## 👥 Team and Contributions
- **Rakhi Chauhan (IIT2024269)**: Plane & Helicopter mode design, tracks, and presentation.
- **Samir Kumar (IIT2024274)**: OpenGL shader implementation and aircraft track design.
- **Bayya Shivani (IIT2024275)**: Plane & Helicopter mode design, objectives, and presentation.
- **Amar Singh (IIT2024276)**: Training briefing concept and car tracks/free roam.
- **Aryan Srivastava (IIT2024501)**: HUD, controls, mission objectives, and AI instructor integration.

## 🖼️ Screenshots
### Menus and Navigation
![Splash Screen](public/screenshots/splash.png)
![Mode Select](public/screenshots/mode-select.png)
![Vehicle Select](public/screenshots/vehicle-select.png)
![Mission Grid](public/screenshots/missions-grid.png)

### Training Flow
![Mission Intro](public/screenshots/mission-intro.png)
![Training Briefing](public/screenshots/training-briefing.png)
![Mission Complete + AI Feedback](public/screenshots/mission-complete-ai.png)

### Gameplay and Controls
![Car HUD](public/screenshots/car-hud-third.png)
![Mobile Touch Controls](public/screenshots/mobile-controls.png)
![Plane Mission](public/screenshots/plane-mission.png)
![Helicopter Mission](public/screenshots/helicopter-mission.png)

## 🔭 Future Improvements
- Traffic and pedestrian AI for realistic urban scenarios.
- Larger tracks with more varied topography.
- Online leaderboard for mission rankings.
