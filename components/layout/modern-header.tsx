"use client";

import { useLogout } from "@/app/logout";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Tooltip } from "antd";
import { io } from "socket.io-client";
import {
  Search,
  Bell,
  Settings,
  User,
  Wifi,
  WifiOff,
  Menu,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showGPS?: boolean;
  gpsStatus?: "connected" | "disconnected";
  className?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function ModernHeader({
  title,
  subtitle,
  showSearch = true,
  showGPS = true,
  gpsStatus = "connected",
  className,
  onToggleSidebar,
}: ModernHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const getUser = async () => {
    try {
      const res = await api.get("/users/me?populate=*");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await api.get(
        "/notifications?populate=users_permissions_user&sort=createdAt:desc&pagination[pageSize]=5"
      );
      // Filter notifications to only include those where users_permissions_user.id matches user.id
      if (user?.id) {
        const filteredNotifications = res.data.data.filter(
          (notification: any) =>
            notification.users_permissions_user.id === user.id
        );
        setNotifications(filteredNotifications);
      } else {
        setNotifications(res.data.data); // Fallback to all notifications if user is not yet loaded
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    getNotifications();

    // ✅ connect socket
    const socket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://192.168.1.137:1337",
      {
        transports: ["websocket"],
      }
    );

    // listen for new notifications
    socket.on("new_boq", (data) => {
      console.log("🔔 Live notification:", data);
      // Only add the notification if it is for the current user
      if (user?.id && data.users_permissions_user?.id === user.id) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: data.message,
            createdAt: new Date().toISOString(),
            users_permissions_user: data.users_permissions_user,
          },
          ...prev,
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]); // Re-run when user changes

  const logout = useLogout();

  return (
    <header
      className={`bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

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

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys, locations..."
                className="pl-10 pr-4 py-2 w-80 h-10 bg-white/50 border rounded-full text-sm"
              />
            </div>
          )}

          {/* 🔔 Notifications */}
          <Tooltip
            title={
              notifications.length > 0 ? (
                <div className="max-h-60 overflow-y-auto w-64">
                  {notifications.map((n: any, i: number) => (
                    <div key={i} className="px-2 py-2 border-b text-sm">
                      {n.message}
                      <div className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                "No notifications"
              )
            }
          >
            <button className="relative p-2 bg-white/50 rounded-full border hover:bg-white/70">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                  {notifications.length}
                </Badge>
              )}
            </button>
          </Tooltip>

          {/* Settings */}
          <Link href="/settings">
            <button className="p-2 bg-white/50 rounded-full border hover:bg-white/70">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </Link>

          {/* Logout */}
          <Tooltip title="Logout" placement="bottom">
            <button
              onClick={logout}
              className="p-2 bg-white/50 rounded-full border hover:bg-white/70"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </Tooltip>

          {/* User info */}
          <div className="w-px h-6 bg-gray-300" />
          {user && (
            <div className="flex items-center space-x-3 bg-white/50 rounded-full px-4 py-2 border">
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
          )}
        </div>
      </div>
    </header>
  );
}
