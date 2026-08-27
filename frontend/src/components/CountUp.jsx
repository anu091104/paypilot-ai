import { useEffect, useState } from "react";

export default function CountUp({ value, duration = 600, prefix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start;
    let frame;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString("en-IN")}</>;
}
