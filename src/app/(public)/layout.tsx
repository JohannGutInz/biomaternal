import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getSiteSettings } from "@/lib/data";

// Font stack from the client's approved mockup (website/*.html) — no licensed
// webfont file exists for Century Gothic (the client doesn't have one either),
// so this falls back to whatever system font is available.
const CLIENT_FONT_STACK =
  '"Century Gothic", CenturyGothic, AppleGothic, Futura, "URW Gothic L", sans-serif';

// The site settings stay mutable in memory (see lib/actions.ts),
// so this section must never be static: every visit should reflect the
// current state defined from the backoffice.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-black" style={{ fontFamily: CLIENT_FONT_STACK }}>
      <PublicHeader publicRegistrationActive={config.publicRegistrationActive} />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter agencyName={config.agencyName} />
    </div>
  );
}
