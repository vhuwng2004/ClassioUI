import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/** Mọi dữ liệu người dùng đều nằm dưới khoá `["users", …]`. */
export function useRefreshUsers() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    [queryClient],
  );
}
