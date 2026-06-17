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

export async function sendConsentimientoEmail(to: string, nombre: string, apellidos: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const nombreCompleto = `${nombre} ${apellidos}`;
  const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Consentimiento informado para técnicas fisioterapéuticas — Clínica Carmen",
    html: consentimientoHtml(nombreCompleto, fechaHoy),
  });
}

function consentimientoHtml(nombre: string, fecha: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Consentimiento informado — Clínica Carmen</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#2D7D5E;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <div style="display:inline-block;width:44px;height:44px;background:white;border-radius:10px;line-height:44px;font-size:22px;font-weight:900;color:#2D7D5E;margin-bottom:12px;">C</div>
            <p style="margin:0;color:white;font-size:20px;font-weight:700;">Clínica Carmen</p>
            <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">Consentimiento informado</p>
          </td>
        </tr>

        <tr>
          <td style="background:white;padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1a1a1a;">Hola, ${nombre}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
              Para continuar con tu tratamiento, necesitamos tu consentimiento informado para la aplicación de las siguientes técnicas fisioterapéuticas.
              Por favor, lee con atención y guarda este documento.
            </p>

            <div style="background:#f0fdf4;border-left:4px solid #2D7D5E;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">Información sobre las técnicas a aplicar</p>
            </div>

            <!-- Punción seca -->
            <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;">Punción seca</p>
              <p style="margin:0 0 8px;font-size:13px;color:#374151;">
                Técnica invasiva que consiste en la inserción de agujas de acupuntura (sin sustancia) en puntos gatillo miofasciales con el objetivo de desactivarlos y reducir el dolor.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;"><strong>Efectos adversos posibles:</strong> dolor local transitorio, hematoma, mareo, síncope vagal (poco frecuente), infección (mínima con técnica estéril).</p>
            </div>

            <!-- Electroterapia -->
            <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;">Electroterapia (TENS / EMS / Radiofrecuencia / Ultrasonidos)</p>
              <p style="margin:0 0 8px;font-size:13px;color:#374151;">
                Aplicación de corrientes eléctricas o energía de radiofrecuencia con fines analgésicos, antiinflamatorios o de estimulación muscular.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;"><strong>Contraindicaciones absolutas:</strong> marcapasos, DAI, embarazo (en zona abdominal/lumbar), trombosis activa, neoplasias en zona de tratamiento, implantes metálicos en la zona (según modalidad).</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;"><strong>Efectos adversos posibles:</strong> irritación cutánea leve, sensación de calor, quemadura superficial (rara con aplicación correcta).</p>
            </div>

            <!-- Manipulación vertebral -->
            <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;">Manipulación y movilización articular</p>
              <p style="margin:0 0 8px;font-size:13px;color:#374151;">
                Técnicas de terapia manual que aplican fuerzas controladas sobre articulaciones con el fin de restaurar la movilidad, reducir el dolor y mejorar la función.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;"><strong>Efectos adversos posibles:</strong> dolor post-tratamiento transitorio (24-48 h), rigidez temporal. Las complicaciones graves son extremadamente raras con una anamnesis y exploración previas adecuadas.</p>
            </div>

            <!-- Ventosas -->
            <div style="margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a1a1a;">Ventosas / Cupping</p>
              <p style="margin:0 0 8px;font-size:13px;color:#374151;">
                Técnica de vacío superficial aplicada sobre tejidos blandos para mejorar la circulación local y liberar tensión miofascial.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;"><strong>Efectos adversos posibles:</strong> marcas cutáneas (equimosis) que desaparecen en 3-10 días, hipersensibilidad local transitoria.</p>
            </div>

            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#92400e;">Declaración del paciente</p>
              <p style="margin:0;font-size:13px;color:#78350f;">
                He leído y comprendido la información facilitada sobre las técnicas descritas.
                He tenido la oportunidad de preguntar dudas a mi fisioterapeuta.
                Conozco que puedo revocar este consentimiento en cualquier momento, sin que ello afecte a la continuidad de mi tratamiento con técnicas alternativas.
                <strong>Al recibir este correo confirmo que doy mi consentimiento verbal para la aplicación de las técnicas indicadas por Carmen en el contexto de mi tratamiento.</strong>
              </p>
            </div>

            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fecha: ${fecha}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Cualquier duda, consúltala directamente con Carmen antes de la sesión.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Clínica Carmen · Fisioterapia</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Este correo constituye el registro del consentimiento informado verbal del paciente.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
