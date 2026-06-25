import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

const isDevelopment = import.meta.env.DEV;

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="error-screen">
        <section className="error-card">
          <span className="eyebrow">Podo360 Admin</span>
          <h1>Não foi possível carregar o painel administrativo.</h1>
          <p>
            Atualize a página. Se o problema continuar, verifique as variáveis de ambiente e o console do navegador.
          </p>

          {isDevelopment && (
            <pre>
              {this.state.error.message}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </section>
      </main>
    );
  }
}
