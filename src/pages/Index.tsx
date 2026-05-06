import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowRight, Check, Star, Globe, Palette, Smartphone, Zap } from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.png";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const Index = () => {
  const services = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Web Design",
      description:
        "We don't believe in one-size-fits-all solutions. Our design process starts with understanding your brand's unique identity, goals, and target audience.",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Brand Identity",
      description:
        "Creating cohesive visual identities that resonate with your audience and set you apart from the competition.",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Mobile-First Design",
      description:
        "In a world where mobile devices dominate, having a well-designed responsive site is essential for engaging customers.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "SEO & Performance",
      description:
        "Whether you're looking to enhance your search rankings or improve site speed, we optimize every aspect of your web presence.",
    },
  ];

  const projects = [
    { name: "H & N House of Beauty", image: "/portfolio/hn-house-of-beauty.png", category: "Beauty & Wellness" },
    { name: "Lumavu Trading", image: "/portfolio/lumavu-trading.png", category: "Construction" },
    { name: "Netshifhefhe Attorneys", image: "/portfolio/netshifhefhe-attorneys.png", category: "Legal Services" },
    { name: "Home of Accounting", image: "/portfolio/hac-accounting.png", category: "Finance" },
  ];

  const testimonials = [
    {
      quote:
        "They built our first website 3 years ago and built our new one now. Seamless procedure, always a phone call away and beautiful work as always. Definitely the best around.",
      author: "H & N House of Beauty",
    },
    {
      quote:
        "I had such a great experience with Architeq. They made the whole process of building my website super easy and enjoyable, and the final result looks amazing.",
      author: "Kebogile Mokgoebo",
    },
    {
      quote:
        "Best services and a Great Web Agency I can recommend. I've gotten the best service and the best outcome, everything running smoothly to the tea.",
      author: "PHILLY JAROAM",
    },
  ];

  const stats = [
    { value: "50+", label: "Projects Launched" },
    { value: "7", label: "Days Average Delivery" },
    { value: "100%", label: "Client Satisfaction" },
    { value: "3+", label: "Years Experience" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Build Faster. Launch Smarter. Scale Immediately.
                </span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="text-4xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1] mb-8"
              >
                Transform Your
                <br />
                Online Presence
                <br />
                Within{" "}
                <span className="gradient-text">7 Days</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
              >
                Get a professional, fast, high-converting website — fully optimised for every device.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-full h-12 px-7 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2"
                >
                  <Link to="/contact">
                    Get started
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground ml-1">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 text-sm font-medium gap-2"
                >
                  <Link to="/portfolio">
                    View our work
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="hidden lg:block"
            >
              <div className="relative w-full max-w-[750px] mx-auto transform hover:scale-[1.02] transition-transform duration-1000">
                <img
                  src={heroLaptop}
                  alt="Architeq Premium Web Solutions"
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
                className={`py-12 lg:py-16 text-center ${
                  index < 3 ? "border-r border-border/30" : ""
                } ${index < 2 ? "max-lg:border-b max-lg:border-border/30" : ""} ${index === 2 ? "max-lg:border-r-0" : ""}`}
              >
                <div className="text-4xl lg:text-5xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 lg:py-36">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">About Us</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                We build websites that grow your business
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Architeq Web Agency was born from a simple observation: too many businesses struggle with expensive, slow, and complex web development processes. We deliver professional websites within 7 days — affordably and beautifully.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-full h-11 px-6 text-sm font-medium gap-2"
              >
                <Link to="/about">
                  Learn More
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="relative"
            >
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Transforming
                <br />
                ideas into visually
                <br />
                stunning{" "}
                <span className="gradient-text">realities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:w-1/3"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                  Our Services
                </span>
              </div>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground text-background mb-8">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                50+
              </div>
              <p className="text-lg text-muted-foreground mb-2">projects launched</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work in detail for every project, trust us.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  className="rounded-full h-11 px-6 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2"
                >
                  <Link to="/services">
                    View All Services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <div className="lg:w-2/3 space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={index}
                  className="group flex items-start gap-6 p-6 rounded-2xl border border-border/30 hover:border-primary/20 hover:bg-muted/30 transition-all duration-500"
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors duration-300 ${
                      index === 0
                        ? "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                        : "bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mb-1.5 flex items-center gap-2">
                      {service.title}
                      {index === 0 && (
                        <span className="text-[10px] font-medium rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          ◎
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">
                Recent Projects
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Work</h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6 md:mt-0 rounded-full h-10 px-6 text-sm font-medium gap-2"
            >
              <Link to="/portfolio">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
              >
                <Link
                  to="/portfolio"
                  className="group block rounded-3xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500"
                >
                  <div className="overflow-hidden bg-muted/20 aspect-[16/10]">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">{project.name}</h3>
                      <span className="text-xs text-muted-foreground">{project.category}</span>
                    </div>
                    <div className="flex items-center justify-center h-9 w-9 rounded-full border border-border/50 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">
              See from our clients
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              What Our Clients Say
            </h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">5.0 on Google</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
                className="p-8 rounded-3xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed mb-6 text-foreground/80">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-border/30 pt-4">
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Verified Google Review</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">
              Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Choose Your Perfect Package
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Affordable solutions for every business size
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              {
                name: "Essential",
                price: "R2,000",
                description: "Perfect for getting started",
                features: ["Single Page Website", "Mobile Responsive", "Google Business Profile", "Contact Form"],
              },
              {
                name: "Starter",
                price: "R5,000",
                description: "Perfect for small businesses",
                features: ["5 Pages", "Mobile Responsive", "Contact Form", "Google Business Profile"],
              },
              {
                name: "Professional",
                price: "R10,000",
                description: "Most Popular Choice",
                features: ["10 Pages", "Blog", "SEO Setup", "Social Media Integration"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "R15,000+",
                description: "For growing businesses",
                features: ["Unlimited Pages", "E-commerce & Analytics", "Priority Support", "Custom Features"],
              },
            ].map((pkg, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
                className={`relative p-6 rounded-3xl border transition-all duration-500 ${
                  pkg.popular
                    ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20"
                    : "border-border/30 hover:border-primary/20"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-semibold mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">{pkg.price}</div>
                  <p className="text-xs text-muted-foreground">{pkg.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full h-10 text-sm font-medium ${
                    pkg.popular ? "" : ""
                  }`}
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/services">Choose Plan</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
