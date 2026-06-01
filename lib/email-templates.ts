const BASE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ScanVault</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.14);">

          <!-- ── HEADER ── -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:28px 40px 0;text-align:center;">
              <img src="https://scanvault.co.uk/scanvaultlogo.png" alt="ScanVault" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
              <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;font-family:Arial,sans-serif;margin-top:10px;">
                <span style="color:#0d0d0d;">Scan</span><span style="color:#dc2626;">Vault</span>
              </div>
              <div style="height:4px;background:#dc2626;margin-top:16px;"></div>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="background:#ffffff;padding:44px 40px 36px;">
              {{BODY}}
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- ── GLASS SIGNATURE CARD ── -->
          <tr>
            <td bgcolor="#111827" style="background:#111827;padding:36px 40px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Signature block (glass card simulation) -->
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0"
                      style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:0;width:100%;">
                      <tr>
                        <td style="padding:24px 28px;">

                          <!-- Red top accent -->
                          <div style="width:40px;height:3px;background:#dc2626;border-radius:2px;margin-bottom:16px;"></div>

                          <!-- Name & title -->
                          <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.3px;margin-bottom:4px;">Kevin Quirk</div>
                          <div style="font-size:12px;font-weight:600;color:#dc2626;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:20px;">Director &bull; ScanVault</div>

                          <!-- Divider -->
                          <div style="border-top:1px solid rgba(255,255,255,0.10);margin-bottom:18px;"></div>

                          <!-- Contact details -->
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:8px;">
                                <span style="display:inline-block;width:20px;text-align:center;color:#dc2626;font-size:13px;">&#9990;</span>
                                <a href="tel:+447359969266"
                                  style="color:#d1d5db;font-size:13px;text-decoration:none;margin-left:6px;">+44 7359 969266</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:8px;">
                                <span style="display:inline-block;width:20px;text-align:center;color:#dc2626;font-size:13px;">&#9993;</span>
                                <a href="mailto:kevin@scanvault.co.uk"
                                  style="color:#d1d5db;font-size:13px;text-decoration:none;margin-left:6px;">kevin@scanvault.co.uk</a>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <span style="display:inline-block;width:20px;text-align:center;color:#dc2626;font-size:13px;">&#127760;</span>
                                <a href="https://scanvault.co.uk"
                                  style="color:#dc2626;font-size:13px;text-decoration:none;margin-left:6px;">scanvault.co.uk</a>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Branding (right side) -->
                  <td width="130" style="text-align:right;vertical-align:middle;padding-left:20px;">
                    <div style="font-size:22px;font-weight:900;font-family:Arial,sans-serif;white-space:nowrap;">
                      <span style="color:#ffffff;">Scan</span><span style="color:#dc2626;">Vault</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:24px 0 0;font-size:11px;color:#4b5563;text-align:center;line-height:1.6;">
                &copy; ${new Date().getFullYear()} ScanVault Ltd &bull; Registered in England &amp; Wales &bull; Company No. 17229057<br/>
                This email was sent because you contacted us via <a href="https://scanvault.co.uk" style="color:#6b7280;">scanvault.co.uk</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

export function contactConfirmationHtml(name: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0d0d0d;line-height:1.2;">
      Thank you, ${name}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;letter-spacing:0.3px;">
      We&rsquo;ve received your message
    </p>

    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Thank you for reaching out to <strong>ScanVault</strong>. We take every enquiry seriously and
      a member of our team will review your message and be in touch with you
      <strong>within 24 hours</strong> (Monday–Friday, 9am–5pm).
    </p>

    <!-- Highlight box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#dc2626;letter-spacing:0.8px;text-transform:uppercase;">
            What happens next?
          </p>
          <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:#374151;line-height:1.9;">
            <li>Your enquiry has been received and logged</li>
            <li>A ScanVault specialist will review your requirements</li>
            <li>We will respond within <strong>24 hours</strong></li>
            <li>If urgent, call us directly on <strong>+44 7359 969266</strong></li>
          </ul>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
      In the meantime, feel free to explore our full range of services at
      <a href="https://scanvault.co.uk" style="color:#dc2626;font-weight:600;text-decoration:none;">scanvault.co.uk</a>.
    </p>

    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      Warm regards,<br/>
      <strong>The ScanVault Team</strong>
    </p>
  `;
  return BASE.replace("{{BODY}}", body);
}

export function quoteConfirmationHtml(name: string, service: string): string {
  const serviceLabels: Record<string, string> = {
    "document-scanning": "Document Scanning",
    "document-archiving": "Document Archiving",
    "hr-records": "HR Records Management",
    "financial-docs": "Financial Documents",
    "client-records": "Client Records",
    "other": "Other",
  };
  const serviceLabel = serviceLabels[service] ?? service;

  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0d0d0d;line-height:1.2;">
      Quote Request Received, ${name}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;letter-spacing:0.3px;">
      Your free quote is on its way
    </p>

    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
      Thank you for requesting a quote from <strong>ScanVault</strong>. We have received your enquiry
      for <strong>${serviceLabel}</strong> and a member of our team will prepare a
      personalised quote and contact you <strong>within 24 hours</strong> (Monday–Friday, 9am–5pm).
    </p>

    <!-- Highlight box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#dc2626;letter-spacing:0.8px;text-transform:uppercase;">
            Your Quote Summary
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-right:16px;padding-bottom:6px;white-space:nowrap;">Service Requested</td>
              <td style="font-size:13px;font-weight:700;color:#0d0d0d;padding-bottom:6px;">${serviceLabel}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-right:16px;padding-bottom:6px;">Response Time</td>
              <td style="font-size:13px;font-weight:700;color:#0d0d0d;padding-bottom:6px;">Within 24 hours</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-right:16px;">Cost</td>
              <td style="font-size:13px;font-weight:700;color:#dc2626;">Free &mdash; No obligation</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Why ScanVault -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f9fafb;border-radius:8px;padding:18px 22px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#374151;letter-spacing:0.5px;">
            Why organisations choose ScanVault:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:13px;color:#374151;line-height:1.8;padding-left:4px;">&#10003;&nbsp;&nbsp;GDPR compliant processes end-to-end</td></tr>
            <tr><td style="font-size:13px;color:#374151;line-height:1.8;padding-left:4px;">&#10003;&nbsp;&nbsp;Pre-work risk assessment — agreed by both parties</td></tr>
            <tr><td style="font-size:13px;color:#374151;line-height:1.8;padding-left:4px;">&#10003;&nbsp;&nbsp;Secure chain of custody from collection to delivery</td></tr>
            <tr><td style="font-size:13px;color:#374151;line-height:1.8;padding-left:4px;">&#10003;&nbsp;&nbsp;Competitive, transparent pricing — no hidden costs</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      Warm regards,<br/>
      <strong>The ScanVault Team</strong>
    </p>
  `;
  return BASE.replace("{{BODY}}", body);
}
