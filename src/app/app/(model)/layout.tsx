import { getCurrentUser, getOwnModel } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ModelPortalNav } from "@/components/layout/ModelPortalNav";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const KYC_STATUS_BANNER: Record<string, { label: string; className: string } | undefined> = {
  PENDING: {
    label: "Tu perfil está en revisión — te avisaremos cuando sea aprobado.",
    className: "bg-amber-50 border-amber-200 text-amber-800",
  },
  REQUIRES_CHANGES: {
    label: "La agencia solicitó cambios en tu perfil. Revisa la sección Mi perfil.",
    className: "bg-gold-50 border-gold-200 text-gold-800",
  },
  REJECTED: {
    label: "Tu perfil fue rechazado. Revisa la sección Mi perfil para más detalles.",
    className: "bg-rose-50 border-rose-200 text-rose-800",
  },
};

export default async function ModelGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "SPECIALIST") {
    redirect(APP_ROUTE.app.login.index);
  }

  const model = await getOwnModel(user.id);

  const kycStatus = model?.kyc.status;
  const banner = kycStatus ? KYC_STATUS_BANNER[kycStatus] : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-zinc-950">
            Bio<span className="text-gold-500">maternal</span>
          </span>
          {kycStatus === "APPROVED" && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-emerald-700">
              <span className="sm:hidden">Aprobado</span>
              <span className="hidden sm:inline">Perfil aprobado</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:block">{user.username}</span>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="text-sm text-zinc-500 hover:bg-transparent hover:text-gold-600"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      {banner && (
        <div className={cn("border-b px-6 py-3 text-center text-sm", banner.className)}>
          <span className="font-medium">{banner.label}</span>
        </div>
      )}

      <ModelPortalNav />

      <main className="mx-auto max-w-2xl px-4 py-8 lg:px-0">
        {children}
      </main>
    </div>
  );
}
