import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "Clínica Carmen <onboarding@resend.dev>";

export async function sendLopdEmail(to: string, nombre: string, apellidos: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured

  const nombreCompleto = `${nombre} ${apellidos}`;
  const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Información sobre el tratamiento de tus datos — Clínica Carmen",
    html: lopdHtml(nombreCompleto, fechaHoy),
  });
}

function lopdHtml(nombre: string, fecha: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Protección de datos — Clínica Carmen</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Cabecera -->
        <tr>
          <td style="background:#0891B2;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <div style="display:inline-block;width:44px;height:44px;background:white;border-radius:10px;line-height:44px;font-size:22px;font-weight:900;color:#0891B2;margin-bottom:12px;">C</div>
            <p style="margin:0;color:white;font-size:20px;font-weight:700;">Clínica Carmen</p>
            <p style="margin:4px 0 0;color:#bae6fd;font-size:13px;">Fisioterapia</p>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="background:white;padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1a1a1a;">Hola, ${nombre}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Gracias por reservar tu primera visita. A continuación te informamos sobre cómo tratamos tus datos personales.</p>

            <div style="background:#f0f9ff;border-left:4px solid #0891B2;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#0369a1;font-weight:600;">Información básica sobre protección de datos</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:130px;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Responsable</p>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:13px;color:#374151;">Carmen — Fisioterapeuta colegiada</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Finalidad</p>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:13px;color:#374151;">Gestión de la historia clínica, citas y seguimiento del tratamiento fisioterapéutico.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Legitimación</p>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:13px;color:#374151;">Consentimiento del interesado y ejecución de la relación contractual de prestación de servicios sanitarios (Art. 6.1.b y Art. 9.2.h RGPD).</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Destinatarios</p>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:13px;color:#374151;">No se cederán datos a terceros, salvo obligación legal. Los datos de salud están protegidos con las medidas técnicas y organizativas exigidas por el RGPD.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Conservación</p>
                </td>
                <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:13px;color:#374151;">Los datos se conservarán durante el tiempo necesario para la prestación del servicio y, como mínimo, 5 años tras el alta del paciente, según la normativa sanitaria aplicable.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Tus derechos</p>
                </td>
                <td style="padding:10px 0 10px 16px;">
                  <p style="margin:0;font-size:13px;color:#374151;">Puedes ejercer tus derechos de <strong>acceso, rectificación, supresión, oposición, limitación y portabilidad</strong> escribiendo a Carmen por WhatsApp o al correo electrónico de la clínica. También puedes presentar una reclamación ante la <a href="https://www.aepd.es" style="color:#0891B2;">Agencia Española de Protección de Datos (aepd.es)</a>.</p>
                </td>
              </tr>
            </table>

            <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Datos tratados</p>
              <p style="margin:0;font-size:13px;color:#374151;">Nombre y apellidos · DNI/NIE · Teléfono · Correo electrónico · Historia clínica (motivo de consulta, antecedentes, patologías, medicación, pruebas de imagen) · Registro de sesiones de fisioterapia.</p>
            </div>

            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fecha de registro: ${fecha}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Cualquier duda, escríbenos directamente.</p>
          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Clínica Carmen · Fisioterapia</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Este correo se ha generado automáticamente al registrar tu primera cita.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
