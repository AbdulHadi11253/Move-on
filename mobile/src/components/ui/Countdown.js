import { useEffect, useRef, useState } from "react";

function format(ms) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Ticks every second toward `targetIso`. Calls onDone once when it reaches zero
// (e.g. to refetch journey state so the next day unlocks).
export function useCountdown(targetIso, onDone) {
  const [remaining, setRemaining] = useState(() =>
    targetIso ? new Date(targetIso).getTime() - Date.now() : 0
  );
  const firedRef = useRef(false);

  useEffect(() => {
    if (!targetIso) return;
    firedRef.current = false;
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const rem = target - Date.now();
      setRemaining(rem);
      if (rem <= 0 && !firedRef.current) {
        firedRef.current = true;
        onDone?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return { remaining, label: format(remaining), done: remaining <= 0 };
}
