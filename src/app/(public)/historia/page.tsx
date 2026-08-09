import { AccordionCard } from "@/components/public/AccordionCard";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

const LINEA_TIEMPO = [
  {
    title: "5 de octubre de 2005",
    tag: "Origen • CDMX",
    text: (
      <>
        Juan Pablo Cruz García funda <strong>&ldquo;InvestiMerc&rdquo;</strong>, una agencia
        de recursos humanos enfocada en proveer encuestadores de campo para empresas. Este es el punto de partida de
        lo que con el tiempo se transformaría en algo mucho más grande.
      </>
    ),
  },
  {
    title: "Finales de 2006 — Noviembre",
    tag: "Primer giro",
    text: (
      <>
        La empresa cambia de nombre y pasa a llamarse{" "}
        <strong>&ldquo;De la Cruz García Marketing and Research&rdquo;</strong>. Un cliente
        solicita servicios de edecanes; aunque inicialmente no hay experiencia en ello, se acepta el reto y se
        entrega con éxito. De ahí surge la división{" "}
        <strong>&ldquo;De la Cruz García Modelos y Edecanes&rdquo;</strong>.
      </>
    ),
  },
  {
    title: "2007 – 2008",
    tag: "Elite Models Web",
    text: (
      <>
        Desaparece &ldquo;De la Cruz García Marketing and Research&rdquo;. &ldquo;De la Cruz García Modelos y
        Edecanes&rdquo; se convierte en <strong>&ldquo;Elite Models Web&rdquo;</strong>. Los
        inicios son complicados: fuerte competencia y poco volumen de trabajo. Sin embargo, gracias a la
        perseverancia, la empresa logra crecer paso a paso.
      </>
    ),
  },
  {
    title: "Aprox. 2009",
    tag: "Transición a casting",
    text: (
      <>
        Se vende el concepto de &ldquo;Elite Models Web&rdquo;. La empresa retoma su nombre anterior &ldquo;De la
        Cruz García Modelos y Edecanes&rdquo;; en algún momento le solicitan talentos para infomerciales y
        comerciales, acepta el desafío (a pesar de la poca experiencia inicial) y lo resuelve con éxito. Así nace{" "}
        <strong>&ldquo;Cruz García Casting&rdquo;</strong>.
      </>
    ),
  },
  {
    title: "2009 – 2015",
    tag: "Consolidación",
    text: "Cruz García Casting se consolida como proveedora de actores, actrices, extras, testimoniales, stunts y modelos. Participa en telenovelas, películas, comerciales, infomerciales y campañas publicitarias diversas, logrando una posición sólida en el mercado.",
  },
  {
    title: "10 de mayo de 2016",
    tag: "Nace Glamour Models • Mazatlán",
    highlight: true,
    text: (
      <>
        Un par de años atrás Juan Pablo Cruz García había cambiado su sede principal de Ciudad de México a Mazatlán,
        Sinaloa. El 10 de mayo nace <strong>&ldquo;Glamour Models&rdquo;</strong>, con
        enfoque exclusivo en edecanes y modelos. Los primeros dos años son muy difíciles; casi no hay eventos. Pero
        aprovechando la experiencia acumulada en etapas anteriores, a partir de 2018 la empresa despega fuertemente.
      </>
    ),
  },
  {
    title: "2018 – 2019",
    tag: "Crecimiento explosivo",
    text: "Se produce un crecimiento explosivo. Glamour Models se expande a Culiacán y Los Mochis. Cruz García Casting empieza a quedar en segundo plano, ya que la prioridad se centra en Glamour Models.",
  },
  {
    title: "2020",
    tag: "Pandemia",
    text: "La pandemia detiene casi por completo las operaciones. Dos años sin eventos significativos paralizan casi en su totalidad las actividades.",
  },
  {
    title: "2021 – 2025",
    tag: "Regreso con fuerza",
    text: (
      <>
        La actividad regresa con fuerza: el trabajo acumulado llega de golpe. Actualmente Glamour Models cubre más
        de 75 ciudades en México.
        <br />
        <br />
        Cruz García Casting permanece en pausa indefinida. La prioridad absoluta es Glamour Models. Aunque en Cruz
        García Casting hay planes futuros pero claros: management de talentos exclusivos, servicio de
        extras/figurantes y dirección de casting profesional.
      </>
    ),
  },
  {
    title: "2026 — Expansión internacional",
    tag: "México + Colombia",
    highlight: true,
    text: "Glamour Models continúa creciendo y expande sus operaciones al Valle de Aburrá en Colombia. Ahora Glamour Models tiene presencia en dos países.",
  },
];

export default function HistoriaPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2005 — De InvestiMerc a Glamour Models"
          title={
            <>
              Historia y
              <br />
              evolución
            </>
          }
          description="De una agencia de encuestadores en CDMX a operación internacional en México y Colombia — 20 años de evolución constante"
        />

        <div className="flex flex-col gap-4">
          {LINEA_TIEMPO.map((hito, i) => (
            <AccordionCard
              key={hito.title}
              title={hito.title}
              tag={hito.tag}
              highlightTag={hito.highlight}
              variant={i % 2 === 0 ? "dark" : "light"}
              defaultOpen
            >
              <p>{hito.text}</p>
            </AccordionCard>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-3xl leading-tight font-light tracking-[0.1em] text-white uppercase sm:text-4xl">
            De encuestadores
            <br />a internacional
          </p>
          <div className="h-px w-16 bg-gold-500 shadow-[0_0_18px_rgba(186,27,93,0.5)]" />
          <p className="max-w-lg text-sm leading-relaxed tracking-[0.1em] text-white/60 uppercase sm:text-base">
            De una agencia de encuestadores en CDMX a una operación de modelos y edecanes con alcance nacional e
            internacional (México y Colombia).
            <br />
            <br />
            Glamour Models sigue en pleno crecimiento.
          </p>
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
