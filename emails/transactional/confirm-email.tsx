import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  /** The 6-digit (or however many characters) verification token */
  token: string;
}

const ConfirmEmail: React.FC<EmailVerificationProps> = ({ token }) => {
  return (
    <Html>
      <Head />
      {/* Preview text shown in inbox preview */}
      <Preview>Your verification code is inside</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Verify Your Email Address</Heading>
          </Section>

          <Section style={content}>
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
              If you didn’t request this, you can safely ignore this email.
            </Text>
          </Section>

          {/* “Footer” as a Section instead of Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Unsub💸. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmEmail;

/**
 * Styles
 */
const main: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  width: "100%",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const header: React.CSSProperties = {
  paddingBottom: "20px",
  borderBottom: "1px solid #eaeaea",
  textAlign: "center",
};

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 600,
  margin: "0",
  color: "#111827",
};

const content: React.CSSProperties = {
  paddingTop: "20px",
  paddingBottom: "20px",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#374151",
  margin: "0 0 16px 0",
};

const tokenBox: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px",
  padding: "12px 0",
  textAlign: "center",
  margin: "20px 0",
};

const tokenText: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#111827",
};

const footer: React.CSSProperties = {
  borderTop: "1px solid #eaeaea",
  paddingTop: "20px",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: 0,
};
