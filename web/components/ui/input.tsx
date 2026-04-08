import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/* ---------- Text Input ---------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full h-9 px-3
          bg-white/5 border rounded-lg
          text-sm text-zinc-200 placeholder-zinc-600
          transition-all duration-150
          focus:outline-none focus:ring-1
          ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30"
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ---------- Textarea ---------- */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3 py-2
          bg-white/5 border rounded-lg
          text-sm text-zinc-200 placeholder-zinc-600
          transition-all duration-150
          resize-y min-h-[80px]
          focus:outline-none focus:ring-1
          ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30"
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
