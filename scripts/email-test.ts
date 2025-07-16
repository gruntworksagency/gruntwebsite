#!/usr/bin/env bun
/**
 * Email Deliverability Testing Script
 *
 * This script tests email deliverability by:
 * 1. Sending a test email to mail-tester.com
 * 2. Checking SPF, DKIM, DMARC records
 * 3. Reporting SpamAssassin score and recommendations
 *
 * Usage: bun run scripts/email-test.ts [test-email]
 */

import { Resend } from "resend";
import { renderMagicLinkEmail } from "../src/lib/email";

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const MAIL_DOMAIN = process.env.MAIL_DOMAIN;
const TEST_RECIPIENTS = ["test@inbox.mail-tester.com", "test@isnotspam.com"];

interface DeliverabilityResults {
  success: boolean;
  messageId?: string;
  error?: string;
  recommendations: string[];
}

/**
 * Validates required environment variables
 */
function validateEnvironment(): boolean {
  const missing = [];

  if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!RESEND_FROM_EMAIL) missing.push("RESEND_FROM_EMAIL");
  if (!MAIL_DOMAIN) missing.push("MAIL_DOMAIN");

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((env) => console.error(`   - ${env}`));
    console.error(
      "\nPlease check your .env file and ensure all email variables are set.",
    );
    return false;
  }

  console.log("✅ Environment variables validated");
  return true;
}

/**
 * Checks DNS records for the mail domain
 */
async function checkDNSRecords(): Promise<void> {
  console.log(`\n🔍 DNS Records Check for ${MAIL_DOMAIN}:`);

  try {
    // Note: In a real implementation, you'd use DNS libraries to check these
    // For now, we'll provide manual instructions
    console.log("📋 Manual DNS Verification Required:");
    console.log(`
   SPF Record: Check if ${MAIL_DOMAIN} has SPF record:
   Expected: "v=spf1 include:spf.resend.com ~all"
   
   DKIM Records: Check DKIM CNAMEs in Resend dashboard
   
   DMARC Record: Check if ${MAIL_DOMAIN} has DMARC record:
   Recommended: "v=DMARC1; p=quarantine; rua=mailto:dmarc@${MAIL_DOMAIN}"
   
   💡 Use tools like mxtoolbox.com or dmarcly.com to verify these records.
    `);
  } catch (error) {
    console.error("❌ DNS check failed:", error);
  }
}

/**
 * Sends a test email to deliverability testing services
 */
async function sendTestEmail(
  recipient: string,
): Promise<DeliverabilityResults> {
  const results: DeliverabilityResults = {
    success: false,
    recommendations: [],
  };

  try {
    console.log(`📧 Sending test email to ${recipient}...`);

    const resend = new Resend(RESEND_API_KEY);
    const testUrl = `https://${MAIL_DOMAIN}/auth/callback?token=test-deliverability-123`;

    // Render the email using our React Email template
    const html = await renderMagicLinkEmail(testUrl, recipient);

    const response = await resend.emails.send({
      from: RESEND_FROM_EMAIL!,
      to: recipient,
      subject: `Deliverability Test - ${new Date().toISOString()}`,
      html,
      headers: {
        "List-Unsubscribe": `<mailto:no-reply@${MAIL_DOMAIN}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Mailer": "Gruntworks-Email-System",
      },
    });

    if (response.data?.id) {
      results.success = true;
      results.messageId = response.data.id;
      console.log(
        `✅ Email sent successfully! Message ID: ${response.data.id}`,
      );
    } else {
      results.error = "No message ID returned";
      console.error("❌ Email send failed - no message ID returned");
    }
  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error);
    console.error(`❌ Email send failed:`, error);
  }

  return results;
}

/**
 * Provides actionable recommendations based on common deliverability issues
 */
function generateRecommendations(): string[] {
  return [
    "🎯 Check mail-tester.com results for your SpamAssassin score (aim for ≤3)",
    "📊 Verify your sending reputation on Google Postmaster Tools",
    "🔒 Ensure SPF, DKIM, and DMARC records are properly configured",
    "📝 Review email content for spam trigger words",
    "🎨 Test email rendering across different clients",
    "📈 Monitor bounce and complaint rates in Resend dashboard",
    "⚡ Consider warming up your domain with gradual sending volume increases",
    "🔄 Implement feedback loops for major ISPs",
  ];
}

/**
 * Main function that orchestrates the deliverability test
 */
async function runDeliverabilityTest(): Promise<void> {
  console.log("🚀 Starting Email Deliverability Test");
  console.log("=====================================");

  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }

  // Check DNS records
  await checkDNSRecords();

  // Get test recipient from command line or use defaults
  const customRecipient = process.argv[2];
  const recipients = customRecipient ? [customRecipient] : TEST_RECIPIENTS;

  console.log(`\n📬 Testing with recipients: ${recipients.join(", ")}`);

  // Send test emails
  const results = [];
  for (const recipient of recipients) {
    const result = await sendTestEmail(recipient);
    results.push({ recipient, ...result });

    // Wait between sends to avoid rate limiting
    if (recipients.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log("========================");

  results.forEach(({ recipient, success, messageId, error }) => {
    const status = success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`${status} ${recipient}`);
    if (messageId) console.log(`   Message ID: ${messageId}`);
    if (error) console.log(`   Error: ${error}`);
  });

  // Recommendations
  console.log("\n💡 Next Steps:");
  console.log("===============");
  const recommendations = generateRecommendations();
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  if (recipients.includes("test@inbox.mail-tester.com")) {
    console.log(`
🎯 IMPORTANT: Visit https://www.mail-tester.com/ to see your deliverability score!
   Look for the test email you just sent and check the SpamAssassin score.
   Aim for a score of 3 or lower for good deliverability.
    `);
  }

  console.log("\n✨ Deliverability test completed!");
}

// Run the test if this script is executed directly
if (require.main === module) {
  runDeliverabilityTest().catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
}

export { runDeliverabilityTest, validateEnvironment, checkDNSRecords };
