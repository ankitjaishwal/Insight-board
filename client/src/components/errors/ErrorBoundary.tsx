import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  fallbackMessage?: string;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {this.props.fallbackMessage ?? "Something went wrong. Please try again."}
        </div>
      );
    }

    return this.props.children;
  }
}
