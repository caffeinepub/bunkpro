// React error boundary with auth error classification and session-expired recovery UX
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { classifyAuthError } from '../../lib/authErrorHandling';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Classify the error
      const classification = classifyAuthError(this.state.error);

      // For session-expired errors, show specific recovery message
      if (classification.shouldLogout) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Session Expired
                </CardTitle>
                <CardDescription>
                  {classification.userMessage}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please reload the page to log in again.
                </p>
                <Button onClick={this.handleReload} className="w-full">
                  Reload Page
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      // For other errors, show generic error recovery
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're sorry for the inconvenience. Please try reloading the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
