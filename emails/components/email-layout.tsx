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
  Img,
} from "@react-email/components";

interface EmailLayoutProps {
  previewText: string;
  heading: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  previewText,
  heading,
  children,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://unsub.cash'}/unsub.svg`}
              width="120"
              height="120"
              alt="Unsub Logo"
              style={logo}
            />
          </Section>
          <Section style={header}>
            <Heading style={headingStyle}>{heading}</Heading>
          </Section>
          <Section style={content}>
            {children}
          </Section>
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

// Shared styles
export const main: React.CSSProperties = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

export const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  width: "100%",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

export const logoContainer: React.CSSProperties = {
  textAlign: "center",
  paddingBottom: "20px",
};

export const logo: React.CSSProperties = {
  margin: "0 auto",
  borderRadius: "0.5rem"
};

export const header: React.CSSProperties = {
  paddingBottom: "20px",
  borderBottom: "1px solid #eaeaea",
  textAlign: "center",
};

export const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 600,
  margin: "0",
  color: "#111827",
};

export const content: React.CSSProperties = {
  paddingTop: "20px",
  paddingBottom: "20px",
};

export const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#374151",
  margin: "0 0 16px 0",
};

export const footer: React.CSSProperties = {
  borderTop: "1px solid #eaeaea",
  paddingTop: "20px",
  textAlign: "center",
};

export const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: 0,
};

// Additional shared styles for specific components
export const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

export const button: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
};

export const tokenBox: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  borderRadius: "4px",
  padding: "12px 0",
  textAlign: "center",
  margin: "20px 0",
};

export const tokenText: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#111827",
};

export const linkText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: "0 0 24px 0",
  wordBreak: "break-all",
};

export const link: React.CSSProperties = {
  color: "#3b82f6",
  textDecoration: "underline",
};

export const warningText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#ef4444",
  fontWeight: 600,
  margin: "24px 0",
  padding: "12px",
  backgroundColor: "#fee2e2",
  borderRadius: "4px",
  textAlign: "center",
};