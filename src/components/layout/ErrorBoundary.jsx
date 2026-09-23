import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/** Catches render errors (and failed lazy-loaded chunks) for a page. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  componentDidCatch(error, info) {
    // Hook for an error-reporting service (e.g. Sentry) later.
    console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page">
        <div className="empty" role="alert">
          <AlertTriangle aria-hidden="true" />
          <h3>Something went wrong. Please try again.</h3>
          <button type="button" className="btn btn-primary" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      </div>
    );
  }
}
