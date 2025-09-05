"use client";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Search, Bell, Settings, User, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showGPS?: boolean;
  gpsStatus?: "connected" | "disconnected";
  className?: string;
}

export function ModernHeader({
  title,
  subtitle,
  showSearch = true,
  showGPS = true,
  gpsStatus = "connected",
  className,
}: ModernHeaderProps) {
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

  const getuser = async () => {
    const token = localStorage.getItem("token");

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
    <header
      className={`bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>

          {showGPS && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30">
              {gpsStatus === "connected" ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                GPS {gpsStatus === "connected" ? "Connected" : "Disconnected"}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  gpsStatus === "connected" ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys, locations..."
                className="pl-10 pr-4 py-2 w-80 h-10 bg-white/50 backdrop-blur-sm border border-white/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 placeholder-gray-500"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button className="relative p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                3
              </Badge>
            </button>

            <button className="p-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/70 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-px h-6 bg-gray-300" />

            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-xs text-gray-600">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
