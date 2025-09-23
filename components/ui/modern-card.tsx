"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "sm" | "md" | "lg" | "xl";
  rounded?: "md" | "lg" | "xl" | "2xl" | "3xl";
  onClick?: () => void;
}

export function ModernCard({
  children,
  className,
  hover = true,
  glass = true,
  padding = "lg",
  rounded = "2xl",
  onClick,
}: ModernCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const roundedClasses = {
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    "2xl": "rounded-[2rem]",
    "3xl": "rounded-[3rem]",
  };

  return (
    <motion.div
      // whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden border-0 transition-all duration-300",
        glass
          ? "bg-white/70 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/80"
          : "bg-white shadow-md hover:shadow-lg",
        roundedClasses[rounded],
        paddingClasses[padding],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
