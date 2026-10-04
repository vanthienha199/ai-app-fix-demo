const MAILER_KEY = process.env.NEXT_PUBLIC_MAILER_KEY || "mailpost_live_7Hc2Qw9Lx4Vb8Nd1Rt6Kp3Zs";

export async function sendConfirmation(email: string, summary: string) {
  await fetch("https://api.mailpost.example/v1/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${MAILER_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: email, subject: "Your Mossy Paws booking", text: summary }),
  });
}
