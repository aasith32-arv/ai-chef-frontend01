"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CookingTimerProps = {
  defaultMinutes?: number;
  className?: string;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CookingTimer({
  defaultMinutes = 20,
  className,
}: CookingTimerProps) {
  const initial = defaultMinutes * 60;
  const [timer, setTimer] = useState({ seconds: initial, running: false });

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => {
      setTimer((prev) => {
        if (!prev.running) return prev;
        if (prev.seconds <= 1) {
          return { seconds: 0, running: false };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const finished = timer.seconds === 0;

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/80 bg-card p-5 shadow-premium",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Timer className="size-4 text-primary" />
        Cooking timer
      </div>
      <p
        className={cn(
          "font-mono text-4xl font-extrabold tracking-tight tabular-nums",
          finished && "text-destructive"
        )}
        aria-live="polite"
      >
        {formatTime(timer.seconds)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => {
            if (finished) {
              setTimer({ seconds: initial, running: true });
              return;
            }
            setTimer((prev) => ({ ...prev, running: !prev.running }));
          }}
        >
          {timer.running ? (
            <>
              <Pause className="size-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="size-3.5" /> {finished ? "Restart" : "Start"}
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setTimer({ seconds: initial, running: false })}
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
        {[10, 15, 20, 30].map((mins) => (
          <Button
            key={mins}
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => setTimer({ seconds: mins * 60, running: false })}
          >
            {mins}m
          </Button>
        ))}
      </div>
    </div>
  );
}
