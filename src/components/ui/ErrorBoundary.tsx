"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message ?? "Lỗi không xác định"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
