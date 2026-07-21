import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
  head: () => ({
    meta: [{ title: "Terms of Service — Snepr" }],
  }),
});

function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Terms of Service
        </h1>
        <p className="text-sm text-ink-soft">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg mx-auto text-ink-soft">
        <p className="mb-6">
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Snepr ("we," "us" or "our"), concerning your access to and use of our application and website.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">1. Acceptance of Terms</h2>
        <p className="mb-6">
          By accessing or using Snepr, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">2. Description of Service</h2>
        <p className="mb-6">
          Snepr provides a digital queue management and wait time tracking system for salons and their customers. We are not responsible for the actual services provided by the salons listed on our platform. Wait times are estimates and not guarantees. Salons reserve the right to manage their queues as they see fit.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">3. User Accounts</h2>
        <p className="mb-6">
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>
        <p className="mb-6">
          You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">4. Limitation of Liability</h2>
        <p className="mb-6">
          In no event shall Snepr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">5. Changes to Terms</h2>
        <p className="mb-6">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>

        <h2 className="mb-4 mt-8 text-2xl font-bold text-ink">6. Contact Us</h2>
        <p className="mb-6">
          If you have any questions about these Terms, please contact us at:
          <br />
          Email: hello@snepr.in
        </p>
      </div>
    </div>
  );
}
