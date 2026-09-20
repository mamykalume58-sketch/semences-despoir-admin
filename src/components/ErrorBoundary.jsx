import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erreur capturée par ErrorBoundary :', error, info);
  }

  render() {
    if (this.state.error) {
      const err = this.state.error;
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: 24,
            background: '#FDECEA',
            color: '#7A1F1A',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: 13,
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Erreur dans l’application</h2>
          <p>{String(err && err.message)}</p>
          <pre>{err && err.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
