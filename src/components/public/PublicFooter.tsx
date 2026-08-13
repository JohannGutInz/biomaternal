import Image from "next/image";
import Link from "next/link";
import { SOCIAL } from "./SocialIcons";

export function PublicFooter({ agencyName }: { agencyName: string }) {
  return (
    <footer className="relative z-10 border-t border-white/8 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/img/logo.png" alt={agencyName} width={36} height={36} className="rounded-full" />
          <span className="text-sm font-semibold tracking-wide text-white uppercase">{agencyName}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.16em] text-white/60 uppercase">
          <a
            href="https://jpablocruzg.jimdosite.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-400"
          >
            Acerca de nuestro director general
          </a>
          <span className="h-3 w-px bg-white/15" aria-hidden />
          <Link href="/privacidad" className="transition-colors hover:text-brand-400">
            Política de privacidad
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {SOCIAL.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-brand-400 hover:text-brand-400"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-3">
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} {agencyName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
