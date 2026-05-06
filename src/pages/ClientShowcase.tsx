import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const ClientShowcase = () => {
  const clientLogos = [
    "Home of Accounting Consulting", "Katthales Holdings", "H&N House of Beauty", "Lumavu Trading Enterprises",
    "GT Testing Civil & Construction", "KTL Makeup Glam", "908 Event-Quip Hire", "MusicEar",
  ];

  const testimonials = [
    { quote: "They built our first website 3 years ago and built our new one now. Seamless procedure, always a phone call away and beautiful work as always. Definitely the best around.", author: "H & N House of Beauty" },
    { quote: "I had such a great experience with Architeq. They made the whole process of building my website super easy and enjoyable, and the final result looks amazing. The site is clean, simple to use, and exactly what I wanted.", author: "Kebogile Mokgoebo" },
    { quote: "Best services and a Great Web Agency I can recommend. I've gotten the best service and the best outcome, everything running smoothly to the tea.", author: "PHILLY JAROAM" },
  ];

  const stats = [
    { value: "50+", label: "Projects Completed" },
    { value: "100%", label: "Client Satisfaction" },
    { value: "7", label: "Days Average Delivery" },
    { value: "24/7", label: "Support Available" },
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">Our Clients</span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              Trusted By
              <br />
              <span className="gradient-text">Businesses</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              See how we've helped businesses transform their online presence and achieve remarkable results.
            </p>
            <Button asChild className="rounded-full h-12 px-7 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2">
              <Link to="/contact">Join Our Success Stories <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight">Proud to Work With</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {clientLogos.map((logo, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="h-16 flex items-center justify-center rounded-2xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <span className="text-xs font-medium text-muted-foreground">{logo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">See from our clients</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What Our Clients Say</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">5.0 on Google</span>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="p-8 rounded-3xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed mb-6 text-foreground/80">"{t.quote}"</blockquote>
                <div className="border-t border-border/30 pt-4">
                  <div className="font-semibold text-sm">{t.author}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Verified Google Review</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className={`py-16 text-center ${index < 3 ? "border-r border-border/30" : ""} ${index < 2 ? "max-lg:border-b max-lg:border-border/30" : ""}`}
              >
                <div className="text-4xl lg:text-5xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientShowcase;
