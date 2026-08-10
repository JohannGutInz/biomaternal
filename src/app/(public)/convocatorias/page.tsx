import type { Metadata } from "next";
import { AccordionCard } from "@/components/public/AccordionCard";
import { BulletList, type BulletItem } from "@/components/public/BulletList";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";

export const metadata: Metadata = {
  title: "Convocatorias - Glamour Models",
  description: "Únete al canal de WhatsApp de tu estado y entérate primero de las convocatorias abiertas.",
};

const CANALES_MX: BulletItem[] = [
  { label: "Canal Nacional (todas las convocatorias)", href: "https://whatsapp.com/channel/0029VacsWKDGJP8DSuz5jB3D" },
  { label: "1. Aguascalientes", href: "https://whatsapp.com/channel/0029Vb2AHkWAjPXG9GxK9t3s" },
  { label: "2. Baja California", href: "https://whatsapp.com/channel/0029ValECWDAojYvt4R8ND3z" },
  { label: "3. Baja California Sur", href: "https://whatsapp.com/channel/0029VaxwTqzHFxP9QbYtNX2r" },
  { label: "4. Campeche", href: "https://whatsapp.com/channel/0029Vb20rGRBPzjPjBYD9W0B" },
  { label: "5. Chiapas", href: "https://whatsapp.com/channel/0029VawuQbZ7T8bR2PLgDN47" },
  { label: "6. Chihuahua", href: "https://whatsapp.com/channel/0029VagZF1v545uxLvjkus2D" },
  { label: "7. Ciudad de México", href: "https://whatsapp.com/channel/0029VakW6Yk4yltFz147681m" },
  { label: "8. Coahuila", href: "https://whatsapp.com/channel/0029Vasoa198kyyNvApVcq3D" },
  { label: "9. Colima", href: "https://whatsapp.com/channel/0029Vb2tYHQBPzjXhQEIBg2s" },
  { label: "10. Durango", href: "https://whatsapp.com/channel/0029VagFbsh6WaKmO1Wm3n0p" },
  { label: "11. Estado de México", href: "https://whatsapp.com/channel/0029Vb21CiQFMqrc1eD6kK41" },
  { label: "12. Guanajuato", href: "https://whatsapp.com/channel/0029ValPM6C7T8bUkoAARh1y" },
  { label: "13. Guerrero", href: "https://whatsapp.com/channel/0029Vb2ZXbLG8l5FfLxf0M01" },
  { label: "14. Hidalgo", href: "https://whatsapp.com/channel/0029VaxsUNNAzNbrUf0CAD3C" },
  { label: "15. Jalisco", href: "https://whatsapp.com/channel/0029VagdgDt4o7qP6B0Yfg3t" },
  { label: "16. Michoacán", href: "https://whatsapp.com/channel/0029VaxIhlh8vd1S6dUOeW3g" },
  { label: "17. Morelos", href: "https://whatsapp.com/channel/0029Vb1ey9n59PwLMcORad1C" },
  { label: "18. Nayarit", href: "https://whatsapp.com/channel/0029ValOvqqEawdygotPTB0Y" },
  { label: "19. Nuevo León", href: "https://whatsapp.com/channel/0029VagJM64H5JM48b56vW2I" },
  { label: "20. Oaxaca", href: "https://whatsapp.com/channel/0029Vb3WTbt5PO0vsKO4Ct1E" },
  { label: "21. Puebla", href: "https://whatsapp.com/channel/0029Vb2OaDnCBtxMZ1mn7w0J" },
  { label: "22. Querétaro", href: "https://whatsapp.com/channel/0029Vb2Lk4DJENy5kP9gmy0D" },
  { label: "23. Quintana Roo", href: "https://whatsapp.com/channel/0029VaxHyYWKbYMPlpDNiA0E" },
  { label: "24. San Luis Potosí", href: "https://whatsapp.com/channel/0029VaxIdiiF1YlLVYxqfe0q" },
  { label: "25. Sinaloa", href: "https://whatsapp.com/channel/0029ValFXXjI1rcbMzVpfk42" },
  { label: "26. Sonora", href: "https://whatsapp.com/channel/0029ValQCW27oQhkGlneG12b" },
  { label: "27. Tabasco", href: "https://whatsapp.com/channel/0029Vb2DOq82phHMMyAEAs1X" },
  { label: "28. Tamaulipas", href: "https://whatsapp.com/channel/0029Vb1vwgFLtOj6Gf7laJ1Y" },
  { label: "29. Tlaxcala", href: "https://whatsapp.com/channel/0029Vb27ekt6rsQznpqVkF1q" },
  { label: "30. Veracruz", href: "https://whatsapp.com/channel/0029Vb1V5vxHAdNYo3p2mQ0t" },
  { label: "31. Yucatán", href: "https://whatsapp.com/channel/0029Vaxa4fp6mYPRqMVDgu0O" },
  { label: "32. Zacatecas", href: "https://whatsapp.com/channel/0029VawymB9KwqSYtqx6Rv3o" },
];

const CANALES_CO: BulletItem[] = [
  { label: "1. Antioquia", href: "https://whatsapp.com/channel/0029VbBTOxuCRs1uMIXfAw2A" },
];

export default function ConvocatoriasPublicasPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Talento activo"
          title="Convocatorias"
          description="Únete al canal de WhatsApp de tu estado y entérate primero de las convocatorias abiertas"
        />

        <div className="mx-auto mb-10 flex justify-center">
          <div className="w-full max-w-[280px] overflow-hidden rounded-[20px] border border-white/14 bg-black/82 backdrop-blur-xl sm:max-w-xs">
            <video src="/video/video-convocatorias.mp4" controls playsInline className="block w-full" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4">
          <AccordionCard title="México">
            <BulletList items={CANALES_MX} />
          </AccordionCard>
          <AccordionCard title="Colombia">
            <BulletList items={CANALES_CO} />
          </AccordionCard>
        </div>
      </div>
    </div>
  );
}
