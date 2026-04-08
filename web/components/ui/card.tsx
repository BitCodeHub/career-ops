import type { ReactNode, HTMLAttributes } from "react";

type CardVariant = "default" | "highlighted" | "warning";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]",
  highlighted:
    "bg-white/[0.03] border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_0_20px_hsla(187,74%,44%,0.08)]",
  warning:
    "bg-white/[0.03] border-amber-500/30 hover:border-amber-500/50 hover:shadow-[0_0_20px_hsla(38,92%,50%,0.08)]",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        border rounded-xl backdrop-blur-sm
        transition-all duration-200
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({
  className = "",
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-white/[0.06] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: CardSectionProps) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={`px-5 py-3 border-t border-white/[0.06] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
