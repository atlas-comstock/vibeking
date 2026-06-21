export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "FEATURE_DISABLED"
  | "INVITE_REQUIRED"
  | "INVITE_INVALID"
  | "WISH_NOT_FOUND"
  | "WISH_ALREADY_CLAIMED"
  | "CLAIM_NOT_FOUND"
  | "NOT_CLAIM_OWNER"
  | "INVALID_STATUS_TRANSITION"
  | "FIELD_NOT_EDITABLE"
  | "STATUS_CHANGE_NOT_ALLOWED"
  | "WISH_NOT_OPEN"
  | "INVALID_CURSOR"
  | "KEY_LIMIT_EXCEEDED"
  | "SLUG_BLOCKED"
  | "DELIVERABLE_NOT_FOUND"
  | "CLAIM_REQUIRED"
  | "INVALID_TARGET"
  | "UPLOAD_INCOMPLETE";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(code: ErrorCode, message: string, requestId?: string) {
  return {
    error: {
      code,
      message,
      ...(requestId ? { requestId } : {}),
    },
  };
}