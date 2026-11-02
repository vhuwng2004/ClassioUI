"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowDownWideNarrowIcon,
  EllipsisIcon,
  FileUpIcon,
  KeyRoundIcon,
  ListFilterIcon,
  LockIcon,
  LockOpenIcon,
  PlusIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Can } from "@/components/auth/guards";
import { SearchInput } from "@/components/form/search-input";
import { SelectMenu } from "@/components/form/select-menu";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { useDebounced } from "@/hooks/use-debounced";
import { usePagination } from "@/hooks/use-pagination";
import { useRefreshUsers } from "@/hooks/use-users";
import {
  userApi,
  type UserAdminResponse,
  type UserRole,
  type UserStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { canManageUser, PERMISSIONS } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";

import { ChangeRoleDialog } from "./change-role-dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { ImportUsersDialog } from "./import-users-dialog";
import { TemporaryPasswordDialog } from "./temporary-password-dialog";
import { USER_STATUS_LABELS, UserStatusBadge } from "./user-status-badge";

type RoleFilter = UserRole | "ALL";
type StatusFilter = UserStatus | "ALL";
type Credential = { email: string; temporaryPassword: string };

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "Mọi vai trò" },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
    value,
    label: ROLE_LABELS[value],
  })),
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Mọi trạng thái" },
  { value: "ACTIVE", label: USER_STATUS_LABELS.ACTIVE },
  { value: "LOCKED", label: USER_STATUS_LABELS.LOCKED },
];

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Mới nhất" },
  { value: "createdAt,asc", label: "Cũ nhất" },
  { value: "fullName,asc", label: "Tên A–Z" },
  { value: "email,asc", label: "Email A–Z" },
];

export function UserList() {
  const [dialog, setDialog] = useState<"create" | "import" | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const { page, size, setPage, setSize } = usePagination();
  const keyword = useDebounced(search.trim());

  const users = useQuery({
    queryKey: ["users", "list", { keyword, role, status, sort, page, size }],
    queryFn: () =>
      userApi.list({
        keyword,
        role: role === "ALL" ? undefined : role,
        status: status === "ALL" ? undefined : status,
        sort,
        page,
        size,
      }),
    placeholderData: keepPreviousData,
  });

  const withFirstPage =
    <T,>(update: (next: T) => void) =>
    (next: T) => {
      update(next);
      setPage(0);
    };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Người dùng"
        action={
          <div className="flex flex-wrap gap-2">
            <Can permission={PERMISSIONS.USER_IMPORT}>
              <Button variant="outline" onClick={() => setDialog("import")}>
                <FileUpIcon />
                Nhập từ Excel
              </Button>
            </Can>
            <Can permission={PERMISSIONS.USER_CREATE}>
              <Button onClick={() => setDialog("create")}>
                <PlusIcon />
                Tạo tài khoản
              </Button>
            </Can>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            label="Tìm theo tên, email, số điện thoại"
            value={search}
            onChange={(event) => withFirstPage(setSearch)(event.target.value)}
          />
          <SelectMenu
            label="Vai trò"
            icon={UsersIcon}
            align="start"
            options={ROLE_OPTIONS}
            value={role}
            onChange={withFirstPage(setRole)}
          />
          <SelectMenu
            label="Trạng thái"
            icon={ListFilterIcon}
            align="start"
            options={STATUS_OPTIONS}
            value={status}
            onChange={withFirstPage(setStatus)}
          />
        </div>
        <SelectMenu
          label="Sắp xếp"
          icon={ArrowDownWideNarrowIcon}
          options={SORT_OPTIONS}
          value={sort}
          onChange={withFirstPage(setSort)}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          head={
            <>
              <th className="pr-4 pl-5">Người dùng</th>
              <th className="w-44 pr-4">Vai trò</th>
              <th className="w-52 pr-4">Trạng thái</th>
              <th className="w-31">Ngày tạo</th>
              <th className="w-13.5" />
            </>
          }
        >
          {users.data?.content.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onPasswordReset={setCredential}
            />
          ))}
        </DataTable>
        <QueryState
          query={users}
          isEmpty={users.data?.content.length === 0}
          emptyMessage="Không tìm thấy người dùng phù hợp."
        />
        {users.data && (
          <Pagination
            data={users.data}
            onPageChange={setPage}
            onPageSizeChange={setSize}
          />
        )}
      </Card>

      <CreateUserDialog
        open={dialog === "create"}
        onOpenChange={(open) => !open && setDialog(null)}
        onCreated={({ user, temporaryPassword }) =>
          setCredential({ email: user.email, temporaryPassword })
        }
      />
      <ImportUsersDialog
        open={dialog === "import"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <TemporaryPasswordDialog
        credential={credential}
        onClose={() => setCredential(null)}
      />
    </div>
  );
}

