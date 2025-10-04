import mailgun from "mailgun-js";
import fs from "fs";
import path from "path";

const mg = mailgun({
  // apiKey: process.env.MAILGUN_API_KEY as string,
  // domain: process.env.MAILGUN_DOMAIN as string,
  apiKey: "",
  domain: "",
});

function loadTemplate(filename: string, variables: Record<string, string>) {
  const filePath = path.join(__dirname, "templates", filename);
  let html = fs.readFileSync(filePath, "utf8");

  // Replace placeholders like {{name}}
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return html;
}

export async function sendWelcomeEmail(to: string, payload: Record<string, string>) {
    const htmlContent = loadTemplate("welcome.html", payload);

    const data = {
        from: `My App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
        to,
        subject: "Welcome to My App 🎉",
        text: "Your account has been created successfully.",
        html: htmlContent,
    };

    try {
        await mg.messages().send(data);
        console.log("✅ Email sent to " + to);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}
