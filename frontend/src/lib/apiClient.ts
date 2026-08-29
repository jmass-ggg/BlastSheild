import type {
  AnalysisResponse,
  AnalyzeRequest,
  ApiErrorBody,
  ApprovalRequest,
  ApprovalTransitionResponse,
  ExecutionResponse,
  StaleExecutionResponse,
} from '../types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const API_PREFIX = '/api/v1';

const UNREACHABLE = `Cannot reach the BlastShield API at ${API_BASE_URL}. Is the backend running?`;

/** A structured backend failure — carries the `code` the API handlers emit. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** True when the executor refused because the report no longer matches prod. */
export function isStale(
  result: ExecutionResponse | StaleExecutionResponse
): result is StaleExecutionResponse {
  return result.status === 'STALE';
}

async function readError(response: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> = {};
  try {
    body = (await response.json()) as Partial<ApiErrorBody>;
  } catch {
    // Non-JSON error page (proxy, gateway, crash) — fall through to defaults.
  }
  return new ApiError(
    body.code ?? 'HTTP_ERROR',
    body.message ?? `Request failed with status ${response.status}.`,
    response.status
  );
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', UNREACHABLE, 0);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init);
  if (!response.ok) {
    throw await readError(response);
  }
  return (await response.json()) as T;
}

export function analyze(payload: AnalyzeRequest): Promise<AnalysisResponse> {
  return request<AnalysisResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ source: 'ui', ...payload }),
  });
}

export function listAnalyses(limit = 100): Promise<AnalysisResponse[]> {
  return request<AnalysisResponse[]>(`/analyses?limit=${limit}`);
}

export function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return request<AnalysisResponse>(`/analyses/${analysisId}`);
}

export function approveAnalysis(
  analysisId: string,
  payload: ApprovalRequest = {}
): Promise<ApprovalTransitionResponse> {
  return request<ApprovalTransitionResponse>(`/analyses/${analysisId}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function rejectAnalysis(
  analysisId: string,
  payload: ApprovalRequest = {}
): Promise<ApprovalTransitionResponse> {
  return request<ApprovalTransitionResponse>(`/analyses/${analysisId}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * The executor answers 409 with a stale-report body rather than an error body,
 * so that one case is unwrapped here instead of thrown.
 */
export async function executeAnalysis(
  analysisId: string
): Promise<ExecutionResponse | StaleExecutionResponse> {
  const response = await send(`/analyses/${analysisId}/execute`, {
    method: 'POST',
  });
  if (response.status === 409) {
    return (await response.json()) as StaleExecutionResponse;
  }
  if (!response.ok) {
    throw await readError(response);
  }
  return (await response.json()) as ExecutionResponse;
}

export function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}
