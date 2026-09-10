type EmailMessage = { to: string; subject: string; html: string };

export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email chưa được cấu hình: cần RESEND_API_KEY và EMAIL_FROM");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...message }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error:", detail);
    throw new Error("Không thể gửi email. Kiểm tra EMAIL_FROM đã dùng domain được xác minh trên Resend chưa.");
  }
}

export function buildCodeEmail(title: string, code: string, expiresIn = "10 phút") {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033"><h2>${title}</h2><p>Mã xác thực của bạn là:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1677ff">${code}</p><p>Mã có hiệu lực trong ${expiresIn}. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p></div>`;
}
