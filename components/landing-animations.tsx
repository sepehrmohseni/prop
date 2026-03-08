"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, BarChart3, Globe, Sparkles, Lock, Smartphone } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/motion";

const features = [
  {
    icon: BarChart3,
    title: "Track Everything",
    description: "Real estate, vehicles, investments, collectibles, crypto — all in one place.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "Assets in any currency with automatic conversion to your base currency.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Smart categorization, portfolio insights, and data quality suggestions.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays yours. Row-level security ensures complete privacy.",
  },
  {
    icon: Lock,
    title: "Full Control",
    description: "Manual valuations you trust. No black-box pricing — you set the values.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Installable PWA that works beautifully on desktop, tablet, and mobile.",
  },
];

export function LandingAnimations() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text"
          >
            Know what you own.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            Prop is a personal asset tracker for people who want a clear, honest picture of their
            net worth — across every category, currency, and country.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Tracking
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg border border-input bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to track your wealth
            </h2>
            <p className="mt-4 text-muted-foreground">
              Simple, private, and built for real people — not financial institutions.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative rounded-2xl border bg-background p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Your data, your rules
            </h2>
            <p className="mt-4 text-muted-foreground">
              No ads. No data selling. No third-party tracking. Prop is a tool you own,
              not a service that owns you.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-10"
            >
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Free Account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
