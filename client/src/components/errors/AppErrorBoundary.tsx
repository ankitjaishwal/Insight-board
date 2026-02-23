// src/errors/AppErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppErrorFallback } from "./AppErrorFallback";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <AppErrorFallback />;
    }

    return this.props.children;
  }
}
