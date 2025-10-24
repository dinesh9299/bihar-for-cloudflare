"use client";

import { useLogout } from "@/app/logout";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Popover, Drawer, Tooltip } from "antd"; // ✅ instead of Tooltip
import { useMediaQuery } from "react-responsive";
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
  const [openDrawer, setOpenDrawer] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const getUser = async () => {
    try {
      const res = await api.get("/users/me?populate=*");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const notificationList = (
    <div className="w-96 sm:w-72 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n: any, i: number) => (
            <div
              key={i}
              className={`flex justify-between items-start px-3 py-2 border-b ${
                n.read ? "bg-gray-50" : "bg-amber-50"
              }`}
            >
              <div className="pr-2">
                <p className="text-sm text-gray-800">{n.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {!n.read && (
                <button
                  onClick={async () => {
                    await api.put(`/notifications/${n.id}`, {
                      data: { read: true },
                    });
                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === n.id ? { ...item, read: true } : item
                      )
                    );
                  }}
                  className="ml-2 text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Seen
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="px-3 py-6 text-center text-gray-500 text-sm">
            No notifications
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-3 py-2 bg-gray-100 flex justify-end">
          <button
            onClick={async () => {
              await Promise.all(
                notifications.map((n) =>
                  api.put(`/notifications/${n.documentId}`, {
                    data: { read: true },
                  })
                )
              );
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
              );
            }}
            className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );

  const getNotifications = async () => {
    try {
      const res = await api.get(
        "/notifications?populate=users_permissions_user&sort=createdAt:desc&pagination[pageSize]=5"
      );
      if (user?.id) {
        const filteredNotifications = res.data.data.filter(
          (notification: any) =>
            notification.users_permissions_user.id === user.id
        );
        setNotifications(filteredNotifications);
      } else {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // useEffect(() => {
  //   getUser();
  // }, []);

  useEffect(() => {
    getNotifications();

    const socket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://192.168.1.137:1337",
      {
        transports: ["websocket"],
      }
    );

    socket.on("new_boq", (data) => {
      console.log("🔔 Live notification:", data);
      if (user?.id && data.users_permissions_user?.id === user.id) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            message: data.message,
            createdAt: new Date().toISOString(),
            users_permissions_user: data.users_permissions_user,
            read: false,
          },
          ...prev,
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const logout = useLogout();

  return (
    <header
      className={`bg-gradient-to-r from-blue-50 to-blue-50 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              SuperAdmin Dashboard
            </h1>
            {/* {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )} */}
          </div>

          {/* {showGPS && (
            <div className=" hidden md-block lg:flex items-center space-x-2 px-3 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/30">
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
          )} */}
        </div>

        <div className="flex items-center space-x-4">
          {/* {showSearch && (
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys, locations..."
                className="pl-10 pr-4 py-2 w-80 h-10 bg-white/50 border rounded-full text-sm"
              />
            </div>
          )} */}

          {/* <Link href="/settings">
            <button className="hidden md:block p-2 bg-white/50 rounded-full border hover:bg-white/70">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </Link> */}

          <Tooltip title="Logout" placement="bottom">
            <button
              onClick={logout}
              className="p-2 bg-white/50 rounded-full border hover:bg-white/70"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 hidden md:block" />
          {user && (
            <div className="hidden md:flex items-center space-x-3 bg-white/50 rounded-full px-4 py-2 border">
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
