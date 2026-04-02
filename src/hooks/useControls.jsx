import { useEffect, useRef } from "react";

// Tracks keyboard state only. Physics application is in Car.jsx useFrame.
const useControls = ({ toggleIgnition, shiftUp, shiftDown }) => {
  const keys = useRef({});

  useEffect(() => {
    const onDown = (e) => {
      if (keys.current[e.code]) return; // prevent key-repeat fires for one-shots
      keys.current[e.code] = true;
      if (e.code === "KeyI") toggleIgnition();
      if (e.code === "KeyE") shiftUp();
      if (e.code === "KeyQ") shiftDown();
    };
    const onUp = (e) => { keys.current[e.code] = false; };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [toggleIgnition, shiftUp, shiftDown]);

  return keys; // ref to current key map, read in useFrame
};

export default useControls;
