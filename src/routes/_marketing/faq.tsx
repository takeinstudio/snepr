import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/faq")({
  component: FAQPage,
  head: () => ({
    meta: [{ title: "FAQ | Snepr" }],
  }),
});

const faqs = [
  {
    question: "What is Snepr?",
    answer:
      "Snepr is a live waitlist and queue management application for salons. It allows customers to see live wait times, join a queue from their phone, and walk straight into the salon when it's their turn.",
  },
  {
    question: "Do I need to download an app?",
    answer:
      "No! Snepr works directly in your web browser. You can access all features without downloading anything, though we recommend adding it to your home screen for easy access.",
  },
  {
    question: "Is Snepr free for customers?",
    answer:
      "Yes, Snepr is completely free for customers to use. You'll never be charged for checking wait times or joining a queue.",
  },
  {
    question: "How do I know when it's my turn?",
    answer:
      "When you join a queue, you'll see your live position. You can track your estimated wait time in real-time. We'll also notify you when you're next in line so you can head to the salon.",
  },
  {
    question: "I'm a salon owner. How do I get Snepr?",
    answer:
      "We'd love to have you! You can head over to our Contact page to book a quick 15-minute demo, or click the 'Get Snepr for your salon' button on our homepage to express your interest.",
  },
  {
    question: "What happens if I'm late for my turn?",
    answer:
      "Salons typically have a grace period (usually 5-10 minutes). If you miss your grace period, you may be moved down the queue or removed, depending on the individual salon's policy.",
  }
];

function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-ink-soft">
          Everything you need to know about Snepr and how it works.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-ink hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-ink-soft">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="mt-16 text-center">
        <p className="mb-4 text-lg text-ink-soft">Still have questions?</p>
        <Button asChild size="lg">
          <Link to="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
