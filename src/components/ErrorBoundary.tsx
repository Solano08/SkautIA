"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Skaut IA]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-900">
            <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-900 dark:bg-slate-800">
              <p className="mb-2 text-lg font-bold text-red-600">Error en la interfaz</p>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                {this.state.message || "Ocurrió un error inesperado."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-skaut-blue px-4 py-2 text-sm font-medium text-white"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
