import { CheckIcon } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";

const HIGHLIGHTS = [
  "Tạo lớp và chia sẻ mã tham gia",
  "Duyệt yêu cầu, quản lý học sinh",
  "Phân công giáo viên và trợ giảng",
];

export function AuthBrandPanel() {
  return (
    <aside className="sticky top-0 hidden h-svh flex-col justify-between bg-brand-panel p-12 text-white lg:flex">
      <div className="text-white [&_svg]:text-brand-panel">
        <BrandLogo />
      </div>
      <div>
        <p className="text-4xl leading-11 font-bold tracking-[-0.8px]">
          Quản lý trung tâm dạy thêm gọn gàng hơn.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-brand-panel-muted">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <CheckIcon className="size-4.5 shrink-0 text-brand-panel-icon" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-brand-panel-subtle">© 2026 Classio</p>
    </aside>
  );
}
