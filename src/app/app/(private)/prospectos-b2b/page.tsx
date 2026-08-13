import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listB2bProspects, listSpecialties } from "@/lib/data";
import { B2bClient } from "./B2bClient";

export default async function ProspectosB2bPage() {
  const [prospects, specialties] = await Promise.all([listB2bProspects(), listSpecialties()]);

  return (
    <div>
      <PageHeader title="Prospectos B2B" subtitle="Especialistas interesados en rentar, previo al registro formal." />
      <Card>
        <B2bClient
          prospects={prospects.map((p) => ({
            id: p.id,
            date: p.date.toISOString(),
            specialistName: p.specialistName,
            specialtyName: p.specialty?.name ?? null,
            status: p.status,
            scheduleIncident: p.scheduleIncident,
            notes: p.notes,
          }))}
          specialties={specialties.map((s) => ({ id: s.id, name: s.name }))}
        />
      </Card>
    </div>
  );
}
