import { BrandBackground } from "@/components/public/BrandBackground";

export default function PrivacidadPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="rounded-[20px] border border-white/90 bg-white p-8 sm:p-10">
          <div className="mb-10">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-brand-500 uppercase">
              Legal
            </p>
            <h1 className="text-3xl font-light tracking-tight text-zinc-950">
              Aviso de privacidad
            </h1>
            <div className="mt-4 h-px w-12 bg-brand-500" />
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-zinc-600">
            <section>
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Responsable del tratamiento</h2>
              <p>
                Glamour Models, con domicilio en México, es responsable del uso y protección
                de sus datos personales, en términos de lo dispuesto por la Ley Federal de
                Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Datos personales recabados</h2>
              <p>
                Recabamos los datos que usted nos proporciona al registrarse como talento:
                nombre completo, correo electrónico, teléfono, fecha de nacimiento, fotografías
                y datos físicos relevantes para la representación artística.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Finalidad del tratamiento</h2>
              <p>
                Sus datos se utilizan exclusivamente para: (1) evaluar su perfil como talento,
                (2) presentar su información a clientes contratantes, (3) gestionar bookings y
                asignaciones de eventos, y (4) comunicarnos con usted sobre oportunidades
                laborales.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Derechos ARCO</h2>
              <p>
                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento
                de sus datos personales. Para ejercer estos derechos, contáctenos a través de
                nuestra página de <a href="/contacto" className="text-brand-500 hover:underline">contacto</a>.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-zinc-900">Cambios al aviso</h2>
              <p>
                Nos reservamos el derecho de modificar este aviso en cualquier momento. Los
                cambios serán publicados en esta página.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
