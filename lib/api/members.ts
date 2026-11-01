import { api, json, query } from "./client";
import type {
  ClassMemberResponse,
  ClassMemberStatus,
  MembershipResponse,
  PageParams,
  PageResponse,
  UserRole,
} from "./types";

export const memberApi = {
  join: (joinCode: string) =>
    api<MembershipResponse>("/classes/join", {
      method: "POST",
      ...json({ joinCode }),
    }),
  myMembership: (classId: number) =>
    api<MembershipResponse>(`/classes/${classId}/membership/me`),
  leave: (classId: number) =>
    api<void>(`/classes/${classId}/membership/me`, { method: "DELETE" }),
  list: (
    classId: number,
    params: PageParams & { role?: UserRole; status?: ClassMemberStatus } = {},
  ) =>
    api<PageResponse<ClassMemberResponse>>(
      `/classes/${classId}/members${query({ ...params })}`,
    ),
  addStudent: (classId: number, email: string) =>
    api<MembershipResponse>(`/classes/${classId}/students`, {
      method: "POST",
      ...json({ email: email.trim() }),
    }),
  removeStudent: (classId: number, userId: number) =>
    api<void>(`/classes/${classId}/students/${userId}`, { method: "DELETE" }),
  joinRequests: (classId: number, params: PageParams = {}) =>
    api<PageResponse<ClassMemberResponse>>(
      `/classes/${classId}/join-requests${query({ ...params })}`,
    ),
  approve: (classId: number, userId: number) =>
    api<MembershipResponse>(
      `/classes/${classId}/join-requests/${userId}/approve`,
      {
        method: "POST",
      },
    ),
  reject: (classId: number, userId: number) =>
    api<MembershipResponse>(
      `/classes/${classId}/join-requests/${userId}/reject`,
      {
        method: "POST",
      },
    ),
  assignStaff: (classId: number, userId: number) =>
    api<MembershipResponse>(`/classes/${classId}/staff/${userId}`, {
      method: "PUT",
    }),
  unassignStaff: (classId: number, userId: number) =>
    api<void>(`/classes/${classId}/staff/${userId}`, { method: "DELETE" }),
};
