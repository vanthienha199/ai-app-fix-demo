import "server-only";

export type Outgoing = { to: string; subject: string; text: string };
const outbox: Outgoing[] = [];

export async function sendConfirmation(msg: Outgoing) {
  const key = process.env.MAILER_KEY;
  if (!key) {
    outbox.unshift(msg);
    return { queued: true, delivered: false };
  }
  const res = await fetch(process.env.MAILER_URL || "https://api.mailpost.example/v1/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  });
  return { queued: true, delivered: res.ok };
}

export function recentOutbox() {
  return outbox.slice(0, 20);
}
