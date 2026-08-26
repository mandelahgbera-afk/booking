// Shared HTML shell for every in-app transactional email. Mirrors the exact
// visual language of supabase/email-templates/*.html (same header, card,
// button, footer) so every email — whether Supabase sent it or our own code
// did — reads as one consistent, branded system.
//
// Design choices, on purpose:
// - Table-based layout + inline styles: renders correctly in Outlook desktop,
//   Gmail (incl. clipped/AMP views), and every mobile mail app, not just
//   modern webmail.
// - Zero external image dependencies (logo mark is a colored table cell +
//   emoji, not a hosted PNG/SVG) — so the email still looks intentional even
//   in inboxes that block remote images by default, which is most of them.
// - System font stack, not a web font — email clients don't reliably load
//   @font-face.
// - prefers-color-scheme dark mode support, matching the app's own design
//   system tokens.

export type EmailIcon =
  | "plane"
  | "gift"
  | "ticket"
  | "shield"
  | "receipt"
  | "mail"
  | "check"
  | "warning"
  | "wave";

const ICON_GLYPH: Record<EmailIcon, string> = {
  plane: "&#9992;&#65039;",
  gift: "&#127873;",
  ticket: "&#127915;&#65039;",
  shield: "&#128737;&#65039;",
  receipt: "&#129534;",
  mail: "&#9993;&#65039;",
  check: "&#9989;",
  warning: "&#9888;&#65039;",
  wave: "&#128075;",
};

const ICON_BG: Record<EmailIcon, string> = {
  plane: "#fff7ed",
  gift: "#fdf4ff",
  ticket: "#fff7ed",
  shield: "#fef2f2",
  receipt: "#eff6ff",
  mail: "#eff6ff",
  check: "#f0fdf4",
  warning: "#fffbeb",
  wave: "#f0fdf4",
};

export type EmailButton = { label: string; url: string };

export function renderEmailShell(opts: {
  preheader: string;
  icon: EmailIcon;
  title: string;
  bodyHtml: string; // pre-rendered inner HTML (paragraphs, cards, tables)
  button?: EmailButton;
  footerNote?: string;
  siteUrl?: string;
}): string {
  const siteUrl = opts.siteUrl ?? "https://airfly.example";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(opts.title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  body { margin:0; padding:0; width:100% !important; background-color:#f1f5f9; }
  table { border-collapse:collapse; }
  a { text-decoration:none; }
  @media (prefers-color-scheme: dark) {
    .bg-page { background-color:#0b1120 !important; }
    .bg-card { background-color:#111827 !important; border-color:#1f2937 !important; }
    .bg-soft { background-color:#1f2937 !important; border-color:#334155 !important; }
    .text-title { color:#f8fafc !important; }
    .text-body { color:#cbd5e1 !important; }
    .text-muted { color:#64748b !important; }
    .divider { border-color:#1f2937 !important; }
  }
  @media only screen and (max-width: 600px) {
    .container { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
  }
</style>
</head>
<body class="bg-page" style="margin:0; padding:0; background-color:#f1f5f9;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${escapeHtml(opts.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" height="36" bgcolor="#f97316" style="background:linear-gradient(135deg,#f97316,#ea580c); background-color:#f97316; border-radius:11px; text-align:center; vertical-align:middle; font-size:17px;">&#9992;&#65039;</td>
                  <td style="padding-left:10px; font-size:19px; font-weight:800; color:#0f172a;" class="text-title">AirFly</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="bg-card" style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="px" align="center" style="padding:48px 40px 8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="64" height="64" bgcolor="${ICON_BG[opts.icon]}" style="background-color:${ICON_BG[opts.icon]}; border-radius:50%; text-align:center; vertical-align:middle; font-size:28px;">${ICON_GLYPH[opts.icon]}</td>
                      </tr>
                    </table>

                    <div class="text-title" style="margin-top:24px; font-size:24px; font-weight:800; color:#0f172a; line-height:1.3;">
                      ${escapeHtml(opts.title)}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td class="px" align="center" style="padding:12px 40px 32px;">
                    ${opts.bodyHtml}

                    ${
                      opts.button
                        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                      <tr>
                        <td bgcolor="#f97316" style="background:linear-gradient(135deg,#f97316,#ea580c); background-color:#f97316; border-radius:12px;">
                          <a href="${opts.button.url}" target="_blank" style="display:inline-block; padding:14px 36px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">
                            ${escapeHtml(opts.button.label)}
                          </a>
                        </td>
                      </tr>
                    </table>`
                        : ""
                    }
                  </td>
                </tr>

                <tr><td class="divider" style="border-top:1px solid #f1f5f9; padding:0;"></td></tr>

                <tr>
                  <td class="px" align="center" style="padding:24px 40px 32px;">
                    <div class="text-muted" style="font-size:12px; color:#94a3b8; line-height:1.6;">
                      ${opts.footerNote ?? "Questions? Just reply to this email — a real human reads it."}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 24px;">
              <div class="text-muted" style="font-size:12px; color:#94a3b8; line-height:1.8;">
                AirFly, Inc. &middot; This is a transactional email about your account.<br>
                <a href="${siteUrl}/privacy" style="color:#94a3b8; text-decoration:underline;">Privacy</a> &middot;
                <a href="${siteUrl}/terms" style="color:#94a3b8; text-decoration:underline;">Terms</a> &middot;
                <a href="${siteUrl}/contact" style="color:#94a3b8; text-decoration:underline;">Help</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Small reusable "receipt row" table used inside several email bodies
// (booking summary, payment line items, gift card details).
export function renderInfoCard(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 0; font-size:13px; color:#94a3b8;" class="text-muted">${escapeHtml(r.label)}</td>
      <td align="right" style="padding:10px 0; font-size:13px; font-weight:700; color:#0f172a;" class="text-title">${escapeHtml(r.value)}</td>
    </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-soft" style="margin-top:20px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:14px;">
    <tr><td style="padding:6px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${cells}</table></td></tr>
  </table>`;
}
