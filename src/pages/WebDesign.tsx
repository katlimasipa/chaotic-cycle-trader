import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Users, Settings, Phone, Zap, ArrowUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const WebDesign = () => {
  const packages = [
    { name: "Essential Single Page", price: "R2,000", description: "Perfect for getting started", features: ["Single Page Website", "Mobile Responsive", "Google Business Profile", "Contact Form"], deliveryTime: "1-2 Days" },
    { name: "Starter Business", price: "R5,000", description: "For small businesses", features: ["5 Pages", "Mobile Responsive", "Contact Form", "Google Business Profile", "Basic SEO Setup", "1 Month Support"], deliveryTime: "3-4 Days" },
    { name: "Professional Growth", price: "R10,000", description: "Most Popular", features: ["10 Pages", "Blog Setup", "Advanced SEO", "Social Media Integration", "Analytics Setup", "3 Months Support", "CMS"], deliveryTime: "5-7 Days", popular: true },
    { name: "Enterprise Custom", price: "R15,000+", description: "Complete solution", features: ["Unlimited Pages", "E-commerce Integration", "Advanced Analytics", "Priority Support", "Custom Features", "6 Months Support", "Performance Optimization"], deliveryTime: "7-10 Days" },
  ];

  const whyChooseUs = [
    { icon: <Calendar className="h-6 w-6" />, title: "Delivered Within 7 Days", description: "Fast turnaround without compromising quality" },
    { icon: <Users className="h-6 w-6" />, title: "Conversion-Focused", description: "Designed to turn visitors into customers" },
    { icon: <Settings className="h-6 w-6" />, title: "Client-First Approach", description: "Your success is our priority" },
    { icon: <Phone className="h-6 w-6" />, title: "Dedicated Support", description: "Personal support throughout your project" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-28 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
              <Zap className="h-3.5 w-3.5" /> Professional websites within 7 days
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              Professional
              <br />
              <span className="gradient-text">Web Design</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              We create high-performing websites using modern tools like Framer, Figma, and Airtable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full h-12 px-7 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2">
                <Link to="/contact">Get Started Today <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 px-7 text-sm font-medium gap-2">
                <a href="https://www.instagram.com/architeqwebagency/" target="_blank" rel="noopener noreferrer">
                  See Our Work <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Choose Your Perfect Package</h2>
            <p className="text-lg text-muted-foreground">Transparent pricing, no hidden fees, guaranteed delivery</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className={`relative p-8 rounded-3xl border transition-all duration-500 ${pkg.popular ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]" : "border-border/30 hover:border-primary/20"}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">Most Popular</span>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-semibold">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-primary mt-2 mb-1">{pkg.price}</div>
                  <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                  <span className="inline-block text-xs rounded-full bg-muted px-3 py-1 text-muted-foreground">Delivery: {pkg.deliveryTime}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full h-11 text-sm font-medium" variant={pkg.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">Choose This Package</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Web Support */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ongoing Web Support</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5" /> First Month Free on All Support Packages
            </span>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { name: "Essential Support", price: "R1,500/month", features: ["Monthly security updates", "Basic bug fixes", "Performance monitoring", "Email support", "Monthly backup"] },
              { name: "Premium Support", price: "R3,500/month", popular: true, features: ["Weekly security updates", "Priority bug fixes", "Advanced optimization", "Phone & email support", "Weekly backup", "Content updates", "SEO monitoring"] },
            ].map((pkg, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className={`relative p-8 rounded-3xl border transition-all duration-500 ${pkg.popular ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]" : "border-border/30 hover:border-primary/20"}`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-primary mt-1">{pkg.price}</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full h-11 text-sm font-medium" variant={pkg.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Why Choose Architeq?</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyChooseUs.map((item, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="p-6 rounded-3xl border border-border/30 hover:border-primary/20 transition-all duration-500 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-foreground mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebDesign;
