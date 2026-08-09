import Link from "next/link";

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.53V6.76a4.85 4.85 0 0 1-1.02-.07z" />
    </svg>
  );
}

const SOCIAL = [
  { href: "https://www.facebook.com/somosglamourmodels/", label: "Facebook", Icon: IconFacebook },
  { href: "https://www.instagram.com/somosglamourmodels/", label: "Instagram", Icon: IconInstagram },
  { href: "https://www.tiktok.com/@somosglamourmodels", label: "TikTok", Icon: IconTikTok },
];

const NAV_COL_1 = [
  { href: "/talentos", label: "Talentos" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/convocatorias", label: "Convocatorias" },
];

const NAV_COL_2 = [
  { href: "/servicios", label: "Servicios" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/como-trabajamos", label: "¿Cómo trabajamos?" },
  { href: "/razones", label: "¿Por qué elegirnos?" },
  { href: "/mision-vision", label: "Misión y visión" },
  { href: "/historia", label: "Historia" },
];

const NAV_COL_3 = [
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Aviso de privacidad" },
];

export function PublicFooter({ agencyName }: { agencyName: string }) {
  return (
    <footer className="relative z-10 bg-zinc-950 text-zinc-400">
      {/* Main footer */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="text-xl font-semibold tracking-tight text-white">
              {agencyName}
            </span>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
              Agencia de representación de modelos, edecanes y talento profesional para eventos, campañas y producciones.
            </p>
            <div className="mt-3 flex items-center gap-4">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-gold-500 hover:text-gold-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav col 1 */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Explorar</p>
            <ul className="space-y-1.5">
              {NAV_COL_1.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav col 2 — Conócenos */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Conócenos</p>
            <ul className="space-y-1.5">
              {NAV_COL_2.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav col 3 — Empresa */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Empresa</p>
            <ul className="space-y-1.5">
              {NAV_COL_3.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://jpablocruzg.jimdosite.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:text-gold-400"
                >
                  Nuestro director
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 px-6 py-3">
        <p className="text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} {agencyName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
