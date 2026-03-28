"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import AnimatedButton from "@/components/ui/animated-button";

const links = [
  { label: "Journey", href: "#journey" },
  { label: "Careers", href: "#careers" },
  { label: "Burnout", href: "#burnout" },
  { label: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 mx-auto w-full max-w-5xl md:rounded-full md:transition-all md:ease-out md:duration-500",
        scrolled && !open
          ? "bg-surface/80 supports-[backdrop-filter]:bg-surface/50 border border-outline-variant/15 backdrop-blur-xl md:top-4 md:max-w-4xl md:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
          : open
          ? "bg-surface/90 border-b border-outline-variant/10"
          : "bg-transparent border-none"
      )}
    >
      <nav
        className={cn(
          "flex w-full items-center justify-between px-5 py-3 md:py-3.5 md:transition-all md:ease-out",
          { "md:px-5 md:py-3": scrolled }
        )}
      >
        {/* Logo */}
        <a href="#" aria-label="Career GPS home">
          <Logo className="h-7 w-auto" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-on-surface/70 hover:text-on-surface hover:bg-surface-container font-headline text-sm rounded-full"
              )}
            >
              {link.label}
            </a>
          ))}
          <div className="ml-1">
            <AnimatedButton href="/onboarding" size="sm">
              Get Started
            </AnimatedButton>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-full border-outline-variant/20 bg-surface-container hover:bg-surface-container-high"
        >
          <MenuToggleIcon open={open} className="size-5 text-on-surface" duration={300} />
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "bg-surface/95 backdrop-blur-xl fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-t border-outline-variant/10 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4"
          )}
        >
          <div className="grid gap-y-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start text-on-surface font-headline rounded-xl"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 pb-8">
            <AnimatedButton href="/onboarding" variant="outline">
              Sign In
            </AnimatedButton>
            <AnimatedButton href="/onboarding">
              Get Started
            </AnimatedButton>
          </div>
        </div>
      </div>
    </header>
  );
}
