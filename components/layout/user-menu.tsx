"use client";

import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { ROLE_LABELS } from "@/lib/auth/roles";

import { UserAvatar } from "./user-avatar";

interface UserMenuProps {
  /** Chỉ hiện avatar, dùng trên top bar khi sidebar bị ẩn. */
  compact?: boolean;
}

export function UserMenu({ compact }: UserMenuProps) {
  const { state, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const { user } = state;

  if (!user) return null;

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Đã đăng xuất.");
    } catch (error) {
      toastApiError(error);
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button
            type="button"
            aria-label="Mở menu tài khoản"
            className="rounded-full focus-ring"
          >
            <UserAvatar fullName={user.fullName} />
          </button>
        ) : (
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg p-2 py-1 text-left focus-ring hover:bg-muted aria-expanded:bg-muted"
          >
            <UserAvatar fullName={user.fullName} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-4.5 font-semibold">
                {user.fullName}
              </span>
              <span className="block text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <ChevronsUpDownIcon className="size-4.5 shrink-0 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={compact ? "bottom" : "top"}
        align={compact ? "end" : "start"}
        className="w-56"
      >
        <DropdownMenuLabel className="px-1.5 py-1 text-foreground">
          <p className="truncate text-[13px] leading-4.5 font-semibold">
            {user.fullName}
          </p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon />
            Trang cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={handleLogout}
        >
          <LogOutIcon />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
