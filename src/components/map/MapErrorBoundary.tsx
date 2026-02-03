import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Map failed to load:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`flex items-center justify-center bg-muted rounded-xl ${this.props.className || ""}`}
          style={{ minHeight: "300px" }}
        >
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">Map failed to load</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
