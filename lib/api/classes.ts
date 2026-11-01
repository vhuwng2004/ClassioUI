import { api, json, query } from "./client";
import type {
  ClassroomResponse,
  ClassStatus,
  CreateClassRequest,
  PageParams,
  PageResponse,
  UpdateClassRequest,
} from "./types";

export const classApi = {
  create: (body: CreateClassRequest) =>
    api<ClassroomResponse>("/classes", { method: "POST", ...json(body) }),
  list: (params: PageParams & { status?: ClassStatus; q?: string } = {}) =>
    api<PageResponse<ClassroomResponse>>(`/classes${query({ ...params })}`),
  get: (classId: number) => api<ClassroomResponse>(`/classes/${classId}`),
  update: (classId: number, body: UpdateClassRequest) =>
    api<ClassroomResponse>(`/classes/${classId}`, {
      method: "PATCH",
      ...json(body),
    }),
  archive: (classId: number) =>
    api<void>(`/classes/${classId}`, { method: "DELETE" }),
  approve: (classId: number) =>
    api<ClassroomResponse>(`/classes/${classId}/approve`, { method: "POST" }),
  restore: (classId: number) =>
    api<ClassroomResponse>(`/classes/${classId}/restore`, { method: "POST" }),
  rotateJoinCode: (classId: number) =>
    api<ClassroomResponse>(`/classes/${classId}/join-code/rotate`, {
      method: "POST",
    }),
};
