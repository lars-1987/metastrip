"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  id?: string;
}

/** Rounded, oversized checkbox in the lilac system. */
export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      id={id}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 cursor-pointer focus-visible:outline-none"
    >
      <span
        className={`grid place-items-center h-6 w-6 shrink-0 rounded-[8px] transition-colors duration-150 ${
          checked
            ? "bg-[var(--primary)]"
            : "bg-[var(--card-elevated)] group-hover:bg-[color-mix(in_srgb,var(--card-elevated)_60%,var(--text-muted))]"
        } group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[var(--bg)]`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          className={`transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"}`}
        >
          <path
            d="M2 6.8L5 9.8L11 3.2"
            stroke="var(--on-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label && (
        <span className="text-[15px] text-[var(--text-body)] group-hover:text-[var(--text)] transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}
