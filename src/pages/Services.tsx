import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowRight, Globe, Settings, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const Services = () => {
  const services = [
    { title: "Web Design Services", description: "Professional websites delivered within 7 days", features: ["5-15 Pages", "Mobile Responsive", "SEO Optimized", "Fast Delivery"], startingPrice: "R2,000", link: "/services/web-design", icon: <Globe className="h-6 w-6" /> },
    { title: "Google Business Profile", description: "Get found on Google Maps & Search", features: ["Profile Setup & Optimization", "Google Maps Listing", "Review Management", "Local SEO Boost"], startingPrice: "R750", link: "/contact", icon: <Zap className="h-6 w-6" /> },
    { title: "Website Maintenance", description: "Keep your website running smoothly", features: ["Security Updates", "Bug Fixes", "Performance Monitoring", "Content Updates"], startingPrice: "R1,500/month", link: "/contact", icon: <Settings className="h-6 w-6" /> },
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
              <Zap className="h-3.5 w-3.5" /> Professional digital solutions
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              Complete
              <br />
              <span className="gradient-text">Digital Services</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              We deliver high-quality web design solutions tailored to your business needs.
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

      {/* Services */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Our Digital Services</h2>
            <p className="text-lg text-muted-foreground">Choose the perfect service for your business needs</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="p-8 rounded-3xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-foreground mb-5">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <div className="text-2xl font-bold text-primary mb-6">Starting at {service.startingPrice}</div>
                <ul className="space-y-3 mb-6">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full h-11 text-sm font-medium gap-2" asChild>
                  <Link to={service.link}>Learn More <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Full Pricing Breakdown</h2>
            <p className="text-lg text-muted-foreground">Transparent pricing for all our services</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              { name: "Essential Single Page", price: "R2,000", delivery: "1-2 Days", features: ["Single Page Website", "Mobile Responsive", "Google Business Profile", "Contact Form"] },
              { name: "Starter Business", price: "R5,000", delivery: "3-4 Days", features: ["5 Pages", "Mobile Responsive", "Contact Form", "Basic SEO Setup", "1 Month Support"] },
              { name: "Professional Growth", price: "R10,000", delivery: "5-7 Days", popular: true, features: ["10 Pages", "Blog Setup", "Advanced SEO", "Social Media Integration", "3 Months Support", "CMS"] },
              { name: "Enterprise Custom", price: "R15,000+", delivery: "7-10 Days", features: ["Unlimited Pages", "E-commerce Integration", "Advanced Analytics", "Priority Support", "6 Months Support"] },
            ].map((pkg, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className={`relative p-6 rounded-3xl border transition-all duration-500 ${pkg.popular ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]" : "border-border/30 hover:border-primary/20"}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">Most Popular</span>
                )}
                <div className="text-center pb-4 pt-2">
                  <h3 className="text-base font-semibold">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-primary mt-1">{pkg.price}</div>
                  <span className="inline-block mt-2 text-xs rounded-full bg-muted px-3 py-1 text-muted-foreground">Delivery: {pkg.delivery}</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-3.5 w-3.5 text-primary mr-2 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full h-10 text-sm" variant={pkg.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Website Maintenance Packages</h2>
            <p className="text-lg text-muted-foreground">Keep your website running smoothly</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Basic", price: "R1,500/month", features: ["Security Updates", "Monthly Backups", "Bug Fixes", "Email Support"] },
              { name: "Standard", price: "R3,000/month", popular: true, features: ["Everything in Basic", "Content Updates", "Performance Monitoring", "Priority Support", "Weekly Backups"] },
              { name: "Premium", price: "R5,000/month", features: ["Everything in Standard", "SEO Monitoring", "Analytics Reports", "24/7 Support", "Daily Backups", "Feature Enhancements"] },
            ].map((pkg, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className={`relative p-6 rounded-3xl border transition-all duration-500 ${pkg.popular ? "border-primary ring-1 ring-primary/20 bg-primary/[0.03]" : "border-border/30 hover:border-primary/20"}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">Most Popular</span>
                )}
                <div className="text-center pb-4 pt-2">
                  <h3 className="text-base font-semibold">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-primary mt-1">{pkg.price}</div>
                </div>
                <ul className="space-y-2 mb-4">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-3.5 w-3.5 text-primary mr-2 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full h-10 text-sm" variant={pkg.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
