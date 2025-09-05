"use client"

import type React from "react"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden ${className}`}
    >
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
