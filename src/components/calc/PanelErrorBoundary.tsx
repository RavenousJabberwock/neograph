/**
 * ErrorBoundary — minimal class boundary so a crash inside one panel doesn't
 * nuke the entire workstation. Each high-risk panel (CAS, IDE, Plot3D, etc.)
 * is wrapped in this in src/routes/index.tsx.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; label: string }
interface State { error: Error | null }

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[panel:${this.props.label}] crashed:`, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 h-full overflow-auto text-[0.75rem] font-mono space-y-2">
          <div className="neon-text-amber tracking-widest text-[0.6rem]">PANEL CRASH · {this.props.label}</div>
          <pre className="text-destructive whitespace-pre-wrap break-all">{this.state.error.message}</pre>
          <pre className="text-muted-foreground whitespace-pre-wrap break-all text-[0.65rem] max-h-40 overflow-auto">{this.state.error.stack ?? ""}</pre>
          <button className="pill-btn" data-active onClick={this.reset}>RETRY</button>
        </div>
      );
    }
    return this.props.children;
  }
}
