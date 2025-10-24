"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Camera,
  MapPin,
  Map,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  TableProperties,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/ui/pill-button";
import axios from "axios";

const navigation = [
  // { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // { name: "Surveys", href: "/surveys", icon: FileText },
  // { name: "Projects", href: "/projects", icon: FileText },
  // { name: "Cameras", href: "/cameras", icon: Camera },
  { name: "Locations", href: "/booth/locations", icon: MapPin },
  { name: "me", href: "/booth/me", icon: Users },
  { name: "Certificate", href: "/booth/certificate", icon: FileText },
  //   { name: "Districts", href: "/districts", icon: Map },
  //   { name: "Blocks", href: "/assembly/blocks", icon: TableProperties },
  //   { name: "Coordinators", href: "/block/coordinators", icon: Users },
  // { name: "Sites", href: "/sites1", icon: TableProperties },
  // { name: "BOQ", href: "/boqs1", icon: TableProperties },
  // { name: "BOQ", href: "/test", icon: TableProperties },
  // { name: "Products", href: "/products", icon: ShoppingCart },
  // { name: "Analytics", href: "/analytics", icon: BarChart3 },
  // { name: "Reports", href: "/reports", icon: FileText },
  // { name: "Team", href: "/team", icon: Users },
  // { name: "Settings", href: "/settings", icon: Settings },
  // { name: "Map View", href: "/map", icon: Map },
];

interface ModernSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Boothsidebar({ isOpen = false, onClose }: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const [user, setUser] = useState({
    email: "",
    id: 0,
    username: "",
    documentId: "",
    role: {
      name: "",
      type: "",
    },
  });

  //   const getUser = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       console.error("No token found in localStorage");
  //       return;
  //     }

  //     try {
  //       const res = await axios.get(
  //         "http://183.82.117.36:1337/api/app-users/me?populate=*",
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );
  //       setUser(res.data);
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //     }
  //   };

  //   useEffect(() => {
  //     getUser();
  //   }, []);

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "bg-gradient-to-b from-blue-50 to-green-50 border-r border-white/30 backdrop-blur-md flex flex-col h-screen overflow-y-auto custom-scrollbar md:w-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 transition-transform duration-300 ease-in-out z-50"
      )}
      style={{ scrollbarGutter: "stable" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/30 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#00ADE7] to-[#305292] rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Trinai Survey</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </motion.div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors hidden md:block"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors md:hidden"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Quick Action */}
      {!isCollapsed && (
        <div className="p-6 border-b border-white/30">
          <Link href="/surveys/new">
            <PillButton className="w-full bg-gradient-to-r from-blue-500 to-blue-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Survey
            </PillButton>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (onClose) onClose(); // Call onClose if provided
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center rounded-2xl transition-all duration-200",
                  isCollapsed
                    ? "justify-center px-0 py-3"
                    : "px-4 py-3 space-x-3",
                  isActive
                    ? "bg-gradient-to-r to-[#00ADE7] from-[#305292] text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isCollapsed ? "mx-auto" : ""
                  )}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-white/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">TT</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.username}
              </p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
