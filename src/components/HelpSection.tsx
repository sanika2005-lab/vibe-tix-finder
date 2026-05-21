import { useState } from "react";
import { HelpCircle, MessageCircleQuestion, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I book a ticket?",
    a: "Tap any event card, fill in your name and email, then either confirm (for free events) or scan the UPI QR and enter your UTR/Transaction ID to confirm paid bookings.",
  },
  {
    q: "When will I receive my confirmation email?",
    a: "For paid events, the confirmation email is sent only after your UTR is successfully verified. Free events trigger the email immediately on registration.",
  },
  {
    q: "What is a UTR / Transaction ID?",
    a: "It's a 12–22 character reference shown in your UPI app (PhonePe, Google Pay, Paytm) right after the payment succeeds. We use it to verify your payment instantly.",
  },
  {
    q: "I paid but didn't get the email — what now?",
    a: "Re-open the event, paste the UTR from your UPI app and tap 'I have paid' again. If it still fails, send us a message below with the UTR and event name.",
  },
  {
    q: "Can I get a refund or transfer my ticket?",
    a: "Refunds depend on the organizer's policy listed on each event. For transfers, drop us a question below with your ticket ID and we'll help out.",
  },
  {
    q: "How do I download my ticket?",
    a: "Go to your Dashboard, open the ticket and tap the download button to save it as an image or PDF with the QR code.",
  },
];

const SUPPORT_EMAIL = "support@vibetix.app";

export const HelpSection = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !question.trim()) return;

    const subject = encodeURIComponent(`VibeTix support: question from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nQuestion:\n${question.trim()}\n\n— Sent from VibeTix Help`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    toast({
      title: "Question sent ✉️",
      description: "Our team replies within a few hours on working days.",
    });
    setName("");
    setQuestion("");
  };

  return (
    <section id="help" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-gradient-soft px-4 py-1.5 text-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Customer Help
        </div>
        <h2 className="text-4xl font-bold md:text-5xl">We've got your back</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Quick answers to common questions — or ask us anything and we'll reply by email.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-5">
        {/* FAQ */}
        <Card className="bg-gradient-card p-6 shadow-card lg:col-span-3 lg:p-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Frequently asked</h3>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Ask a question */}
        <Card className="bg-gradient-card p-6 shadow-card lg:col-span-2 lg:p-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-vibrant text-primary-foreground shadow-glow">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Ask a question</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="help-name">Your name</Label>
              <Input
                id="help-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-email">Email</Label>
              <Input
                id="help-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-question">Question</Label>
              <Textarea
                id="help-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="How can we help?"
                required
                rows={4}
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-full">
              <Send className="mr-2 h-4 w-4" />
              Send question
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              We reply to{" "}
              <span className="font-medium text-foreground">{SUPPORT_EMAIL}</span> within a few hours.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
};
