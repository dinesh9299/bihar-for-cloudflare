"use client";

import type React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-white relative overflow-hidden ${className}`}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
