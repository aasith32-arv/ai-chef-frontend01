"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/providers/language-provider";

type StepsAccordionProps = {
  steps: string[];
};

export function StepsAccordion({ steps }: StepsAccordionProps) {
  const { t } = useLanguage();

  return (
    <section className="card-premium p-5 sm:p-6">
      <h2 className="text-2xl font-extrabold tracking-tight">
        {t("steps.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground md:hidden">
        {t("steps.mobileHint")}
      </p>

      <div className="mt-4 md:hidden">
        <Accordion type="single" collapsible defaultValue="step-0">
          {steps.map((step, index) => (
            <AccordionItem key={index} value={`step-${index}`}>
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  {t("steps.step")} {index + 1}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-10 text-muted-foreground leading-relaxed">
                {step}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <ol className="mt-4 hidden space-y-4 md:block">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <p className="pt-1 leading-relaxed text-foreground/90">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
