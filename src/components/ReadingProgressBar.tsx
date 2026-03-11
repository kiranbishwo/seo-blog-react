import { motion, useScroll, useSpring } from "motion/react";

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-16 left-0 right-0 h-1 bg-[var(--site-primary)] origin-left z-50"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
