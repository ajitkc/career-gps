"use client";

import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "./hover-border-gradient";

interface AnimatedButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export default function AnimatedButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
}: AnimatedButtonProps) {
  const isSm = size === "sm";
  const isPrimary = variant === "primary";

  if (isPrimary) {
    const Tag = href ? "a" : "button";
    return (
      <HoverBorderGradient
        as={Tag}
        href={href}
        onClick={onClick}
        containerClassName={className}
        className={cn(
          "relative overflow-hidden font-headline font-bold",
          isSm ? "text-sm px-5 py-2.5" : "text-base px-7 py-3.5",
          "!bg-white !text-surface group/fill"
        )}
      >
        {/* Water fill from bottom */}
        <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary-container rounded-[inherit] translate-y-full group-hover/fill:translate-y-0 transition-transform duration-500 ease-out" />
        {/* Text — instant white on hover */}
        <span className="relative z-10 transition-colors duration-150 group-hover/fill:text-white">
          {children}
        </span>
      </HoverBorderGradient>
    );
  }

  return (
    <HoverBorderGradient
      as={href ? "a" : "button"}
      href={href}
      onClick={onClick}
      containerClassName={className}
      className={cn(
        "font-headline font-bold text-white",
        isSm ? "text-sm px-5 py-2.5" : "text-base px-7 py-3.5"
      )}
    >
      {children}
    </HoverBorderGradient>
  );
}
