"use client";

import { motion, type Variants } from "framer-motion";
import { type ComponentPropsWithoutRef } from "react";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const numberPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

interface MotionDivProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
}

export function FadeIn({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: MotionDivProps) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({ value, className }: { value: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

export function AnimatedCard({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
