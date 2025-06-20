import React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout, paragraph, tokenBox, tokenText } from "../components/email-layout";

interface ResetPasswordProps {
  /** The 6-digit (or however many characters) verification token */
  token: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
  return (
    <EmailLayout
      previewText="Your password reset code is inside"
      heading="Reset Your Password"
    >
      <Text style={paragraph}>Hi there,</Text>
      <Text style={paragraph}>
        You requested to reset your password. Please use the code below to
        complete the password reset process. Simply copy the token and paste
        it into the verification field in our app.
      </Text>

      <Section style={tokenBox}>
        <Text style={tokenText}>{token}</Text>
      </Section>

      <Text style={paragraph}>
        If you didn't request this, you can safely ignore this email. Your account is secure.
      </Text>
    </EmailLayout>
  );
};

export default ResetPassword;