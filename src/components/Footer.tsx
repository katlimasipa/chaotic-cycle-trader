import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Instagram, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const logoSrc = theme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  const links = {
    company: [
      { name: "About", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Clients", href: "/clients" },
    ],
    services: [
      { name: "Web Design", href: "/services/web-design" },
      { name: "Google Business", href: "/contact" },
      { name: "Maintenance", href: "/contact" },
      { name: "Contact", href: "/contact" },
    ],
    social: [
      { name: "Instagram", href: "https://www.instagram.com/architeqwebagency/", icon: <Instagram className="h-4 w-4" /> },
      { name: "WhatsApp", href: "https://wa.me/27694900189" },
    ],
  };

  return (
    <footer className="border-t border-border/30">
      {/* CTA Banner */}
      <div className="container mx-auto px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden bg-foreground text-background p-12 lg:p-16">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                Let's Create Something Together
              </h2>
              <p className="text-background/60 text-lg">
                Ready to transform your business? Let's talk.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background text-foreground px-8 py-3.5 text-sm font-medium hover:bg-background/90 transition-colors whitespace-nowrap"
            >
              Contact Us
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Footer Grid */}
      <div className="container mx-auto px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logoSrc} alt="Architeq" className="h-8 w-auto object-contain" style={{ maxWidth: "160px" }} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Professional websites delivered within 7 days. Fast, affordable, and built to convert.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              {links.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li><a href="tel:0694900189" className="hover:text-foreground transition-colors">069 490 0189</a></li>
              <li><a href="mailto:admin@architeq.co.za" className="hover:text-foreground transition-colors whitespace-nowrap">admin@architeq.co.za</a></li>
              <li className="flex items-center gap-4 pt-2">
                {links.social.map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    {s.icon || s.name}
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Architeq Web Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>South Africa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
