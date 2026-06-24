import React, { useState, useEffect } from "react";

export default function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(time);

  return (
    <div className="text-xs font-bold text-slate-300 px-3 py-1.5 mr-3">
      {timeString}
    </div>
  );
}
