"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  MapPin,
  Users,
  Activity,
  Plus,
  Download,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalSurveys: 0,
    completedSurveys: 0,
    pendingSurveys: 0,
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    activeSurveyors: 0,
    completionRate: 0,
  });
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "surveys", label: "Surveys" },
    { id: "analytics", label: "Analytics" },
    { id: "team", label: "Team" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/surveys?populate=*"
        );
        const surveys = response.data.data;

        const totalSurveys = surveys.length;
        const completedSurveys = surveys.filter(
          (s: any) => s.workStatus === "survey-completed"
        ).length;
        const pendingSurveys = surveys.filter(
          (s: any) => s.workStatus !== "survey-completed"
        ).length;
        const totalCameras = surveys.reduce(
          (sum: number, s: any) => sum + (s.cameraDetails?.length || 0),
          0
        );
        const onlineCameras = surveys.reduce(
          (sum: number, s: any) =>
            sum +
            (s.cameraDetails?.filter((c: any) => c.status === "online")
              ?.length || 0),
          0
        );
        const offlineCameras = totalCameras - onlineCameras;
        const completionRate =
          totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0;
        const activeSurveyors = new Set(
          surveys.map((s: any) => s.surveyor?.name || "Unknown")
        ).size;

        const sortedSurveys = [...surveys]
          .sort(
            (a: any, b: any) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          .slice(0, 3);
        const recent = sortedSurveys.map((s: any) => ({
          id: `SRV-${s.id}`,
          location: s.locationDetails || s.bus_station?.name || "Unknown",
          division: s.division?.name || "Unassigned",
          status: s.workStatus,
          surveyor: s.surveyor?.name || "Unknown",
          time: `${Math.floor(
            (new Date().getTime() - new Date(s.createdAt).getTime()) /
              (1000 * 60 * 60)
          )}h ago`,
          progress:
            s.workStatus === "survey-completed"
              ? 100
              : s.workStatus === "in-progress"
              ? 65
              : 25,
        }));

        setStats({
          totalSurveys,
          completedSurveys,
          pendingSurveys,
          totalCameras,
          onlineCameras,
          offlineCameras,
          activeSurveyors,
          completionRate,
        });
        setRecentSurveys(recent);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex h-screen">
          <ModernSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ModernHeader
              title="Survey Dashboard"
              subtitle="Loading overview..."
              showGPS={true}
              gpsStatus="connected"
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
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
            <ModernHeader
              title="Survey Dashboard"
              subtitle="Error loading data"
              showGPS={true}
              gpsStatus="connected"
            />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-red-600">{error}</div>
            </div>
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
            title="Survey Dashboard"
            subtitle="Real-time overview of CCTV survey operations"
            showGPS={true}
            gpsStatus="connected"
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Welcome Section */}
            <div className="mb-4 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Good morning, Survey Team! 👋
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Here's what's happening with your surveys today.
                </p>
              </motion.div>
            </div>

            {/* Navigation Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
              <div className="w-full sm:w-auto flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-white/30">
                {tabs.map((tab) => (
                  <PillButton
                    key={tab.id}
                    variant="primary"
                    size="sm"
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full sm:w-auto"
                  >
                    {tab.label}
                  </PillButton>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
                <PillButton variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </PillButton>
                <PillButton variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </PillButton>
                <Link href="/surveys/new">
                  <PillButton
                    size="sm"
                    className="bg-gradient-to-br from-blue-500 to-blue-500 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Survey
                  </PillButton>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard
                  title="Total Surveys"
                  value={stats.totalSurveys}
                  subtitle="All time"
                  trend={{ value: "+12%", direction: "up" }}
                  icon={<BarChart3 className="w-6 h-6" />}
                  color="amber"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatCard
                  title="Completed"
                  value={stats.completedSurveys}
                  subtitle="This month"
                  trend={{ value: "+8%", direction: "up" }}
                  icon={<Activity className="w-6 h-6" />}
                  color="green"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StatCard
                  title="Active Cameras"
                  value={stats.onlineCameras}
                  subtitle="Online now"
                  trend={{ value: "85%", direction: "neutral" }}
                  icon={<Camera className="w-6 h-6" />}
                  color="blue"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <StatCard
                  title="Team Members"
                  value={stats.activeSurveyors}
                  subtitle="Active today"
                  trend={{ value: "+3", direction: "up" }}
                  icon={<Users className="w-6 h-6" />}
                  color="purple"
                />
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
              {/* Progress Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="lg:col-span-2"
              >
                <ModernCard className="h-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Survey Progress
                      </h3>
                      <p className="text-sm text-gray-600">
                        Real-time progress tracking
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <PillButton variant="secondary" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 days
                      </PillButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="text-center">
                      <ProgressRing
                        progress={stats.completionRate}
                        size={120} // Base size, adjust in ProgressRing if needed
                      >
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {Math.round(stats.completionRate)}%
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Completion
                          </div>
                        </div>
                      </ProgressRing>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          Completed Surveys
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-green-600">
                          {stats.completedSurveys}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 sm:h-2 rounded-full"
                          style={{
                            width: `${
                              (stats.completedSurveys / stats.totalSurveys) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          Pending Surveys
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-amber-600">
                          {stats.pendingSurveys}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1.5 sm:h-2 rounded-full"
                          style={{
                            width: `${
                              (stats.pendingSurveys / stats.totalSurveys) * 100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          Active Cameras
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-blue-600">
                          {stats.onlineCameras}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 sm:h-2 rounded-full"
                          style={{
                            width: `${
                              (stats.onlineCameras / stats.totalCameras) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <ModernCard className="h-full">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Recent Activity
                    </h3>
                    <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    {recentSurveys.map((survey, index) => (
                      <motion.div
                        key={survey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30"
                      >
                        <div
                          className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${
                            survey.status === "survey-completed"
                              ? "bg-green-500"
                              : survey.status === "in-progress"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {survey.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            {survey.surveyor} • {survey.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {survey.progress}%
                          </div>
                          <div className="w-8 sm:w-12 bg-gray-200 rounded-full h-1 sm:h-1.5 mt-1">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1 sm:h-1.5 rounded-full"
                              style={{ width: `${survey.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ModernCard>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4"
            >
              <Link href="/surveys/new">
                <PillButton variant="accent" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  New Survey
                </PillButton>
              </Link>

              <Link href="/map">
                <PillButton variant="secondary" size="lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  View Map
                </PillButton>
              </Link>

              <PillButton variant="secondary" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </PillButton>

              <PillButton variant="secondary" size="lg">
                <Filter className="w-5 h-5 mr-2" />
                Advanced Filters
              </PillButton>
            </motion.div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
