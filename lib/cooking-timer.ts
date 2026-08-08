export type TimerStatus = "idle" | "running" | "paused" | "completed" | "skipped";

export type TimerState = {
  initialSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
};

export type TimerAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick" }
  | { type: "reset" }
  | { type: "extend"; seconds: number }
  | { type: "complete" }
  | { type: "skip" };

export function createTimerState(minutes: number): TimerState {
  const seconds = Math.max(0, Math.round(minutes * 60));
  return { initialSeconds: seconds, remainingSeconds: seconds, status: "idle" };
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "start":
    case "resume":
      if (state.remainingSeconds <= 0) return { ...state, status: "completed" };
      return { ...state, status: "running" };
    case "pause":
      return state.status === "running" ? { ...state, status: "paused" } : state;
    case "tick": {
      if (state.status !== "running") return state;
      const remainingSeconds = Math.max(0, state.remainingSeconds - 1);
      return {
        ...state,
        remainingSeconds,
        status: remainingSeconds === 0 ? "completed" : "running",
      };
    }
    case "reset":
      return { ...state, remainingSeconds: state.initialSeconds, status: "idle" };
    case "extend": {
      const seconds = Math.max(0, action.seconds);
      return {
        initialSeconds: state.initialSeconds + seconds,
        remainingSeconds: state.remainingSeconds + seconds,
        status: state.status === "completed" ? "paused" : state.status,
      };
    }
    case "complete":
      return { ...state, remainingSeconds: 0, status: "completed" };
    case "skip":
      return { ...state, status: "skipped" };
    default:
      return state;
  }
}

export function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
