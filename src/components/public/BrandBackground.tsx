import Image from "next/image";

export function BrandBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <Image
        src="/img/fondo-hires.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="object-cover brightness-95"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(233,0,110,0.38) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.85) 85%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(120,0,60,0.45) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}
