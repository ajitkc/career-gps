"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

const movingMap: Record<Direction, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
};

const highlight =
  "radial-gradient(75% 181.15% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Element = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & Record<string, unknown>
>) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("BOTTOM");

  const rotateDirection = (cur: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const idx = dirs.indexOf(cur);
    const next = clockwise
      ? (idx - 1 + dirs.length) % dirs.length
      : (idx + 1) % dirs.length;
    return dirs[next];
  };

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prev) => rotateDirection(prev));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Element
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit flex-col flex-nowrap content-center items-center justify-center overflow-visible rounded-full border border-white/10 p-px transition duration-500",
        containerClassName
      )}
      {...props}
    >
      {/* Content — glassmorphic bg, white text */}
      <div
        className={cn(
          "z-10 w-auto rounded-[inherit] px-4 py-2 text-sm font-medium text-white bg-white/[0.06] backdrop-blur-xl",
          className
        )}
      >
        {children}
      </div>
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)", position: "absolute", width: "100%", height: "100%" }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      {/* Inner fill — glassmorphic, sits between border glow and content */}
      <div className="absolute inset-[1px] z-[1] flex-none rounded-[100px] bg-surface/80 backdrop-blur-xl" />
    </Element>
  );
}
