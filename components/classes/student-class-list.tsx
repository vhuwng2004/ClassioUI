"use client";

import { useQuery } from "@tanstack/react-query";
import { BookIcon } from "lucide-react";

import { PageHeading } from "@/components/layout/page-heading";
import { QueryState } from "@/components/layout/query-state";
import { Card } from "@/components/ui/card";
import { classApi, type ClassroomResponse } from "@/lib/api";

export function StudentClassList() {
  const classes = useQuery({
    queryKey: ["classes", "mine"],
    queryFn: () =>
      classApi.list({ status: "ACTIVE", sort: "createdAt,desc", size: 100 }),
  });
  const content = classes.data?.content ?? [];

  return (
    <div className="space-y-5">
      <PageHeading title="Lớp của tôi" />

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
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-info text-primary">
        <BookIcon className="size-5" />
      </span>
      <h2 className="min-w-0 truncate text-base font-semibold">
        {classroom.name}
      </h2>
    </Card>
  );
}
