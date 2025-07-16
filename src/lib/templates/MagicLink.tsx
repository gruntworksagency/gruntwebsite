import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface MagicLinkEmailProps {
  url: string;
  email?: string;
  brandName?: string;
  logoUrl?: string;
}

export const MagicLinkEmail = ({
  url,
  email,
  brandName = "Gruntworks Agency",
  logoUrl,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Your secure sign-in link for {brandName}</Preview>
    <Body style={main}>
      <Container style={container}>
        {logoUrl && (
          <Section style={logoSection}>
            <Img src={logoUrl} width="120" height="36" alt={brandName} />
          </Section>
        )}
        
        <Section style={section}>
          <Text style={heading}>Sign in to {brandName}</Text>
          
          <Text style={text}>
            Click the button below to securely sign in to your account.
            {email && ` This link is valid for the email address: ${email}`}
          </Text>
          
          <Button style={button} href={url}>
            Sign In Securely
          </Button>
          
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          
          <Link href={url} style={link}>
            {url}
          </Link>
          
          <Text style={footer}>
            This link will expire in 15 minutes for security reasons.
            If you didn't request this sign-in link, you can safely ignore this email.
          </Text>
        </Section>
        
        <Section style={footerSection}>
          <Text style={footerText}>
            © 2024 {brandName}. All rights reserved.
          </Text>
          <Text style={footerText}>
            You received this email because you requested to sign in to your account.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "30px",
  paddingTop: "20px",
};

const section = {
  padding: "0 40px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "30px 0 20px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "5px",
  color: "#fff",
  display: "block",
  fontSize: "16px",
  fontWeight: "600",
  textAlign: "center" as const,
  textDecoration: "none",
  width: "100%",
  padding: "12px 20px",
  margin: "20px 0",
};

const link = {
  color: "#3b82f6",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "30px 0 0 0",
};

const footerSection = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "40px",
  paddingTop: "20px",
  padding: "20px 40px 0 40px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "8px 0",
  textAlign: "center" as const,
};

export default MagicLinkEmail; 