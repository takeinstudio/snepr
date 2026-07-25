import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/delete-account")({
  component: DeleteAccountPage,
  head: () => ({
    meta: [
      { title: "Account Deletion | Snepr" },
      { name: "description", content: "Request deletion of your Snepr account and associated data." }
    ],
  }),
});

function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24 font-sans bg-[#FDFBF7] text-[#1C1613]">
      <div className="mb-12 border-b border-[#E5E0D8] pb-6">
        <h1 className="mb-4 text-4xl font-serif tracking-tight text-[#1C1613] sm:text-5xl">
          Account Deletion Request
        </h1>
        <p className="text-sm text-[#6E6761]">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg mx-auto text-[#6E6761] space-y-6 leading-relaxed">
        <p>
          At Snepr, we value your privacy and control over your personal data. If you no longer wish to use our services, you can request the deletion of your account and all associated personal data.
        </p>

        <section className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-xs">
          <h2 className="mb-3 text-xl font-serif font-bold text-[#1C1613]">
            How to Request Account Deletion
          </h2>
          <p className="mb-4">
            You can request your account and associated data to be deleted in one of the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>In-App Deletion:</strong> Log into the Snepr mobile app, navigate to <strong>Profile &gt; Account Settings &gt; Delete Account</strong> and confirm your request.
            </li>
            <li>
              <strong>Email Request:</strong> Send an email from your registered email address to{" "}
              <a href="mailto:support@snepr.in" className="text-[#D4A373] underline font-medium">
                support@snepr.in
              </a>{" "}
              with the subject line <strong>"Account Deletion Request"</strong>. Please include your username or registered phone number.
            </li>
          </ul>
        </section>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">What happens when you delete your account?</h2>
        <p>
          Once your deletion request is processed:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your personal profile information (name, email, phone number, password hash) will be permanently deleted from our servers.</li>
          <li>Your salon business settings and operator details (if you are a salon owner/staff) will be removed.</li>
          <li>Any active live queue positions or future appointment bookings associated with your account will be cancelled immediately.</li>
        </ul>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">Data Retention</h2>
        <p>
          Please note that we may retain certain transactional or operational records (such as completed booking history, invoices, and financial ledger data) where required by applicable local laws and tax regulations. This retained data will be completely anonymized and will not be linked back to any personally identifiable information.
        </p>

        <h2 className="mb-3 mt-8 text-2xl font-serif text-[#1C1613]">Processing Time</h2>
        <p>
          Email deletion requests are usually verified and completed within <strong>48 to 72 hours</strong>. In-app deletion requests are processed immediately. You will receive an email confirmation once the process is complete.
        </p>

        <div className="pt-8 border-t border-[#E5E0D8] text-xs text-[#8E867E]">
          If you have any questions regarding your data privacy, please reach out to us at{" "}
          <a href="mailto:support@snepr.in" className="text-[#D4A373] underline">
            support@snepr.in
          </a>
        </div>
      </div>
    </div>
  );
}
