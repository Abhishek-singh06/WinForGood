"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Menu, X, Shield, ArrowUpRight } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/charities", label: "Causes & Impact" },
    { href: "/pricing", label: "Membership" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-bg-deep/90 backdrop-blur-md transition-all">
      <Container size="wide">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric rounded"
          >
            <div className="w-8 h-8 rounded-sm bg-surface-charcoal border border-border-silver flex items-center justify-center text-white group-hover:border-white transition-colors">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-mono text-sm tracking-wider text-white uppercase font-bold">
              DIGITAL<span className="text-red-500">.</span>HEROES
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs font-mono uppercase tracking-widest transition-colors py-1 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric rounded",
                    isActive
                      ? "text-white border-b-2 border-blue-500"
                      : "text-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="font-mono text-xs uppercase tracking-wider">
                Subscribe & Play <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="p-2 text-text-secondary hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-electric"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border-subtle bg-bg-near p-6 space-y-5 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-mono uppercase tracking-wider text-text-secondary hover:text-white py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-border-subtle flex flex-col space-y-3">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="silver" size="md" className="w-full font-mono text-xs uppercase">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsOpen(false)}>
              <Button variant="primary" size="md" className="w-full font-mono text-xs uppercase">
                Subscribe & Play
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
