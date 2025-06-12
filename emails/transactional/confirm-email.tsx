import React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout, paragraph, tokenBox, tokenText } from "../components/email-layout";

interface EmailVerificationProps {
  /** The 6-digit (or however many characters) verification token */
  token: string;
}

const ConfirmEmail: React.FC<EmailVerificationProps> = ({ token }) => {
  return (
    <EmailLayout
      previewText="Your verification code is inside"
      heading="Verify Your Email Address"
    >
      <Text style={paragraph}>Hi there,</Text>
      <Text style={paragraph}>
        You requested to verify your email. Please use the code below to
        complete the verification process. Simply copy the token and paste
        it into the verification field in our app.
      </Text>

      <Section style={tokenBox}>
        <Text style={tokenText}>{token}</Text>
      </Section>

      <Text style={paragraph}>
        If you didn't request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
};

export default ConfirmEmail;