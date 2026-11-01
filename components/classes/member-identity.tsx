import { UserAvatar } from "@/components/layout/user-avatar";

interface MemberIdentityProps {
  fullName: string;
  email?: string | null;
}

export function MemberIdentity({ fullName, email }: MemberIdentityProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <UserAvatar fullName={fullName} className="size-8 text-xs" />
      <span className="min-w-0">
        <span className="block truncate font-semibold">{fullName}</span>
        {email && (
          <span className="block truncate text-xs text-muted-foreground">
            {email}
          </span>
        )}
      </span>
    </span>
  );
}
