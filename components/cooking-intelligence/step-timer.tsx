"use client";

import { useEffect, useReducer } from "react";
import { Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTimerState, formatTimer, timerReducer } from "@/lib/cooking-timer";

export function StepTimer({ minutes }: { minutes: number }) {
  const [state, dispatch] = useReducer(timerReducer, minutes, createTimerState);

  useEffect(() => {
    if (state.status !== "running") return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [state.status]);

  return (
    <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Step timer · {state.status}
      </p>
      <p className="my-3 font-mono text-5xl font-black tracking-tight">
        {formatTimer(state.remainingSeconds)}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {state.status === "running" ? (
          <Button variant="outline" onClick={() => dispatch({ type: "pause" })}>
            <Pause /> Pause
          </Button>
        ) : (
          <Button onClick={() => dispatch({ type: state.status === "paused" ? "resume" : "start" })}>
            <Play /> {state.status === "paused" ? "Resume" : "Start timer"}
          </Button>
        )}
        <Button variant="outline" onClick={() => dispatch({ type: "reset" })}>
          <RotateCcw /> Reset
        </Button>
        <Button variant="outline" onClick={() => dispatch({ type: "extend", seconds: 60 })}>
          <Plus /> 1 min
        </Button>
      </div>
    </div>
  );
}
