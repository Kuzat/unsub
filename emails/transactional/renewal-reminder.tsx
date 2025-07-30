import React from "react";
import { Text, Section, Button } from "@react-email/components";
import { EmailLayout, paragraph, buttonContainer, button } from "../components/email-layout";

interface RenewalReminderProps {
  serviceName: string;
  renewalDate: string;
  dashboardUrl?: string;
  serviceId?: string;
}

const RenewalReminder: React.FC<RenewalReminderProps> = ({ 
  serviceName, 
  renewalDate, 
  dashboardUrl = "https://unsub.cash/subscriptions",
  serviceId 
}) => {
  const baseUrl = dashboardUrl.replace('/subscriptions', '');
  const guideUrl = serviceId ? `${baseUrl}/services/${serviceId}` : null;
  return (
    <EmailLayout
      previewText={`Your ${serviceName} subscription renews soon`}
      heading="Upcoming Renewal Reminder"
    >
      <Text style={paragraph}>
        This is a friendly reminder that your {serviceName} subscription will renew on {renewalDate}.
      </Text>
      <Text style={paragraph}>You can manage your subscriptions anytime in your Unsub dashboard.</Text>
      {guideUrl && (
        <Text style={paragraph}>
          Need to cancel? Check out our <a href={guideUrl} style={{color: '#3b82f6'}}>cancellation guide for {serviceName}</a> for step-by-step instructions.
        </Text>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Manage Subscription
        </Button>
        {guideUrl && (
          <Button style={{...button, backgroundColor: '#10b981', marginLeft: '10px'}} href={guideUrl}>
            View Cancellation Guide
          </Button>
        )}
      </Section>
    </EmailLayout>
  );
};

export default RenewalReminder;
