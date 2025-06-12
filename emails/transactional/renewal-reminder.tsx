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

interface RenewalReminderProps {
  serviceName: string;
  renewalDate: string;
}

const RenewalReminder: React.FC<RenewalReminderProps> = ({ serviceName, renewalDate }) => {
  return (
    <Html>
      <Head />
      <Preview>Your {serviceName} subscription renews soon</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>Upcoming Renewal Reminder</Heading>
          </Section>
          <Section style={content}>
            <Text style={paragraph}>
              This is a friendly reminder that your {serviceName} subscription will renew on {renewalDate}.
            </Text>
            <Text style={paragraph}>Manage your subscriptions anytime in your Unsub dashboard.</Text>
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

export default RenewalReminder;

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