interface UserRowProps {
  user: UserAdminResponse;
  onPasswordReset: (credential: Credential) => void;
}

function UserRow({ user, onPasswordReset }: UserRowProps) {
  const { state, can } = useAuth();
  const refreshUsers = useRefreshUsers();
  const [dialog, setDialog] = useState<"role" | "lock" | "reset" | null>(null);
  const locked = user.status === "LOCKED";
  const manageable = canManageUser(state.user, user);
  const canChangeRole =
    can(PERMISSIONS.USER_CHANGE_ROLE) && state.user?.id !== user.id;

  const handleLockChange = async () => {
    await (locked ? userApi.unlock(user.id) : userApi.lock(user.id));
    await refreshUsers();
    toast.success(locked ? "Đã mở khoá tài khoản." : "Đã khoá tài khoản.");
  };

  const handleResetPassword = async () => {
    const { temporaryPassword } = await userApi.resetPassword(user.id);
    await refreshUsers();
    onPasswordReset({ email: user.email, temporaryPassword });
  };

  return (
    <DataRow>
      <td className="pr-4 pl-5">
        <p className="truncate font-semibold">{user.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="truncate pr-4">{ROLE_LABELS[user.role]}</td>
      <td className="pr-4">
        <div className="flex flex-wrap gap-1">
          <UserStatusBadge status={user.status} />
          {user.mustChangePassword && (
            <StatusBadge tone="warning">Mật khẩu tạm</StatusBadge>
          )}
        </div>
      </td>
      <td className="text-muted-foreground">{formatDate(user.createdAt)}</td>
      <td>
        {(manageable || canChangeRole) && (
          <>
            {/* modal={false}: menu đóng lại trước khi mở hộp thoại, tránh khoá con trỏ. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Thao tác với ${user.fullName}`}
                  className="text-muted-foreground"
                >
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canChangeRole && (
                  <DropdownMenuItem onSelect={() => setDialog("role")}>
                    <ShieldIcon />
                    Đổi vai trò
                  </DropdownMenuItem>
                )}
                {manageable && (
                  <>
                    <DropdownMenuItem onSelect={() => setDialog("reset")}>
                      <KeyRoundIcon />
                      Đặt lại mật khẩu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant={locked ? "default" : "destructive"}
                      onSelect={() => setDialog("lock")}
                    >
                      {locked ? <LockOpenIcon /> : <LockIcon />}
                      {locked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {dialog === "role" && (
              <ChangeRoleDialog
                open
                onOpenChange={(open) => !open && setDialog(null)}
                user={user}
              />
            )}
            <ConfirmDialog
              open={dialog === "lock"}
              onOpenChange={(open) => !open && setDialog(null)}
              title={
                locked
                  ? `Mở khoá “${user.fullName}”?`
                  : `Khoá “${user.fullName}”?`
              }
              description={
                locked
                  ? "Người này đăng nhập lại được bằng mật khẩu hiện có."
                  : "Người này bị đăng xuất ngay và không đăng nhập được cho tới khi mở khoá."
              }
              confirmLabel={locked ? "Mở khoá" : "Khoá tài khoản"}
              destructive={!locked}
              onConfirm={handleLockChange}
            />
            <ConfirmDialog
              open={dialog === "reset"}
              onOpenChange={(open) => !open && setDialog(null)}
              title={`Đặt lại mật khẩu của “${user.fullName}”?`}
              description="Mật khẩu cũ hết hiệu lực và người này bị đăng xuất khỏi mọi thiết bị."
              confirmLabel="Đặt lại mật khẩu"
              onConfirm={handleResetPassword}
            />
          </>
        )}
      </td>
    </DataRow>
  );
}
