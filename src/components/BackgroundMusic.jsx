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

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
