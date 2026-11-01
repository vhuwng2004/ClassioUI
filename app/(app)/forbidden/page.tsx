import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
      <Button asChild className="mt-6">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </>
  );
}
