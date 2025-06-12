import React from "react";
import { Text, Section, Button, Link } from "@react-email/components";
import { EmailLayout, paragraph, buttonContainer, button } from "../components/email-layout";

interface RenewalReminderProps {
  serviceName: string;
  renewalDate: string;
  dashboardUrl?: string;
}

const RenewalReminder: React.FC<RenewalReminderProps> = ({ 
  serviceName, 
  renewalDate, 
  dashboardUrl = "https://unsub.cash/subscriptions" 
}) => {
  return (
    <EmailLayout
      previewText={`Your ${serviceName} subscription renews soon`}
      heading="Upcoming Renewal Reminder"
    >
      <Text style={paragraph}>
        This is a friendly reminder that your {serviceName} subscription will renew on {renewalDate}.
      </Text>
      <Text style={paragraph}>You can manage your subscriptions anytime in your Unsub dashboard.</Text>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Manage Subscription
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default RenewalReminder;
