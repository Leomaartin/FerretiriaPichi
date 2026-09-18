import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem("carrito");
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              ¡Ups! Algo salió mal
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#4b5563",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              Ocurrió un inconveniente inesperado al mostrar esta sección. Podés
              intentar recargar la página o reiniciar tu carrito.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  marginTop: "16px",
                  marginBottom: "16px",
                  padding: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  color: "#991b1b",
                  wordBreak: "break-word",
                  fontFamily: "monospace",
                }}
              >
                <strong>Detalle técnico:</strong> {this.state.error.message}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 20px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  backgroundColor: "#a3e635",
                  color: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Recargar página
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "12px 20px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Vaciar Carrito e ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
