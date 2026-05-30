"use client"

import Link from "next/link"
import { Wrench, Mail, Phone, MapPin, Globe } from "lucide-react"

const footerLinks = {
  services: [
    { href: "/services/plumbing", label: "Plumbing" },
    { href: "/services/electrical", label: "Electrical" },
    { href: "/services/cleaning", label: "Cleaning" },
    { href: "/services/painting", label: "Painting" },
    { href: "/services/tutoring", label: "Tutoring" },
    { href: "/services/salon-spa", label: "Salon & Spa" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
    { href: "#", label: "Blog" },
  ],
  support: [
    { href: "#", label: "FAQ" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "#", label: "Safety Guidelines" },
  ],
  tasker: [
    { href: "#", label: "Become a Tasker" },
    { href: "#", label: "Tasker Guide" },
    { href: "#", label: "Earnings" },
    { href: "#", label: "Success Stories" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-emerald-600">Nepal</span>Sewa
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6 max-w-xs">
              Butwal's trusted service marketplace connecting customers with
              verified local professionals.
            </p>
            <div className="flex gap-3">
              {[
                { label: "Facebook", href: "#" },
                { label: "Twitter", href: "#" },
                { label: "Instagram", href: "#" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors hover:bg-emerald-200"
                >
                  <Globe className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              For Taskers
            </h3>
            <ul className="space-y-3">
              {footerLinks.tasker.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-500" />
              Butwal, Lumbini Province, Nepal
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-emerald-500" />
              +977-98XXXXXXXX
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-emerald-500" />
              hello@nepalsewa.com.np
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NepalSewa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
