export async function sendWhatsApp(message: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    console.warn("WhatsApp: CALLMEBOT_API_KEY not set — skipping notification");
    return;
  }

  const phone = "447359969266";
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log("WhatsApp notification sent");
    } else {
      console.warn("WhatsApp notification failed:", res.status, await res.text());
    }
  } catch (err: unknown) {
    console.error("WhatsApp notification error:", err);
  }
}
