export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PageInfo {
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pageInfo: PageInfo;
}

export interface ValidationErrorItem {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: ValidationErrorItem[];
}

export type ApiEnvelope<T> = SuccessResponse<T> | ErrorResponse;
export type PaginatedEnvelope<T> = PaginatedResponse<T> | ErrorResponse;