import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'FiTEN Directory <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://fiten-business-directory.vercel.app'

export async function sendVerificationEmail(to: string, businessName: string, token: string) {
  const link = `${BASE_URL}/verify?token=${token}`
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Verify your FiTEN listing — ${businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#112240;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#c9a84c;padding:24px 32px;">
            <p style="margin:0;color:#0a1628;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">FiTEN Business Directory</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="margin:0 0 12px;color:#f0e6cc;font-size:22px;font-weight:700;">Verify your listing</h1>
            <p style="margin:0 0 8px;color:#a8b8d0;font-size:15px;line-height:1.6;">
              Thanks for submitting <strong style="color:#f0e6cc;">${businessName}</strong> to the FiTEN Business Directory.
            </p>
            <p style="margin:0 0 32px;color:#a8b8d0;font-size:15px;line-height:1.6;">
              Click the button below to verify your email and activate your listing. This link expires in <strong style="color:#f0e6cc;">48 hours</strong>.
            </p>
            <a href="${link}" style="display:inline-block;background:#c9a84c;color:#0a1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Verify &amp; Activate Listing
            </a>
            <p style="margin:28px 0 0;color:#6b7fa3;font-size:12px;line-height:1.6;">
              Or copy this link into your browser:<br>
              <a href="${link}" style="color:#c9a84c;word-break:break-all;">${link}</a>
            </p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;">
            <p style="margin:0;color:#6b7fa3;font-size:12px;line-height:1.6;">
              If you didn't submit this listing, you can safely ignore this email. The link will expire automatically.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:#4a5568;font-size:11px;">
              FiTEN Business Directory · <a href="${BASE_URL}" style="color:#4a5568;">fiten.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}

function emailShell(body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#112240;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:#c9a84c;padding:24px 32px;">
          <p style="margin:0;color:#0a1628;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">FiTEN Business Directory</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;color:#4a5568;font-size:11px;">FiTEN Business Directory · <a href="${BASE_URL}" style="color:#4a5568;">fiten.org</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendApprovalEmail(to: string, businessName: string, listingId: string) {
  const link = `${BASE_URL}/directory/${listingId}`
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your FiTEN listing is live — ${businessName}`,
    html: emailShell(`
      <h1 style="margin:0 0 12px;color:#f0e6cc;font-size:22px;font-weight:700;">Your listing is live! 🎉</h1>
      <p style="margin:0 0 8px;color:#a8b8d0;font-size:15px;line-height:1.6;">
        <strong style="color:#f0e6cc;">${businessName}</strong> has been approved and is now visible in the FiTEN Business Directory.
      </p>
      <p style="margin:0 0 32px;color:#a8b8d0;font-size:15px;line-height:1.6;">
        Share your listing with your network and start connecting with partners, clients, and investors across the global Tamil community.
      </p>
      <a href="${link}" style="display:inline-block;background:#c9a84c;color:#0a1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
        View Your Listing
      </a>`),
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}

export async function sendRejectionEmail(to: string, businessName: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Update on your FiTEN listing — ${businessName}`,
    html: emailShell(`
      <h1 style="margin:0 0 12px;color:#f0e6cc;font-size:22px;font-weight:700;">Listing update</h1>
      <p style="margin:0 0 8px;color:#a8b8d0;font-size:15px;line-height:1.6;">
        Thank you for submitting <strong style="color:#f0e6cc;">${businessName}</strong> to the FiTEN Business Directory.
      </p>
      <p style="margin:0 0 16px;color:#a8b8d0;font-size:15px;line-height:1.6;">
        After review, we were unable to approve your listing at this time. Common reasons include incomplete information, an unverified email address, or content that doesn't meet our directory guidelines.
      </p>
      <p style="margin:0 0 32px;color:#a8b8d0;font-size:15px;line-height:1.6;">
        You're welcome to resubmit with updated details. If you believe this was an error, please reply to this email.
      </p>
      <a href="${BASE_URL}/form" style="display:inline-block;background:#c9a84c;color:#0a1628;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
        Resubmit Listing
      </a>`),
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}
