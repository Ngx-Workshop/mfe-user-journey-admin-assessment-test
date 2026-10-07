import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'Cannot reach the assessment service. Check the connection and try again.';
    if (error.status === 401)
      return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403)
      return 'Administrator access is required.';
    const message = error.error?.message;
    if (
      error.status < 500 &&
      (typeof message === 'string' || Array.isArray(message))
    )
      return Array.isArray(message) ? message.join('. ') : message;
  }
  return fallback;
}
