import type { Env } from "../types";

/** Send a magic-link email. Resend is used when configured, otherwise no-op. */
export async function sendMagicLinkEmail(
  env: Env,
  email: string,
  link: string,
): Promise<void> {
  const subject = "Your miTienda sign-in link";
  const html = magicLinkTemplate(link);

  if (env.EMAIL_PROVIDER === "resend" && env.RESEND_API_KEY) {
    await sendViaResend(env, email, subject, html);
    return;
  }

  // No provider configured (local/test): log instead of sending.
  console.log(`[email:noop] to=${email} link=${link}`);
}

async function sendViaResend(
  env: Env,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail}`);
  }
}

function magicLinkTemplate(link: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:20px;">Sign in to miTienda</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#52525b;">
          Click the button below to sign in. This link expires in 15 minutes and can only be used once.
        </p>
        <a href="${link}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          Sign in
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;word-break:break-all;">
          Or paste this URL into your browser:<br />${link}
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}
