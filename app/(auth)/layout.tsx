import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { GuestOnly } from "@/components/auth/guards";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <GuestOnly>
      <div className="min-h-svh lg:grid lg:grid-cols-[400px_1fr] xl:grid-cols-[560px_1fr]">
        <AuthBrandPanel />
        <main className="flex min-w-0 flex-col items-center px-4 py-8 lg:justify-center lg:py-12">
          <BrandLogo className="mb-8 self-start text-primary lg:hidden" />
          {children}
        </main>
      </div>
    </GuestOnly>
  );
}
