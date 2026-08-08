import { describe, expect, it } from "vitest";
import { createTimerState, formatTimer, timerReducer } from "@/lib/cooking-timer";

describe("cooking step timer", () => {
  it("supports start, pause, resume and ticking", () => {
    let state = createTimerState(1);
    state = timerReducer(state, { type: "start" });
    state = timerReducer(state, { type: "tick" });
    expect(state.remainingSeconds).toBe(59);
    state = timerReducer(state, { type: "pause" });
    expect(timerReducer(state, { type: "tick" }).remainingSeconds).toBe(59);
    state = timerReducer(state, { type: "resume" });
    expect(state.status).toBe("running");
  });

  it("supports reset, extend, complete and skip", () => {
    let state = createTimerState(2);
    state = timerReducer(state, { type: "extend", seconds: 60 });
    expect(state.remainingSeconds).toBe(180);
    state = timerReducer(state, { type: "complete" });
    expect(state.status).toBe("completed");
    state = timerReducer(state, { type: "reset" });
    expect(state.remainingSeconds).toBe(180);
    state = timerReducer(state, { type: "skip" });
    expect(state.status).toBe("skipped");
  });

  it("formats remaining time", () => {
    expect(formatTimer(125)).toBe("02:05");
  });
});
