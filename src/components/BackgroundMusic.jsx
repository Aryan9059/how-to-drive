import { useEffect, useRef } from "react";

const BackgroundMusic = ({ mode, muted }) => {
  const audioRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {

    const audio = new Audio("/background.mp3");
    audio.loop = true;
    audio.volume = muted ? 0 : (mode === "menu" ? 0.4 : 0.1);
    audioRef.current = audio;

    const handleInteraction = () => {
      if (!initialized.current && audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        initialized.current = true;
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    const handleVisibility = () => {
      if (!audioRef.current) return;
      if (document.visibilityState === "hidden") {
        audioRef.current.pause();
      } else if (!muted && initialized.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    const handleBlur = () => {
      if (audioRef.current) audioRef.current.pause();
    };

    const handleFocus = () => {
      if (audioRef.current && !muted && initialized.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleBlur);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleBlur);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [muted]);

  useEffect(() => {
    if (audioRef.current) {
      const targetVolume = muted ? 0 : (mode === "menu" ? 0.4 : 0.1);


      const currentVol = audioRef.current.volume;
      const step = (targetVolume - currentVol) / 20;
      let count = 0;

      const interval = setInterval(() => {
        if (count < 20 && audioRef.current) {
          audioRef.current.volume = Math.max(0, Math.min(1, audioRef.current.volume + step));
          count++;
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [mode, muted]);

  return null;
};

export default BackgroundMusic;
