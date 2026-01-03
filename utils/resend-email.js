import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const email = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export { sendEmail };
