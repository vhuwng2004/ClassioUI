"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  ApiError,
  authApi,
  getErrorMessage,
  SESSION_EXPIRED_MESSAGE,
  setHasSession,
  setSessionListener,
  type ChangePasswordRequest,
  type ClassroomResponse,
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
  type UserSummary,
} from "@/lib/api";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

type AuthState =
  | { status: "loading"; user: null; signedOut: false }
  | { status: "authenticated"; user: UserSummary; signedOut: false }
  /** `signedOut`: người dùng tự đăng xuất, không giữ `?next=` khi về trang đăng nhập. */
  | { status: "unauthenticated"; user: null; signedOut: boolean };

interface AuthContextValue {
  state: AuthState;
  can: (
    permission: Permission,
    classroom?: Pick<ClassroomResponse, "status">,
  ) => boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: UpdateProfileRequest) => Promise<void>;
  changePassword: (body: ChangePasswordRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
    signedOut: false,
  });
  const restoreStarted = useRef(false);

  const openSession = useCallback((user: UserSummary) => {
    setHasSession(true);
    setState({ status: "authenticated", user, signedOut: false });
  }, []);

  const closeSession = useCallback(
    (signedOut: boolean) => {
      setHasSession(false);
      queryClient.clear();
      setState({ status: "unauthenticated", user: null, signedOut });
    },
    [queryClient],
  );

  useEffect(() => {
    setSessionListener({
      onRefreshed: (session) => openSession(session.user),
      onExpired: () => {
        closeSession(false);
        // Cùng id để QueryState không hiện trùng khi danh sách lỗi theo.
        toast.error(SESSION_EXPIRED_MESSAGE, { id: SESSION_EXPIRED_MESSAGE });
      },
    });
    return () => setSessionListener(null);
  }, [closeSession, openSession]);

  useEffect(() => {
    // React StrictMode chạy effect 2 lần; chỉ cần khôi phục phiên một lần.
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    // Cookie access token còn hạn thì không cần refresh; `api()` chỉ refresh khi nhận 401.
    authApi
      .me()
      .then(openSession)
      .catch((error: unknown) => {
        closeSession(false);
        // 401 AUTHENTICATION_FAILED nghĩa là chưa đăng nhập, không phải lỗi.
        const notLoggedIn =
          error instanceof ApiError && error.code === "AUTHENTICATION_FAILED";
        if (!notLoggedIn) toast.error(getErrorMessage(error));
      });
  }, [closeSession, openSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      can: (permission, classroom) =>
        hasPermission(state.user?.role, permission, classroom),
      login: async (body) => openSession((await authApi.login(body)).user),
      register: async (body) =>
        openSession((await authApi.register(body)).user),
      logout: async () => {
        await authApi.logout();
        closeSession(true);
      },
      updateProfile: async (body) =>
        openSession(await authApi.updateProfile(body)),
      changePassword: async (body) => {
        await authApi.changePassword(body);
        closeSession(true);
      },
    }),
    [closeSession, openSession, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return context;
}
