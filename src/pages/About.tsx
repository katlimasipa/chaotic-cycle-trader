import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowRight, Calendar, Users, Settings, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const About = () => {
  const values = [
    { icon: <Calendar className="h-6 w-6" />, title: "Speed & Efficiency", description: "We deliver and launch websites within 7 days, without compromising quality." },
    { icon: <Users className="h-6 w-6" />, title: "Client-First Approach", description: "Your success is our priority. We listen, understand, and deliver exactly what you need." },
    { icon: <Settings className="h-6 w-6" />, title: "Modern Technology", description: "Using cutting-edge tools to build scalable, maintainable solutions." },
  ];

  const timeline = [
    { year: "2022", title: "Founded Architeq", description: "Started with a vision to make professional web development accessible to all businesses." },
    { year: "2023", title: "First 10 Clients", description: "Delivered outstanding websites and established our reputation for speed and quality." },
    { year: "2024", title: "Service Expansion", description: "Expanded services and grew our client base across multiple industries." },
    { year: "2025", title: "50+ Projects", description: "Growing strong with over 50 successful projects and 100% client satisfaction rate." },
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">About Us</span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              We craft digital
              <br />
              <span className="gradient-text">experiences</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              A solo no-code web agency passionate about helping businesses grow online — affordably, professionally, and fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full h-12 px-7 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2">
                <Link to="/contact">Work With Us <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 px-7 text-sm font-medium gap-2">
                <Link to="/portfolio">See Our Work <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">Our Story</h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>Architeq Web Agency was born from a simple observation: too many businesses struggle with expensive, slow, and complex web development processes.</p>
                <p>We saw talented entrepreneurs held back by outdated development approaches that took months and cost fortunes. There had to be a better way.</p>
                <p>Today, we've helped over 50 businesses transform their online presence, delivering and launching websites within 7 days.</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <div className="p-10 rounded-3xl border border-border/30 bg-muted/20">
                <h3 className="text-xl font-bold mb-4">Our Mission</h3>
                <blockquote className="text-lg italic text-muted-foreground leading-relaxed">
                  "To democratize professional web development by making it fast, affordable, and accessible to businesses of all sizes."
                </blockquote>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">What Drives Us</h2>
            <p className="text-lg text-muted-foreground">The core values that guide everything we do</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="p-8 rounded-3xl border border-border/30 hover:border-primary/20 transition-all duration-500 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-foreground mb-5">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Our Journey</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {timeline.map((item, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="flex items-start gap-6 p-6 rounded-2xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <span className="text-primary font-bold text-lg shrink-0 w-14">{item.year}</span>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
