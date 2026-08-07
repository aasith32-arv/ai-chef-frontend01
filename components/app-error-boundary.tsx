"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Root client error boundary. Optional Sentry: set NEXT_PUBLIC_SENTRY_DSN and
 * install `@sentry/browser` if you want automatic reporting.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-premium flex min-h-[40vh] flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            An unexpected client error occurred. Try reloading the page.
          </p>
          <Button
            className="mt-6 rounded-full"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
