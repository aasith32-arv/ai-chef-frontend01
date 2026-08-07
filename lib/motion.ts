"use client";

import type { Transition, Variants } from "framer-motion";

/** Shared motion presets — gate with useReducedMotion where needed. */
export const easeOutSoft = [0.22, 1, 0.36, 1] as const;

export const transitionSoft: Transition = {
  duration: 0.45,
  ease: easeOutSoft,
};

export const transitionSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: transitionSoft },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: transitionSoft },
};

export function staggerDelay(index: number, base = 0.04) {
  return { delay: index * base };
}
