import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { classApi } from "@/lib/api";

export function useClassroom(classId: number) {
  return useQuery({
    queryKey: ["classes", classId],
    queryFn: () => classApi.get(classId),
  });
}

/** Mọi dữ liệu lớp và thành viên đều nằm dưới khoá `["classes", …]`. */
export function useRefreshClasses() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
    [queryClient],
  );
}
