import { useEffect, useRef } from "react";
import simStore from "../simStore";

const useControls = ({ toggleIgnition, shiftUp, shiftDown, toggleHeadlights, hornHonk } = {}) => {
  const keys = useRef({});

  useEffect(() => {
    const onDown = (e) => {
      if (keys.current[e.code]) return;
      keys.current[e.code] = true;
      if (e.code === "KeyI" && toggleIgnition) toggleIgnition();
      if (e.code === "KeyE" && shiftUp) shiftUp();
      if (e.code === "KeyQ" && shiftDown) shiftDown();
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
