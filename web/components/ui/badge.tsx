import type { HTMLAttributes } from "react";

type BadgeStatus =
  | "Evaluated"
  | "Applied"
  | "Responded"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Discarded"
  | "SKIP";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus;
}

const statusStyles: Record<BadgeStatus, string> = {
  Evaluated: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Applied: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Responded: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Interview: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Offer: "bg-green-500/15 text-green-400 border-green-500/20",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  Discarded: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  SKIP: "bg-zinc-700/30 text-zinc-500 border-zinc-600/20",
};

const statusDotColors: Record<BadgeStatus, string> = {
  Evaluated: "bg-blue-400",
  Applied: "bg-cyan-400",
  Responded: "bg-purple-400",
  Interview: "bg-amber-400",
  Offer: "bg-green-400",
  Rejected: "bg-red-400",
  Discarded: "bg-zinc-400",
  SKIP: "bg-zinc-500",
};

export function Badge({ status, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5
        text-xs font-medium
        rounded-md border
        ${statusStyles[status]}
        ${className}
      `}
      {...props}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${statusDotColors[status]}`}
      />
      {status}
    </span>
  );
}
