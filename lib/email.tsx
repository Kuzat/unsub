import * as nodemailer from "nodemailer"
import {scalewayTEM} from "@/lib/scaleway";
import {render} from "@react-email/render";
import ConfirmEmail from "@/emails/transactional/confirm-email";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmailDev(options: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    ignoreTLS: true,
  });

  try {
    await transporter.sendMail({
      from: '"Unsub" <dev@unsub.cash>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendEmailProd(options: EmailOptions) {
  try {
    await scalewayTEM.createEmail({
      from: {
        email: process.env.EMAIL_FROM!,
        name: process.env.EMAIL_NAME!,
      },
      to: [
        {
          email: options.to,
        }
      ],
      subject: options.subject,
      text: options.text ?? options.html,
      html: options.html
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function sendEmail(options: EmailOptions) {
  switch (process.env.NODE_ENV) {
    case "development":
      await sendEmailDev(options);
      break;
    case "production":
      await sendEmailProd(options);
      break;
    case "test":
      console.log("Sending email to", options.to);
      break;
    default:
      console.error("NODE_ENV not set, unable to send email");
  }
}

export async function sendVerificationEmail(email: string, otpToken: string) {
  const html = await render(<ConfirmEmail token={otpToken} />);
  const text = await render(<ConfirmEmail token={otpToken} />, {
    plainText: true,
  });
  const subject = "Your Unsub💸 email verification code"

  await sendEmail({
    to: email,
    subject: subject,
    html: html,
    text: text,
  });
}