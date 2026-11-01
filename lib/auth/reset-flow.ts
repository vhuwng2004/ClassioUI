import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "classio.password-reset";

export const RESEND_COOLDOWN_MS = 60_000;

export interface ResetRequest {
  email: string;
  sentAt: number;
}

// Email giữa 2 màn quên mật khẩu → OTP nằm trong sessionStorage, không đưa lên URL.
export function saveResetRequest(email: string): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email, sentAt: Date.now() }),
    );
  } catch {
    // Storage bị chặn: màn OTP sẽ đưa người dùng về nhập lại email.
  }
}

export function clearResetRequest(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Không có storage thì cũng không còn gì để xoá.
  }
}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const subscribeNever = () => () => {};

/** `undefined` khi đang prerender, `null` khi chưa có yêu cầu đặt lại mật khẩu. */
export function useResetRequest(): ResetRequest | null | undefined {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeNever,
    readRaw,
    () => undefined,
  );
  return useMemo(
    () => (typeof raw === "string" ? (JSON.parse(raw) as ResetRequest) : raw),
    [raw],
  );
}
