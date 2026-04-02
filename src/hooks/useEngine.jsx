import { useState, useEffect, useCallback, useRef } from "react";
import simStore from "../simStore";

const useEngine = (difficulty = "easy") => {
  const [engineState, setEngineState] = useState("off");
  const [gear, setGear] = useState(0);
  const crankTimer = useRef(null);
  const mounted = useRef(true);

  // Sync discrete state → simStore so SimHUD can poll
  useEffect(() => { simStore.engineState = engineState; }, [engineState]);
  useEffect(() => { simStore.gear = gear; }, [gear]);

  useEffect(() => () => {
    mounted.current = false;
    clearTimeout(crankTimer.current);
  }, []);

  // ── Ignition ──────────────────────────────────────────────────────────────
  const toggleIgnition = useCallback(() => {
    const state = simStore.engineState;
    if (state === "off" || state === "stalled") {
      setEngineState("cranking");
      clearTimeout(crankTimer.current);
      crankTimer.current = setTimeout(() => {
        if (mounted.current) {
          setEngineState("on");
          simStore.rpm = 800;
        }
      }, 1400);
    } else if (state === "on") {
      clearTimeout(crankTimer.current);
      setEngineState("off");
      simStore.rpm = 0;
    }
  }, []);

  // ── Gear shifts ───────────────────────────────────────────────────────────
  // Manual: clutch must be pressed. Easy: shift freely.
  const shiftUp = useCallback(() => {
    if (difficulty === "manual" && !simStore.clutchPressed) return;
    setGear((g) => Math.min(5, g + 1));
  }, [difficulty]);

  const shiftDown = useCallback(() => {
    if (difficulty === "manual" && !simStore.clutchPressed) return;
    setGear((g) => Math.max(-1, g - 1));
  }, [difficulty]);

  // ── Stall (called from Car's useFrame) ───────────────────────────────────
  const stallEngine = useCallback(() => {
    clearTimeout(crankTimer.current);
    setEngineState("stalled");
    simStore.rpm = 0;
  }, []);

  return { engineState, gear, toggleIgnition, shiftUp, shiftDown, stallEngine };
};

export default useEngine;
