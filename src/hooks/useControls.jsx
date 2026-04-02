import { useEffect, useRef } from "react";
import simStore from "../simStore";

// Tracks keyboard + touch state. Physics application is in Car.jsx useFrame.
const useControls = ({ toggleIgnition, shiftUp, shiftDown, toggleHeadlights, hornHonk }) => {
  const keys = useRef({});

  useEffect(() => {
    const onDown = (e) => {
      if (keys.current[e.code]) return; // prevent key-repeat fires for one-shots
      keys.current[e.code] = true;
      if (e.code === "KeyI") toggleIgnition();
      if (e.code === "KeyE") shiftUp();
      if (e.code === "KeyQ") shiftDown();
      if (e.code === "KeyH" && toggleHeadlights) toggleHeadlights();
      if (e.code === "KeyF" && hornHonk) hornHonk();
    };
    const onUp = (e) => { keys.current[e.code] = false; };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [toggleIgnition, shiftUp, shiftDown, toggleHeadlights, hornHonk]);

  // Return a proxy that merges keyboard + touch virtual keys
  const merged = new Proxy(keys, {
    get(target, prop) {
      if (prop === "current") {
        return new Proxy({}, {
          get(_, key) {
            return target.current[key] || simStore.touch[key] || false;
          }
        });
      }
      return target[prop];
    }
  });

  return merged;
};

export default useControls;

