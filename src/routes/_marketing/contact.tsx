import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/_marketing/contact")({
  component: ContactPage,
  head: () => ({
    meta: [{ title: "Contact Us | Snepr" }],
  }),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Sending message...",
        success: "Message sent! We'll get back to you shortly.",
        error: "Failed to send message.",
      }
    );
    form.reset();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-16 max-w-2xl">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Get in touch
        </h1>
        <p className="text-lg text-ink-soft">
          Have questions about Snepr? Whether you're a salon owner looking to partner with us or a user needing help, our team is here for you.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        {/* Contact Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="How can we help?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="mb-6 text-xl font-semibold text-ink">Contact Information</h3>
            <div className="space-y-6 text-ink-soft">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-ink">Email Us</p>
                  <a href="mailto:hello@snepr.in" className="hover:text-primary">hello@snepr.in</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-ink">Call Us</p>
                  <p>Mon-Fri from 9am to 6pm</p>
                  <a href="tel:+919876543210" className="hover:text-primary">+91 98765 43210</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-ink">HQ</p>
                  <p>Bhubaneswar<br />Odisha, India</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl bg-surface p-6 sm:p-8">
            <h3 className="mb-2 text-lg font-semibold text-ink">For Salon Owners</h3>
            <p className="mb-4 text-sm text-ink-soft">
              Want to see Snepr in action? Schedule a quick 15-minute demo with our team to see how we can help manage your queues.
            </p>
            <Button variant="outline" className="w-full" onClick={() => toast("Demo scheduling coming soon!")}>
              Book a Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
