import { api, json, publicApi } from "./client";
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserSummary,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "./types";

// `/auth/refresh` không có ở đây: chỉ `api()` trong client.ts được gọi endpoint này, sau khi nhận 401.
export const authApi = {
  register: (body: RegisterRequest) =>
    publicApi<AuthResponse>("/auth/register", {
      method: "POST",
      ...json({ ...body, email: body.email.trim() }),
    }),
  login: (body: LoginRequest) =>
    publicApi<AuthResponse>("/auth/login", {
      method: "POST",
      ...json({ ...body, email: body.email.trim() }),
    }),
  logout: () => publicApi<void>("/auth/logout", { method: "POST" }),
  me: () => api<UserSummary>("/auth/me"),
  updateProfile: (body: UpdateProfileRequest) =>
    api<UserSummary>("/auth/me", { method: "PUT", ...json(body) }),
  changePassword: (body: ChangePasswordRequest) =>
    api<MessageResponse>("/auth/change-password", {
      method: "POST",
      ...json(body),
    }),
  forgotPassword: (email: string) =>
    publicApi<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      ...json({ email: email.trim() }),
    }),
  verifyOtp: (body: VerifyOtpRequest) =>
    publicApi<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      ...json({ ...body, email: body.email.trim() }),
    }),
  resetPassword: (body: ResetPasswordRequest) =>
    publicApi<MessageResponse>("/auth/reset-password", {
      method: "POST",
      ...json({ ...body, email: body.email.trim() }),
    }),
};
