import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { siteConfig } from "~/config/site";

const QUESTIONS = [
  {
    q: "Is it really private?",
    a: "Yes, and you do not have to take our word for it. Open your network tab while you use a tool: nothing leaves the page. The source is public, so you can read what each tool does before you use it.",
  },
  {
    q: "Does it work offline?",
    a: "Once the page has loaded, every tool keeps working without a connection. Aeroplane mode is a fine way to test the claim for yourself.",
  },
  {
    q: "Is there a file size limit?",
    a: "There is no server limit, because there is no server. The practical ceiling is your own memory, and heavy work runs in a Web Worker so the page stays responsive.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. toolhut is MIT licensed, with no accounts, no sign up wall and no analytics collecting what you do here.",
  },
  {
    q: "Can I self-host it?",
    a: "Yes. It is a static site, so clone the repository, build it and serve the output anywhere, including your own machine or an internal network.",
  },
  {
    q: "How do I request a tool?",
    a: "Open an issue. Tools that plenty of people reach for and that can run fully in a browser are the ones most likely to get built.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-44"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
            Answers to your questions
          </h2>
          <p className="mt-5 text-[15px] leading-[1.7] text-muted-foreground">
            Need anything else?{" "}
            <a
              href={siteConfig.links.issues}
              className="text-primary underline underline-offset-4"
            >
              Ask on GitHub
            </a>
            .
          </p>
        </div>
        <Accordion type="single" collapsible>
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
