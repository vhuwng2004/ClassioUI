"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Pagination } from "@/components/layout/pagination";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataRow, DataTable } from "@/components/ui/data-table";
import { useRefreshClasses } from "@/hooks/use-classroom";
import { PAGE_SIZE_OPTIONS, usePagination } from "@/hooks/use-pagination";
import { ApiError, memberApi, toastApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import { MemberIdentity } from "./member-identity";

const ROW_CLASS_NAME = "h-16.25 last:h-16.25";

interface ClassRequestsTabProps {
  classId: number;
  /** false khi lớp đã lưu trữ: vẫn xem được nhưng khoá mọi thao tác ghi. */
  editable: boolean;
}

export function ClassRequestsTab({ classId, editable }: ClassRequestsTabProps) {
  const refreshClasses = useRefreshClasses();
  const { page, size, setPage, setSize } = usePagination();

  const requests = useQuery({
    queryKey: ["classes", classId, "join-requests", { page, size }],
    queryFn: () =>
      memberApi.joinRequests(classId, {
        sort: "joinedAt,asc",
        page,
        size,
      }),
    placeholderData: keepPreviousData,
  });

  const decide = useMutation({
    mutationFn: ({ userId, approve }: { userId: number; approve: boolean }) =>
      approve
        ? memberApi.approve(classId, userId)
        : memberApi.reject(classId, userId),
    onSuccess: (_, { approve }) => {
      toast.success(approve ? "Đã duyệt học sinh." : "Đã từ chối yêu cầu.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "MEMBERSHIP_CONFLICT") {
        toast.info("Trạng thái thành viên đã thay đổi", {
          description:
            "Một giáo viên khác vừa xử lý yêu cầu này. Danh sách đã được làm mới.",
        });
      } else {
        toastApiError(error);
      }
    },
    onSettled: async () => {
      if (requests.data?.content.length === 1 && page > 0) setPage(page - 1);
      await refreshClasses();
    },
  });

  return (
    <Card className="overflow-hidden">
      <DataTable
        head={
          <>
            <th className="pr-4 pl-5">Học sinh</th>
            <th className="w-54 pr-4">Thời gian gửi</th>
            <th className="w-56" />
          </>
        }
      >
        {requests.data?.content.map((request) => (
          <DataRow key={request.userId} className={ROW_CLASS_NAME}>
            <td className="pr-4 pl-5">
              <MemberIdentity
                fullName={request.fullName}
                email={request.email}
              />
            </td>
            <td className="pr-4 text-muted-foreground">
              Gửi lúc {formatDateTime(request.joinedAt)}
            </td>
            <td className="pr-7">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!editable || decide.isPending}
                  onClick={() =>
                    decide.mutate({ userId: request.userId, approve: false })
                  }
                >
                  <XIcon className="size-4" />
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  disabled={!editable || decide.isPending}
                  onClick={() =>
                    decide.mutate({ userId: request.userId, approve: true })
                  }
                >
                  <CheckIcon className="size-4" />
                  Duyệt
                </Button>
              </div>
            </td>
          </DataRow>
        ))}
      </DataTable>
      <QueryState
        query={requests}
        isEmpty={requests.data?.content.length === 0}
        emptyMessage="Chưa có yêu cầu tham gia nào."
      />
      {requests.data && requests.data.totalElements > PAGE_SIZE_OPTIONS[0] && (
        <Pagination
          data={requests.data}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      )}
    </Card>
  );
}
