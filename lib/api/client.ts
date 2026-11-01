import type { AuthResponse, ErrorCode, ProblemDetail } from "./types";

const API_BASE = "/api";
const REFRESH_LOCK = "classio-refresh";

interface SessionListener {
  onRefreshed: (session: AuthResponse) => void;
  onExpired: () => void;
}

// Access token nằm trong cookie HttpOnly; ở đây chỉ biết có phiên hay không để báo hết hạn đúng lúc.
let hasSession = false;
let refreshing: Promise<AuthResponse> | null = null;
let sessionListener: SessionListener | null = null;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetail | null,
  ) {
    super(problem?.detail ?? `HTTP ${status}`);
  }

  get code(): ErrorCode | undefined {
    return this.problem?.code;
  }
}

/** Refresh thất bại sau khi API trả 401: phiên đã hết, nơi gọi không cần báo lỗi nữa. */
export class SessionExpiredError extends ApiError {}

export function setHasSession(value: boolean): void {
  hasSession = value;
}

export function setSessionListener(listener: SessionListener | null): void {
  sessionListener = listener;
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get("content-type")?.includes("json") ?? false;
  const body = isJson ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, body as ProblemDetail | null);
  return body as T;
}

function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body != null) headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
}

// Web Locks chỉ có ở secure context; truy cập qua http://<IP LAN> thì không có khoá giữa các tab.
async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  return navigator.locks ? navigator.locks.request(REFRESH_LOCK, task) : task();
}

function refreshSession(): Promise<AuthResponse> {
  refreshing ??= withRefreshLock(async () =>
    parse<AuthResponse>(await send("/auth/refresh", { method: "POST" })),
  )
    .then((session) => {
      hasSession = true;
      sessionListener?.onRefreshed(session);
      return session;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function refreshOrExpire(): Promise<void> {
  try {
    await refreshSession();
  } catch (error) {
    if (error instanceof ApiError && error.code === "AUTHENTICATION_FAILED") {
      // Nhiều request cùng chờ một lần refresh: chỉ báo hết phiên một lần.
      if (hasSession) {
        hasSession = false;
        sessionListener?.onExpired();
      }
      throw new SessionExpiredError(error.status, error.problem);
    }
    throw error;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  canRetry = true,
): Promise<T> {
  const res = await send(path, init);

  try {
    return await parse<T>(res);
  } catch (error) {
    if (
      canRetry &&
      error instanceof ApiError &&
      error.code === "AUTHENTICATION_REQUIRED"
    ) {
      await refreshOrExpire();
      return api<T>(path, init, false);
    }
    throw error;
  }
}

// Các route public của /auth/*: không tự refresh khi nhận 401.
export async function publicApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return parse<T>(await send(path, init));
}

export const json = (body: unknown): RequestInit => ({
  body: JSON.stringify(body),
});

export function query(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.append(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
