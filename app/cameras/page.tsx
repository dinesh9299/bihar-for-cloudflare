"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Camera,
  Wifi,
  WifiOff,
  Settings,
  Eye,
  Download,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CamerasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch(
          "http://localhost:1337/api/surveys?populate=*"
        );
        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          // Map API data to the component's camera structure
          const mappedCameras = result.data.flatMap((survey) =>
            survey.cameraDetails.map((camera) => ({
              id: camera.serialNumber || `CAM-${survey.id}-${camera.id}`,
              name: `${survey.bus_station?.name || "Unknown Station"} - ${
                camera.direction || "Unknown"
              }`,
              type: camera.type.toUpperCase() || "Unknown",
              location: survey.bus_station?.address || "Unknown Location",
              status:
                survey.workStatus === "in-progress" ? "maintenance" : "online", // Map survey workStatus to camera status
              lastSeen:
                new Date(survey.updatedAt).toLocaleString() || "Unknown",
              resolution: "1080p", // Default value as not provided in API
              storage: "50%", // Default value as not provided in API
              alerts: 0, // Default value as not provided in API
            }))
          );
          setCameras(mappedCameras);
        } else {
          setError("No camera data found");
        }
      } catch (err) {
        setError("Failed to fetch camera data");
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      case "maintenance":
        return <Settings className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || camera.status === statusFilter;
    const matchesType = typeFilter === "all" || camera.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const onlineCameras = cameras.filter((c) => c.status === "online").length;
  const offlineCameras = cameras.filter((c) => c.status === "offline").length;
  const maintenanceCameras = cameras.filter(
    (c) => c.status === "maintenance"
  ).length;
  const totalAlerts = cameras.reduce((sum, c) => sum + c.alerts, 0);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex h-screen">
          <ModernSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ModernHeader title="Camera Management" subtitle="Loading..." />
            <main className="flex-1 overflow-y-auto p-6">
              <p>Loading cameras...</p>
            </main>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex h-screen">
          <ModernSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ModernHeader title="Camera Management" subtitle="Error" />
            <main className="flex-1 overflow-y-auto p-6">
              <ModernCard>
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error
                  </h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </ModernCard>
            </main>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="Camera Management"
            subtitle="Monitor and manage all CCTV cameras across locations"
            showGPS={true}
            gpsStatus="connected"
          />

          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StatCard
                  title="Total Cameras"
                  value={cameras.length}
                  subtitle="All locations"
                  icon={<Camera className="w-6 h-6" />}
                  color="amber"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard
                  title="Online"
                  value={onlineCameras}
                  subtitle="Active now"
                  trend={{
                    value: `${Math.round(
                      (onlineCameras / cameras.length) * 100
                    )}%`,
                    direction: "up",
                  }}
                  icon={<Wifi className="w-6 h-6" />}
                  color="green"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatCard
                  title="Offline"
                  value={offlineCameras}
                  subtitle="Need attention"
                  icon={<WifiOff className="w-6 h-6" />}
                  color="red"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StatCard
                  title="Alerts"
                  value={totalAlerts}
                  subtitle="Active alerts"
                  icon={<AlertTriangle className="w-6 h-6" />}
                  color="purple"
                />
              </motion.div>
            </div>

            {/* Filters and Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ModernCard className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search cameras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ANPR">ANPR</SelectItem>
                        {/* Add other types if needed */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PillButton variant="secondary" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </PillButton>
                    <PillButton variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </PillButton>
                    {/* <PillButton variant="accent" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Camera
                    </PillButton> */}
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Cameras Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCameras.map((camera, index) => (
                <motion.div
                  key={camera.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ModernCard className="h-full">
                    <div className="space-y-4">
                      {/* Camera Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-2xl">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {camera.name}
                            </h3>
                            <p className="text-sm text-gray-600">{camera.id}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(camera.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(camera.status)}
                            <span>{camera.status}</span>
                          </div>
                        </Badge>
                      </div>

                      {/* Camera Preview */}
                      <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Live Feed</p>
                          <p className="text-xs text-gray-400">
                            {camera.resolution}
                          </p>
                        </div>
                      </div>

                      {/* Camera Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="outline">{camera.type}</Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900 text-right">
                            {camera.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Seen:</span>
                          <span className="text-gray-900">
                            {camera.lastSeen}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Storage:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full"
                                style={{ width: camera.storage }}
                              />
                            </div>
                            <span className="text-gray-900">
                              {camera.storage}
                            </span>
                          </div>
                        </div>

                        {camera.alerts > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Alerts:</span>
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {camera.alerts}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                        <PillButton variant="secondary" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </PillButton>
                        <PillButton variant="secondary" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </PillButton>
                        <PillButton variant="secondary" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </PillButton>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </motion.div>

            {filteredCameras.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <ModernCard>
                  <div className="text-center py-12">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No cameras found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <PillButton variant="accent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Camera
                    </PillButton>
                  </div>
                </ModernCard>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
