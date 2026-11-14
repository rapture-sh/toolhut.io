import { Contribute } from "~/components/sections/contribute";
import { Faq } from "~/components/sections/faq";
import { HowItWorks } from "~/components/sections/how-it-works";
import { WhyLocal } from "~/components/sections/why-local";

/** The tail of every page: the argument, the proof, the questions, the ask. */
export function SiteSections() {
  return (
    <>
      <WhyLocal />
      <HowItWorks />
      <Faq />
      <Contribute />
    </>
  );
}
