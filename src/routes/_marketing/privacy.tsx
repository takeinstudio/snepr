import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Snepr" },
      { name: "description", content: "Privacy Policy for Snepr app and salon services." }
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24 font-sans bg-[#FDFBF7] text-[#1C1613]">
      <div className="mb-12 border-b border-[#E5E0D8] pb-6">
        <h1 className="mb-4 text-4xl font-serif tracking-tight text-[#1C1613] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#6E6761]">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg mx-auto text-[#6E6761] space-y-6 leading-relaxed">
        <p>
          At Snepr, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
        </p>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">1. Information We Collect</h2>
        <p>
          We may collect information about you in a variety of ways. The information we may collect includes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register or when you choose to participate in various activities related to the Application.</li>
          <li><strong>Location Data:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using our Application, to provide certain location-based services (like finding nearby salons).</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
        </ul>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">2. Use of Your Information</h2>
        <p>
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Create and manage your account.</li>
          <li>Compile anonymous statistical data and analysis for use internally.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions to you.</li>
          <li>Email you regarding your account or order.</li>
          <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Application.</li>
          <li>Increase the efficiency and operation of the Application.</li>
          <li>Notify you of updates to the Application.</li>
          <li>Request feedback and contact you about your use of the Application.</li>
        </ul>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">3. Account & Data Deletion</h2>
        <p>
          You have the right to request deletion of your account and associated data at any time. For detailed instructions on how to request deletion and what data is removed, please visit our dedicated{" "}
          <a href="/delete-account" className="text-[#D4A373] underline font-medium">
            Account Deletion page
          </a>.
        </p>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">4. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at:
          <br />
          Email: <a href="mailto:support@snepr.in" className="text-[#D4A373] underline">support@snepr.in</a>
        </p>
      </div>
    </div>
  );
}
