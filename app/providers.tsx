"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api";
import { AuthProvider } from "@/lib/auth/auth-provider";

function createQueryClient(onForbidden: () => void) {
  return new QueryClient({
    // Lưới an toàn khi quyền ở FE lệch BE: không đọc được dữ liệu thì trang không còn dùng được.
    // Mutation vẫn báo tại chỗ vì 403 của chúng có thể là lỗi nghiệp vụ, ví dụ TEACHER phân công TEACHER.
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ApiError && error.code === "ACCESS_DENIED")
          onForbidden();
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Lỗi 4xx là kết quả nghiệp vụ, thử lại không đổi được gì.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) &&
          failureCount < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(() =>
    createQueryClient(() => router.replace("/forbidden")),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
