import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside tab boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="error-boundary-container"
          style={{
            padding: "24px",
            border: "2px solid #e11d48",
            background: "rgba(225, 29, 72, 0.03)",
            borderRadius: "12px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            margin: "16px 0",
            fontFamily: "var(--font-sans, inherit)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle className="text-red" style={{ color: "#e11d48" }} size={24} />
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
              {this.props.fallbackTitle || "Interface Rendering Error"}
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
            An unexpected error occurred while loading this interface tab. This may be due to local simulation parameters or connection timeout with the RPC node.
          </p>
          <div 
            style={{ 
              fontSize: "11px", 
              fontFamily: "var(--font-mono, monospace)", 
              padding: "10px", 
              background: "rgba(0,0,0,0.3)", 
              borderRadius: "6px",
              border: "1px solid var(--hairline)"
            }}
          >
            Error: {this.state.error?.message || "Unknown error occurred"}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: "8px 16px",
              background: "#e11d48",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "fit-content",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <RefreshCw size={14} />
            <span>Reset Interface Tab</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
