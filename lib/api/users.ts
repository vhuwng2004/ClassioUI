import { api, json, query } from "./client";
import type {
  AssignableUserResponse,
  CreatedUserResponse,
  CreateUserRequest,
  PageParams,
  PageResponse,
  TemporaryPasswordResponse,
  UserAdminResponse,
  UserImportResponse,
  UserRole,
  UserStatus,
} from "./types";

export const userApi = {
  list: (
    params: PageParams & {
      keyword?: string;
      role?: UserRole;
      status?: UserStatus;
    } = {},
  ) => api<PageResponse<UserAdminResponse>>(`/users${query({ ...params })}`),
  assignable: (
    params: PageParams & { keyword?: string; role?: UserRole } = {},
  ) =>
    api<PageResponse<AssignableUserResponse>>(
      `/users/assignable${query({ ...params })}`,
    ),
  create: (body: CreateUserRequest) =>
    api<CreatedUserResponse>("/users", { method: "POST", ...json(body) }),
  changeRole: (userId: number, role: UserRole) =>
    api<UserAdminResponse>(`/users/${userId}/role`, {
      method: "PATCH",
      ...json({ role }),
    }),
  lock: (userId: number) =>
    api<UserAdminResponse>(`/users/${userId}/lock`, { method: "POST" }),
  unlock: (userId: number) =>
    api<UserAdminResponse>(`/users/${userId}/unlock`, { method: "POST" }),
  resetPassword: (userId: number) =>
    api<TemporaryPasswordResponse>(`/users/${userId}/reset-password`, {
      method: "POST",
    }),
  importStudents: (file: File, dryRun: boolean) => {
    const body = new FormData();
    body.append("file", file);
    return api<UserImportResponse>(
      `/users/import${query({ dryRun: String(dryRun) })}`,
      { method: "POST", body },
    );
  },
};
