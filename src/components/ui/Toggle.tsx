interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${checked ? "bg-primary shadow-[0_0_8px_oklch(0.55_0.2_260_/_0.3)]" : "bg-muted"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5.5 w-5.5 rounded-full bg-white shadow-sm
            transform transition-transform duration-200 mt-[3px]
            ${checked ? "translate-x-[23px]" : "translate-x-[3px]"}`}
        />
      </button>
      {label && (
        <span className="text-sm text-foreground">{label}</span>
      )}
    </label>
  );
}
