import { useState, useRef, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { formatTime12h, isValidTime, generateTimeSuggestions } from "../../lib/time";

interface TimePickerProps {
  value: string;           // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
  increment?: number;      // for suggestion list (15, 30, 60)
  startHour?: number;
  endHour?: number;
}

export default function TimePicker({
  value,
  onChange,
  label,
  increment = 30,
  startHour = 0,
  endHour = 24,
}: TimePickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () => generateTimeSuggestions(increment, startHour, endHour),
    [increment, startHour, endHour]
  );

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (raw: string) => {
    setInputValue(raw);
    // Auto-format and validate
    const cleaned = raw.replace(/[^0-9:]/g, "");
    if (isValidTime(cleaned)) {
      onChange(cleaned.padStart(5, "0"));
    }
  };

  const handleBlur = () => {
    // Try to fix common formats
    let fixed = inputValue.trim();

    // Handle "9" → "09:00", "13" → "13:00"
    if (/^\d{1,2}$/.test(fixed)) {
      const h = parseInt(fixed, 10);
      if (h >= 0 && h <= 23) {
        fixed = `${h.toString().padStart(2, "0")}:00`;
      }
    }
    // Handle "930" → "09:30", "1330" → "13:30"
    if (/^\d{3,4}$/.test(fixed)) {
      const h = parseInt(fixed.slice(0, -2), 10);
      const m = parseInt(fixed.slice(-2), 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        fixed = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
    }

    if (isValidTime(fixed)) {
      setInputValue(fixed);
      onChange(fixed);
    } else {
      // Revert to last valid value
      setInputValue(value);
    }
    // Delay closing so click on suggestion can register
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSelect = (time: string) => {
    setInputValue(time);
    onChange(time);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          placeholder="HH:mm"
          className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5
            text-sm text-foreground transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
            hover:border-primary/30"
        />

        {/* Suggestions dropdown */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border
            bg-card shadow-xl">
            {suggestions.map((time) => (
              <button
                key={time}
                type="button"
                onMouseDown={() => handleSelect(time)}
                className={`w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer
                  hover:bg-accent first:rounded-t-xl last:rounded-b-xl
                  ${time === value ? "bg-primary/5 text-primary font-medium" : "text-foreground"}`}
              >
                {formatTime12h(time)}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Display the 12h value below for clarity */}
      {isValidTime(inputValue) && (
        <p className="text-xs text-muted-foreground">{formatTime12h(inputValue)}</p>
      )}
    </div>
  );
}
