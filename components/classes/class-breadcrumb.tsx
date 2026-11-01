"use client";

import Link from "next/link";

import { useClassroom } from "@/hooks/use-classroom";

export function ClassBreadcrumb({ classId }: { classId: number }) {
  const classroom = useClassroom(classId);

  return (
    <nav aria-label="Đường dẫn" className="flex items-center gap-2">
      <Link
        href="/staff"
        className="font-normal text-muted-foreground hover:text-foreground"
      >
        Lớp học
      </Link>
      <span aria-hidden className="font-normal text-input">
        /
      </span>
      <span className="truncate">{classroom.data?.name}</span>
    </nav>
  );
}
