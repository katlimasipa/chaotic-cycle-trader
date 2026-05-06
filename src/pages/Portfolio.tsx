import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const Portfolio = () => {
  const projects = [
    { name: "H & N House of Beauty", image: "/portfolio/hn-house-of-beauty.png", category: "Beauty & Wellness", timeline: "3 days", cost: "R5,000" },
    { name: "Dr Maise T", image: "/portfolio/dr-maise-t.png", category: "Healthcare", timeline: "2 days", cost: "R2,000" },
    { name: "Lumavu Trading Enterprises", image: "/portfolio/lumavu-trading.png", category: "Construction", timeline: "4 days", cost: "R5,000" },
    { name: "Home of Accounting Consulting", image: "/portfolio/hac-accounting.png", category: "Finance", timeline: "2 days", cost: "R5,000" },
    { name: "GT Testing Civil & Construction", image: "/portfolio/gt-testing.png", category: "Construction & Testing", timeline: "3 days", cost: "R5,000" },
    { name: "BlueEdge Designs", image: "/portfolio/blueedge-designs.png", category: "Design Agency", timeline: "1 day", cost: "R2,000" },
    { name: "KTL Makeup Glam", image: "/portfolio/ktl-makeup-glam.png", category: "Beauty & Makeup", timeline: "1 day", cost: "R2,500" },
    { name: "Katthales Holdings", image: "/portfolio/katthales-holdings.png", category: "Cleaning Services", timeline: "3 days", cost: "R5,000" },
    { name: "MusicEar", image: "/portfolio/musicear.png", category: "Entertainment & Events", timeline: "1 day", cost: "R2,000" },
    { name: "Netshifhefhe Attorneys", image: "/portfolio/netshifhefhe-attorneys.png", category: "Legal Services", timeline: "4 days", cost: "R7,000" },
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">Our Work</span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              Our
              <br />
              <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              Real websites we've built for real businesses. See how we've helped our clients establish a powerful online presence.
            </p>
            <Button asChild className="rounded-full h-12 px-7 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2">
              <Link to="/contact">Start Your Project <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index % 2}
                className="group rounded-3xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <div className="overflow-hidden bg-muted/20 aspect-[16/10]">
                  <img
                    src={project.image}
                    alt={`${project.name} website`}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-sm">{project.name}</h3>
                      <span className="text-[10px] font-medium rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{project.timeline}</span>
                      <span>·</span>
                      <span>{project.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 rounded-full border border-border/50 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
