// "use client"

// import type React from "react"
// import { ModernCard } from "./modern-card"
// import { motion } from "framer-motion"
// import { TrendingUp, TrendingDown } from "lucide-react"

// interface StatCardProps {
//   title: string
//   value: string | number
//   subtitle?: string
//   trend?: {
//     value: string
//     direction: "up" | "down" | "neutral"
//   }
//   icon?: React.ReactNode
//   color?: "amber" | "blue" | "green" | "purple" | "red"
//   className?: string
// }

// export function StatCard({ title, value, subtitle, trend, icon, color = "amber", className }: StatCardProps) {
//   const colorClasses = {
//     amber: {
//       icon: "bg-gradient-to-br from-amber-400 to-yellow-500",
//       trend: "text-amber-600",
//       accent: "text-amber-600",
//     },
//     blue: {
//       icon: "bg-gradient-to-br from-blue-400 to-blue-600",
//       trend: "text-blue-600",
//       accent: "text-blue-600",
//     },
//     green: {
//       icon: "bg-gradient-to-br from-green-400 to-emerald-500",
//       trend: "text-green-600",
//       accent: "text-green-600",
//     },
//     purple: {
//       icon: "bg-gradient-to-br from-purple-400 to-purple-600",
//       trend: "text-purple-600",
//       accent: "text-purple-600",
//     },
//     red: {
//       icon: "bg-gradient-to-br from-red-400 to-red-600",
//       trend: "text-red-600",
//       accent: "text-red-600",
//     },
//   }

//   return (
//     <ModernCard className={className} padding="lg">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <div className="flex items-baseline space-x-2">
//             <motion.p
//               initial={{ scale: 0.5, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="text-3xl font-bold text-gray-900"
//             >
//               {value}
//             </motion.p>
//             {trend && (
//               <div className={`flex items-center space-x-1 ${colorClasses[color].trend}`}>
//                 {trend.direction === "up" && <TrendingUp className="w-4 h-4" />}
//                 {trend.direction === "down" && <TrendingDown className="w-4 h-4" />}
//                 <span className="text-sm font-medium">{trend.value}</span>
//               </div>
//             )}
//           </div>
//           {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//         </div>

//         {icon && (
//           <motion.div
//             initial={{ scale: 0, rotate: -180 }}
//             animate={{ scale: 1, rotate: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className={`p-3 rounded-2xl ${colorClasses[color].icon} text-white shadow-lg`}
//           >
//             {icon}
//           </motion.div>
//         )}
//       </div>
//     </ModernCard>
//   )
// }

"use client";

import type React from "react";
import { ModernCard } from "./modern-card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  color?: "amber" | "blue" | "green" | "purple" | "red" | "orange";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "amber",
  className,
}: StatCardProps) {
  const colorClasses: Record<string, any> = {
    amber: {
      icon: "bg-gradient-to-br from-amber-400 to-yellow-500",
      trend: "text-amber-600",
      accent: "text-amber-600",
    },
    blue: {
      icon: "bg-gradient-to-br from-blue-400 to-blue-600",
      trend: "text-blue-600",
      accent: "text-blue-600",
    },
    green: {
      icon: "bg-gradient-to-br from-green-400 to-emerald-500",
      trend: "text-green-600",
      accent: "text-green-600",
    },
    purple: {
      icon: "bg-gradient-to-br from-purple-400 to-purple-600",
      trend: "text-purple-600",
      accent: "text-purple-600",
    },
    red: {
      icon: "bg-gradient-to-br from-red-400 to-red-600",
      trend: "text-red-600",
      accent: "text-red-600",
    },
    orange: {
      icon: "bg-gradient-to-br from-orange-400 to-orange-600",
      trend: "text-orange-600",
      accent: "text-orange-600",
    },
  };

  // ✅ Safely handle invalid or undefined color keys
  const colors = colorClasses[color] || colorClasses["amber"];

  return (
    <ModernCard className={className} padding="lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>

          <div className="flex items-baseline space-x-2">
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-gray-900"
            >
              {value}
            </motion.p>

            {trend && (
              <div
                className={`flex items-center space-x-1 ${
                  colors.trend || "text-gray-600"
                }`}
              >
                {trend.direction === "up" && <TrendingUp className="w-4 h-4" />}
                {trend.direction === "down" && (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{trend.value}</span>
              </div>
            )}
          </div>

          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-3 rounded-2xl ${colors.icon} text-white shadow-lg`}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </ModernCard>
  );
}
