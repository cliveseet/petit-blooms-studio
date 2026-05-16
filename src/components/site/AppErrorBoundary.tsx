import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  failed: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="container-page flex min-h-[64vh] items-center justify-center py-20">
        <section className="max-w-md rounded-2xl border hairline bg-shell p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Something went wrong</p>
          <h1 className="mt-3 font-display text-3xl text-loam">This page did not load.</h1>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            Please try again. If the issue persists, return home and contact the studio.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={() => this.setState({ failed: false })}>
              Try again
            </Button>
            <Button asChild type="button" variant="outline">
              <a href="/">Go home</a>
            </Button>
          </div>
        </section>
      </div>
    );
  }
}
