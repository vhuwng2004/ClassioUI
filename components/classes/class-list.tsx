"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowDownWideNarrowIcon,
  EllipsisIcon,
  EyeIcon,
  ListFilterIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Can } from "@/components/auth/guards";
import { SearchInput } from "@/components/form/search-input";
import { SelectMenu } from "@/components/form/select-menu";
import { PageHeading } from "@/components/layout/page-heading";
import { Pagination } from "@/components/layout/pagination";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataRow, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounced } from "@/hooks/use-debounced";
import { usePagination } from "@/hooks/use-pagination";
import { classApi, type ClassroomResponse, type ClassStatus } from "@/lib/api";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { ArchiveClassDialog } from "./archive-class-dialog";
import { ClassFormDialog } from "./class-form-dialog";
import { ClassStatusBadge } from "./class-status-badge";
import { JoinCode } from "./join-code";

type StatusFilter = ClassStatus | "ALL";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
  { value: "ALL", label: "Tất cả" },
];

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Mới nhất" },
  { value: "createdAt,asc", label: "Cũ nhất" },
  { value: "name,asc", label: "Tên A–Z" },
];

export function ClassList() {
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const { page, size, setPage, setSize } = usePagination();
  const q = useDebounced(search.trim());

  const classes = useQuery({
    queryKey: ["classes", { q, status, sort, page, size }],
    queryFn: () =>
      classApi.list({
        q,
        status: status === "ALL" ? undefined : status,
        sort,
        page,
        size,
      }),
    placeholderData: keepPreviousData,
  });

  const handleSearchChange = (next: string) => {
    setSearch(next);
    setPage(0);
  };

  const handleStatusChange = (next: StatusFilter) => {
    setStatus(next);
    setPage(0);
  };

  const handleSortChange = (next: string) => {
    setSort(next);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Lớp học"
        action={
          <Can permission={PERMISSIONS.CLASS_CREATE}>
            <Button onClick={() => setCreating(true)}>
              <PlusIcon />
              Tạo lớp mới
            </Button>
          </Can>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            label="Tìm theo tên lớp"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          <SelectMenu
            label="Trạng thái lớp"
            icon={ListFilterIcon}
            align="start"
            options={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusChange}
          />
        </div>
        <SelectMenu
          label="Sắp xếp"
          icon={ArrowDownWideNarrowIcon}
          options={SORT_OPTIONS}
          value={sort}
          onChange={handleSortChange}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          head={
            <>
              <th className="pr-4 pl-5">Tên lớp</th>
              <th className="w-39 pr-4">Trạng thái</th>
              <th className="w-46.5 pr-4">Mã tham gia</th>
              <th className="w-31">Ngày tạo</th>
              <th className="w-13.5" />
            </>
          }
        >
          {classes.data?.content.map((classroom) => (
            <ClassRow key={classroom.id} classroom={classroom} />
          ))}
        </DataTable>
        <QueryState
          query={classes}
          isEmpty={classes.data?.content.length === 0}
          emptyMessage={q ? "Không tìm thấy lớp phù hợp." : "Chưa có lớp nào."}
        />
        {classes.data && (
          <Pagination
            data={classes.data}
            onPageChange={setPage}
            onPageSizeChange={setSize}
          />
        )}
      </Card>

      <ClassFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function ClassRow({ classroom }: { classroom: ClassroomResponse }) {
  const { id, name, description, status, joinCode, createdAt } = classroom;
  const [dialog, setDialog] = useState<"edit" | "archive" | null>(null);
  const detailPath = `/staff/classes/${id}`;

  return (
    <DataRow>
      <td className="pr-4 pl-5">
        <Link
          href={detailPath}
          className="block truncate rounded font-semibold focus-ring hover:text-primary"
        >
          {name}
        </Link>
        <p
          className={cn(
            "truncate text-xs",
            description ? "text-muted-foreground" : "text-placeholder",
          )}
        >
          {description ?? "Chưa có mô tả"}
        </p>
      </td>
      <td className="pr-4">
        <ClassStatusBadge status={status} />
      </td>
      <td className="pr-4">{joinCode ? <JoinCode code={joinCode} /> : "—"}</td>
      <td className="text-muted-foreground">{formatDate(createdAt)}</td>
      <td>
        {/* modal={false}: menu đóng lại trước khi mở hộp thoại, tránh khoá con trỏ. */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Thao tác với lớp ${name}`}
              className="text-muted-foreground"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={detailPath}>
                <EyeIcon />
                Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <Can permission={PERMISSIONS.CLASS_EDIT} classroom={classroom}>
              <DropdownMenuItem onSelect={() => setDialog("edit")}>
                <PencilIcon />
                Sửa thông tin
              </DropdownMenuItem>
            </Can>
            <Can permission={PERMISSIONS.CLASS_ARCHIVE} classroom={classroom}>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDialog("archive")}
              >
                <ArchiveIcon />
                Lưu trữ
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
        <ClassFormDialog
          open={dialog === "edit"}
          onOpenChange={(open) => !open && setDialog(null)}
          classroom={classroom}
        />
        <ArchiveClassDialog
          open={dialog === "archive"}
          onOpenChange={(open) => !open && setDialog(null)}
          classroom={classroom}
        />
      </td>
    </DataRow>
  );
}
