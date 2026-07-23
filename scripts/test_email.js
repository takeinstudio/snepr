import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function runTest() {
  console.log("--- Testing Brevo SMTP Delivery ---");
  
  // Test 1: From Brevo Login User
  try {
    console.log("Test 1: Sending from login user (b2fb80001@smtp-brevo.com)...");
    const info1 = await transporter.sendMail({
      from: { name: 'Snepr Support', address: 'b2fb80001@smtp-brevo.com' },
      replyTo: { name: 'Snepr Support', address: 'b2fb80001@smtp-brevo.com' },
      sender: { name: 'Snepr Support', address: 'b2fb80001@smtp-brevo.com' },
      to: 'aayojana15@gmail.com',
      subject: 'Test 1: Brevo Verified Sender Test',
      html: '<h2>Test 1 Passed!</h2><p>This email was sent using Brevo verified sender login.</p>'
    });
    console.log("Test 1 Success! Message ID:", info1.messageId, "Response:", info1.response);
  } catch (err) {
    console.error("Test 1 Error:", err.message);
  }

  // Test 2: From Custom Domain (support@snepr.in)
  try {
    console.log("\nTest 2: Sending from custom domain (support@snepr.in)...");
    const info2 = await transporter.sendMail({
      from: { name: 'Snepr Support', address: 'support@snepr.in' },
      replyTo: { name: 'Snepr Support', address: 'support@snepr.in' },
      sender: { name: 'Snepr Support', address: 'support@snepr.in' },
      to: 'aayojana15@gmail.com',
      subject: 'Test 2: Custom Domain Sender Test',
      html: '<h2>Test 2 Passed!</h2><p>This email was sent using custom domain support@snepr.in.</p>'
    });
    console.log("Test 2 Success! Message ID:", info2.messageId, "Response:", info2.response);
  } catch (err) {
    console.error("Test 2 Error:", err.message);
  }
}

runTest();
