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
  Button,
  Link,
} from "@react-email/components";

interface DeleteAccountProps {
  /** The verification url for account deletion */
  url: string;
  /** The user's email address */
  email: string;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ url, email }) => {
  return (
    <Html>
      <Head />
      {/* Preview text shown in inbox preview */}
      <Preview>Confirm your account deletion request</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Account Deletion Request</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              We received a request to delete your Unsub account associated with {email}.
              To confirm this request and permanently delete your account, please click
              the button below.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={url}>
                Confirm Account Deletion
              </Button>
            </Section>

            <Text style={paragraph}>
              If the button doesn't work, you can also copy and paste this link into your browser:
            </Text>
            
            <Text style={linkText}>
              <Link href={url} style={link}>
                {url}
              </Link>
            </Text>

            <Text style={warningText}>
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </Text>

            <Text style={paragraph}>
              If you didn't request to delete your account, please ignore this email or contact
              support if you have concerns about your account security.
            </Text>
          </Section>

          {/* "Footer" as a Section instead of Footer */}
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

export default DeleteAccount;

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

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#ef4444",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
};

const linkText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: "0 0 24px 0",
  wordBreak: "break-all",
};

const link: React.CSSProperties = {
  color: "#3b82f6",
  textDecoration: "underline",
};

const warningText: React.CSSProperties = {
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