"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, motion } from "framer-motion";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/ui/pill-button";
import axios from "axios";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Surveys", href: "/admin/surveys", icon: FileText },
  { name: "Cameras", href: "/admin/cameras", icon: Camera },
  // { name: "Locations", href: "/locations", icon: MapPin },
  // { name: "Map View", href: "/map", icon: Map },
  //   { name: "Analytics", href: "/analytics", icon: BarChart3 },
  //   { name: "Reports", href: "/reports", icon: FileText },
  //   { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function ModernSidebar1() {
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

  const token = localStorage.getItem("token");

  const getuser = async () => {
    const res = await axios.get(
      "http://localhost:1337/api/users/me?populate=*",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // console.log("data", res.data);

    setUser(res.data);
  };

  useEffect(() => {
    getuser();
  }, []);

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      id="cursor"
      className="bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 border-r border-white/30 backdrop-blur-md flex flex-col h-screen overflow-y-auto  "
    >
      {/* Header */}
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center justify-between">
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
                <h1 className="text-lg font-bold text-gray-900">
                  Trinai Survey
                </h1>
                <p className="text-sm text-gray-600">Management System</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Action */}
      {!isCollapsed && (
        <div className="p-6 border-b border-white/30">
          <Link href="/surveys/new">
            <PillButton variant="accent" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Survey
            </PillButton>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r to-[#00ADE7] from-[#305292] text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
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
              <p className="text-xs text-gray-600">{user.role.name}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
