"use client";

import { useQuery } from "@tanstack/react-query";
import { BookIcon } from "lucide-react";

import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { Card } from "@/components/ui/card";
import { classApi, type ClassroomResponse } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function StudentClassList() {
  const classes = useQuery({
    queryKey: ["classes", "mine"],
    queryFn: () =>
      classApi.list({ status: "ACTIVE", sort: "createdAt,desc", size: 100 }),
  });
  const content = classes.data?.content ?? [];

  return (
    <div className="space-y-5">
      <PageHeading
        title="Lớp của tôi"
        description="Các lớp bạn đã được duyệt vào học."
      />

      {content.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {content.map((classroom) => (
            <ClassCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      ) : (
        <Card>
          <QueryState
            query={classes}
            isEmpty
            emptyMessage="Bạn chưa tham gia lớp nào."
          />
        </Card>
      )}
    </div>
  );
}

function ClassCard({ classroom }: { classroom: ClassroomResponse }) {
  const { name, description, createdAt } = classroom;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <span className="flex size-10 items-center justify-center rounded-[10px] bg-info text-primary">
        <BookIcon className="size-5" />
      </span>
      <div className="space-y-1.5">
        <h2 className="truncate text-base font-semibold">{name}</h2>
        <p className="text-sm text-muted-foreground">
          {description ?? "Chưa có mô tả"}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Tạo ngày {formatDate(createdAt)}
      </p>
    </Card>
  );
}
