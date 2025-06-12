import * as React from 'react';
import * as nodemailer from "nodemailer"
import {scalewayTEM} from "@/lib/scaleway";
import {render} from "@react-email/render";
import ConfirmEmail from "@/emails/transactional/confirm-email";
import DeleteAccount from "@/emails/transactional/delete-account";
import RenewalReminder from "@/emails/transactional/renewal-reminder";
import {format} from "date-fns";
import {toZonedTime} from "date-fns-tz";

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
  const html = await render(<ConfirmEmail token={otpToken}/>);
  const text = await render(<ConfirmEmail token={otpToken}/>, {
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

/**
 * Sends an account deletion verification email with a link to confirm the deletion
 * @param email The recipient's email address
 * @param token The verification token
 */
export async function sendDeleteAccountEmail(email: string, url: string) {
  const html = await render(<DeleteAccount url={url} email={email}/>);
  const text = await render(<DeleteAccount url={url} email={email}/>, {
    plainText: true,
  });
  const subject = "Confirm Your Unsub💸 Account Deletion Request"

  await sendEmail({
    to: email,
    subject: subject,
    html: html,
    text: text,
  });
}

export async function sendRenewalReminderEmail(
  email: string,
  serviceName: string,
  renewalDate: Date
) {
  // Format the date in UTC to ensure consistent display regardless of server timezone
  const utcDate = toZonedTime(renewalDate, 'UTC');
  const dateString = format(utcDate, 'dd MMMM yyyy');

  const html = await render(
    <RenewalReminder serviceName={serviceName} renewalDate={dateString}/>
  );
  const text = await render(
    <RenewalReminder serviceName={serviceName} renewalDate={dateString}/>,
    {plainText: true}
  );
  const subject = `${serviceName} subscription renews on ${dateString}`;

  await sendEmail({
    to: email,
    subject: subject,
    html: html,
    text: text,
  });
}
