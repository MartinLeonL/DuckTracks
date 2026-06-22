import React, { useState, useEffect } from "react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London"
];

export default function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  const [tz, setTz] = useState("America/New_York"); 
  const [showTz, setShowTz] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz
  }).format(time);

  return (
    <div className="relative flex items-center mr-3">
      <button
        onClick={() => setShowTz(!showTz)}
        className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition"
      >
        {timeString}
      </button>

      {showTz && (
        <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-[100] overflow-hidden w-40">
          <div className="p-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700">
            Time Zone
          </div>
          {TIMEZONES.map(z => (
            <button
              key={z}
              onClick={() => { setTz(z); setShowTz(false); }}
              className={`block w-full text-left px-3 py-2 text-xs hover:bg-slate-700 ${
                tz === z ? "text-emerald-400 font-bold" : "text-slate-300"
              }`}
            >
              {z.split("/")[1]?.replace("_", " ") || z}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}