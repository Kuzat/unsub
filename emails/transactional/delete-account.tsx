import React from "react";
import { Text, Section, Button, Link } from "@react-email/components";
import { 
  EmailLayout, 
  paragraph, 
  buttonContainer, 
  button, 
  linkText, 
  link, 
  warningText 
} from "../components/email-layout";

interface DeleteAccountProps {
  /** The verification url for account deletion */
  url: string;
  /** The user's email address */
  email: string;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ url, email }) => {
  return (
    <EmailLayout
      previewText="Confirm your account deletion request"
      heading="Account Deletion Request"
    >
      <Text style={paragraph}>Hi there,</Text>
      <Text style={paragraph}>
        We received a request to delete your Unsub account associated with {email}.
        To confirm this request and permanently delete your account, please click
        the button below.
      </Text>

      <Section style={buttonContainer}>
        <Button style={{...button, backgroundColor: "#ef4444"}} href={url}>
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
    </EmailLayout>
  );
};

export default DeleteAccount;