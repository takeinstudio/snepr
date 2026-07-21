import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [{ title: "Privacy Policy | Snepr" }],
  }),
});

function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-ink-soft">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg mx-auto text-ink-soft">
        <p className="mb-6">
          At Snepr, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">1. Information We Collect</h2>
        <p className="mb-6">
          We may collect information about you in a variety of ways. The information we may collect includes:
        </p>
        <ul className="mb-6 list-disc pl-6">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register or when you choose to participate in various activities related to the Application.</li>
          <li><strong>Location Data:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using our Application, to provide certain location-based services (like finding nearby salons).</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">2. Use of Your Information</h2>
        <p className="mb-6">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
        </p>
        <ul className="mb-6 list-disc pl-6">
          <li>Create and manage your account.</li>
          <li>Compile anonymous statistical data and analysis for use internally.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions to you.</li>
          <li>Email you regarding your account or order.</li>
          <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Application.</li>
          <li>Increase the efficiency and operation of the Application.</li>
          <li>Notify you of updates to the Application.</li>
          <li>Request feedback and contact you about your use of the Application.</li>
        </ul>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">3. Contact Us</h2>
        <p className="mb-6">
          If you have questions or comments about this Privacy Policy, please contact us at:
          <br />
          Email: hello@snepr.in
        </p>
      </div>
    </div>
  );
}
