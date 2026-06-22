import React, { useState, useEffect, useRef } from "react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London",
];

export default function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  const [tz, setTz] = useState("America/New_York");
  const [showTz, setShowTz] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!showTz) return;
    const handler = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowTz(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTz]);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position dropdown below the button, right-aligned to it
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowTz((v) => !v);
  };

  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(time);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition mr-3"
      >
        {timeString}
      </button>

      {showTz && (
        <div
          className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden w-40"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 99999,
          }}
        >
          <div className="p-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700">
            Time Zone
          </div>
          {TIMEZONES.map((z) => (
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
    </>
  );
}