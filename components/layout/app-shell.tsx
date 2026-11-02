"use client";

import {
  BookIcon,
  CalendarIcon,
  CheckIcon,
  MenuIcon,
  ShieldIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ClassBreadcrumb } from "@/components/classes/class-breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth/auth-provider";
import { PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import { homePathFor } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

import { BrandLogo } from "./brand-logo";
import { UserMenu } from "./user-menu";

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}[] = [
  {
    label: "Lớp học",
    href: "/staff",
    icon: BookIcon,
    permission: PERMISSIONS.STAFF_WORKSPACE_VIEW,
  },
  {
    label: "Lớp học",
    href: "/student",
    icon: BookIcon,
    permission: PERMISSIONS.STUDENT_WORKSPACE_VIEW,
  },
  {
    label: "Người dùng",
    href: "/staff/users",
    icon: UsersIcon,
    permission: PERMISSIONS.USER_VIEW,
  },
];

const UPCOMING_NAV: { label: string; icon: LucideIcon }[] = [
  { label: "Lịch học", icon: CalendarIcon },
  { label: "Điểm danh", icon: CheckIcon },
  { label: "Học phí", icon: ShieldIcon },
];

const PAGE_TITLES: Record<string, string> = {
  "/staff": "Lớp học",
  "/student": "Lớp học",
  "/staff/users": "Người dùng",
  "/profile": "Trang cá nhân",
};

const CLASS_DETAIL_PATH = /^\/staff\/classes\/(\d+)$/;

/** Mốc `lg`: từ đây sidebar luôn hiện, không dùng ngăn kéo. */
const DESKTOP_QUERY = "(min-width: 64rem)";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(({ permission }) => can(permission));
  // Mục khớp dài nhất mới sáng: `/staff/users` cũng bắt đầu bằng `/staff`.
  const activeHref = items
    .map(({ href }) => href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
            href === activeHref
              ? "bg-info text-primary"
              : "text-secondary-text hover:bg-muted",
          )}
        >
          <Icon className="size-4.5" />
          {label}
        </Link>
      ))}
      {UPCOMING_NAV.map(({ label, icon: Icon }) => (
        <span
          key={label}
          className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-placeholder"
        >
          <Icon className="size-4.5" />
          <span className="flex-1">{label}</span>
          <span className="rounded-full bg-muted px-2 py-0.75 text-[11px] leading-3.5 font-semibold text-muted-foreground">
            Sắp có
          </span>
        </span>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const homePath = state.user ? homePathFor(state.user.role) : "/";
  const classDetail = CLASS_DETAIL_PATH.exec(pathname);

  // Ngăn kéo khoá cuộn trang, nên phải đóng khi màn hình nới rộng tới mốc có sidebar.
  useEffect(() => {
    if (!drawerOpen) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const close = () => {
      if (desktop.matches) setDrawerOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, [drawerOpen]);

  const logo = (
    <Link
      href={homePath}
      className="rounded-lg"
      onClick={() => setDrawerOpen(false)}
    >
      <BrandLogo className="text-foreground" markClassName="bg-primary" />
    </Link>
  );

  return (
    <div className="flex min-h-svh bg-surface">
      <aside className="sticky top-0 hidden h-svh w-62 shrink-0 flex-col border-r bg-background px-3 py-4 lg:flex">
        <div className="p-2">{logo}</div>
        <SidebarNav />
        <div className="mt-auto border-t pt-2">
          <UserMenu />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-15 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:px-8">
          <div className="hidden min-w-0 text-[13px] leading-4.5 font-semibold lg:block">
            {classDetail ? (
              <ClassBreadcrumb classId={Number(classDetail[1])} />
            ) : (
              PAGE_TITLES[pathname]
            )}
          </div>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mở menu điều hướng"
                  className="-ml-2"
                >
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent title="Menu điều hướng">
                <div className="p-2">{logo}</div>
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>
            {logo}
          </div>
          <div className="flex lg:hidden">
            <UserMenu compact />
          </div>
        </header>
        <main className="flex-1 px-4 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
