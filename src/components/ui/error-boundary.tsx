"use client"

import { Component, ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Something went wrong loading the dashboard. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
