import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapStateToStatus(
  state: string
): "running" | "stopped" | "suspended" | "creating" | "error" {
  if (!state) return "error";
  state = state.toLowerCase();

  if (state.includes("running")) return "running";
  if (
    state.includes("shut off") ||
    state.includes("shutoff") ||
    state === "stopped"
  )
    return "stopped";
  if (
    state.includes("paused") ||
    state.includes("suspended") ||
    state === "suspended"
  )
    return "suspended";
  if (state.includes("creating") || state.includes("building"))
    return "creating";
  return "error";
}
