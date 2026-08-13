import { Resend } from "resend";
import type { RegistrationApplication } from "./types";

// Transactional email (servicio tipo Resend / SendGrid). Without
// RESEND_API_KEY configured, it falls back to a readable console log — this
// way the registration/moderation/contact flows stay fully wired without
// depending on real credentials for this demo stage.

const FROM = process.env.EMAIL_FROM ?? "Biomaternal <no-reply@biomaternal.demo>";
const STAFF_INBOX = process.env.STAFF_EMAIL ?? "staff@biomaternal.demo";
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(
      `\n[correo simulado] → ${to}\nAsunto: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`,
    );
    return { ok: true, simulated: true };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { ok: true, simulated: false };
  } catch (error) {
    console.error("[correo] Error al enviar:", error);
    return { ok: false, simulated: false };
  }
}

function layout(title: string, bodyHtml: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#18181b">${title}</h2>
    ${bodyHtml}
    <p style="color:#a1a1aa;font-size:12px;margin-top:32px">Biomaternal</p>
  </div>`;
}

export async function emailApplicationReceived(application: RegistrationApplication) {
  return sendEmail({
    to: application.email,
    subject: "Recibimos tu registro — Biomaternal",
    html: layout(
      "¡Gracias por registrarte!",
      `<p>Hola ${application.fullName}, recibimos tu solicitud y nuestro equipo la revisará pronto.</p>
       <p>Te avisaremos por este correo en cuanto tengamos una respuesta.</p>`,
    ),
  });
}

export async function emailNewApplicationStaff(application: RegistrationApplication) {
  return sendEmail({
    to: STAFF_INBOX,
    subject: `Nueva solicitud de registro: ${application.fullName}`,
    html: layout(
      "Nueva solicitud pendiente de moderación",
      `<p>${application.fullName} (${application.category}) envió una solicitud el ${application.submittedAt}.</p>
       <p><a href="${SITE_URL}/moderacion/${application.id}">Revisar en el backoffice</a></p>`,
    ),
  });
}

export async function emailApplicationDecision(application: RegistrationApplication) {
  const feedbackLink = `${SITE_URL}/retro/${application.reviewToken}`;
  const copyByStatus: Record<string, { subject: string; html: string }> = {
    requiere_cambios: {
      subject: "Necesitamos algunos ajustes en tu registro",
      html: `<p>Hola ${application.fullName}, revisamos tu solicitud y tenemos algunos comentarios para ti.</p>
             <p><a href="${feedbackLink}">Ver comentarios y reenviar</a></p>`,
    },
    aprobado: {
      subject: "¡Bienvenido a Biomaternal!",
      html: `<p>Hola ${application.fullName}, tu registro fue aprobado. Pronto el equipo de booking se pondrá en contacto contigo.</p>`,
    },
    rechazado: {
      subject: "Resultado de tu solicitud — Biomaternal",
      html: `<p>Hola ${application.fullName}, gracias por tu interés. En este momento no encontramos un encaje con las categorías que manejamos.</p>`,
    },
  };
  const copy = copyByStatus[application.status];
  if (!copy) return { ok: true, simulated: true };
  return sendEmail({ to: application.email, subject: copy.subject, html: layout(copy.subject, copy.html) });
}

export async function emailClientContact(data: { name: string; company: string; email: string; message: string }) {
  return sendEmail({
    to: STAFF_INBOX,
    subject: `Nuevo contacto de cliente: ${data.company || data.name}`,
    html: layout(
      "Nuevo mensaje desde el formulario de contacto",
      `<p><strong>${data.name}</strong> (${data.company || "sin empresa"}) — ${data.email}</p>
       <p>${data.message}</p>`,
    ),
  });
}
