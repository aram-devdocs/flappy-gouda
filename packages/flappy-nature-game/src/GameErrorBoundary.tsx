import { createLogger } from '@repo/engine';
import { ErrorFallback } from '@repo/ui';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

const log = createLogger('GameErrorBoundary');

/** Props for {@link GameErrorBoundary}. */
interface Props {
  children: ReactNode;
  onReset?: () => void;
}

/** Internal state tracked by {@link GameErrorBoundary}. */
interface State {
  hasError: boolean;
  errorMessage: string;
}

/** React error boundary that catches rendering errors and shows an ErrorFallback. */
export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error('Uncaught rendering error', {
      error: error.message,
      componentStack: info.componentStack ?? '',
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.errorMessage} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
