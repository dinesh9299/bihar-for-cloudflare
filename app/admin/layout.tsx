// app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { toast } from "@/components/ui/use-toast"; // assuming you use shadcn toast
import { ModernSidebar1 } from "@/components/layout/modern-sidebar1";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);

  const getGPSLocation = () => {
    setIsRefreshingGPS(true);
    setGpsStatus("loading");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsStatus("connected"); // ✅ use "connected" not "success"
          setIsRefreshingGPS(false);

          toast({
            variant: "success",
            title: "GPS Location Updated",
            description: `Location: ${position.coords.latitude.toFixed(
              6
            )}, ${position.coords.longitude.toFixed(6)}`,
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          setGpsStatus("disconnected"); // ✅ use "disconnected" not "error"
          setIsRefreshingGPS(false);

          toast({
            variant: "destructive",
            title: "GPS Error",
            description:
              "Unable to get your current location. Please check your location settings.",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setGpsStatus("disconnected"); // ✅ match expected value
      setIsRefreshingGPS(false);

      toast({
        variant: "destructive",
        title: "GPS Not Supported",
        description: "Your browser doesn't support GPS location services.",
      });
    }
  };

  useEffect(() => {
    getGPSLocation();
  }, []);

  return (
    <PageLayout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <ModernSidebar1 />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with GPS clarity */}
          <ModernHeader
            title="Survey Dashboard"
            subtitle={
              gpsStatus === "success" && location
                ? `GPS Active: ${location.lat.toFixed(
                    4
                  )}, ${location.lng.toFixed(4)}`
                : gpsStatus === "loading"
                ? "Fetching GPS..."
                : gpsStatus === "error"
                ? "GPS unavailable"
                : "GPS idle"
            }
            showGPS={true}
            gpsStatus={gpsStatus}
            onRefreshGPS={getGPSLocation} // optional refresh button
            isRefreshingGPS={isRefreshingGPS}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </PageLayout>
  );
}
