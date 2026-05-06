import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, Phone, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", service: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const phoneRegex = /^[0-9+\s()-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({ title: "Error", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { sendEmail } = await import("@/lib/emailjs");
      const result = await sendEmail({
        name: formData.name,
        email: formData.email,
        service: formData.service,
        message: formData.message,
      });

      if (result.success) {
        toast({ title: "Message Sent!", description: "Thank you for your message. We'll get back to you within 24 hours." });
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message. Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const contactMethods = [
    { icon: <Phone className="h-5 w-5" />, title: "Phone", value: "069 490 0189", link: "tel:0694900189", desc: "Call us for immediate assistance" },
    { icon: <Mail className="h-5 w-5" />, title: "Email", value: "admin@architeq.co.za", link: "mailto:admin@architeq.co.za", desc: "Send us a detailed message" },
    { icon: <MessageCircle className="h-5 w-5" />, title: "WhatsApp", value: "Chat with us", link: "https://wa.me/27694900189", desc: "Quick questions and updates" },
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 block">Contact</span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
              Let's Build Something
              <br />
              <span className="gradient-text">Amazing</span> Together
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Ready to transform your online presence? Get in touch and let's discuss your project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form & Info */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-3">
              <div className="p-8 lg:p-10 rounded-3xl border border-border/30">
                <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-sm text-muted-foreground mb-8">Fill out the form and we'll get back to you within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Name *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Your full name" required disabled={isSubmitting} className="rounded-xl h-11 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="your@email.com" required disabled={isSubmitting} className="rounded-xl h-11 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="+27 123 456 7890" required disabled={isSubmitting} className="rounded-xl h-11 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-sm">Service Interested In</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)} disabled={isSubmitting}>
                      <SelectTrigger className="rounded-xl h-11 border-border/50"><SelectValue placeholder="Select a service" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery-call">Book Discovery Call</SelectItem>
                        <SelectItem value="website">Website Design & Development</SelectItem>
                        <SelectItem value="web-app">Custom Web Application</SelectItem>
                        <SelectItem value="redesign">Website Redesign</SelectItem>
                        <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Message *</Label>
                    <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} placeholder="Tell us about your project..." rows={5} required disabled={isSubmitting} className="rounded-xl border-border/50" />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 gap-2" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-6">Get In Touch</h2>
              {contactMethods.map((method, index) => (
                <a key={index} href={method.link} target={method.title === "WhatsApp" ? "_blank" : undefined} rel={method.title === "WhatsApp" ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-border/30 hover:border-primary/20 transition-all duration-500 group"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{method.title}</h3>
                    <p className="text-sm text-primary">{method.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                  </div>
                </a>
              ))}

              {/* Response Promise */}
              <div className="p-6 rounded-2xl border border-border/30 mt-6">
                <h3 className="font-semibold text-sm mb-4">Our Response Promise</h3>
                <div className="space-y-3">
                  {[
                    { time: "< 1 Hour", label: "WhatsApp Response" },
                    { time: "< 1 Hour", label: "Email Response" },
                    { time: "< 24 Hours", label: "Project Proposal" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-primary">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-36 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { q: "How long does it take to build a website?", a: "Most websites are completed within 5-7 days. Complex projects may take up to 14 days." },
              { q: "Do you offer ongoing support?", a: "Yes! All packages include support ranging from 1-6 months depending on the plan." },
              { q: "Can you help with existing websites?", a: "Absolutely. We can redesign, optimize, or add new features to your current website." },
              { q: "What's included in custom web applications?", a: "Full application development, user management, payment integration, and hosting setup." },
            ].map((faq, index) => (
              <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                className="p-6 rounded-2xl border border-border/30 hover:border-primary/20 transition-all duration-500"
              >
                <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
