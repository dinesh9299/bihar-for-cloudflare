"use client";

import { useState } from "react";
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState({
    totalSurveys: 156,
    completedSurveys: 124,
    pendingSurveys: 32,
    totalCameras: 468,
    onlineCameras: 398,
    offlineCameras: 70,
    activeSurveyors: 24,
    completionRate: 79.5,
  });

  const recentSurveys = [
    {
      id: "SRV-2024-001",
      location: "Pune Central Bus Station",
      division: "Pune",
      status: "completed",
      surveyor: "Rajesh Kumar",
      time: "2h ago",
      progress: 100,
    },
    {
      id: "SRV-2024-002",
      location: "Mumbai Dadar Terminal",
      division: "Mumbai",
      status: "in-progress",
      surveyor: "Priya Sharma",
      time: "4h ago",
      progress: 65,
    },
    {
      id: "SRV-2024-003",
      location: "Nashik Road Bus Stand",
      division: "Nashik",
      status: "pending",
      surveyor: "Amit Patil",
      time: "6h ago",
      progress: 25,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "surveys", label: "Surveys" },
    { id: "analytics", label: "Analytics" },
    { id: "team", label: "Team" },
  ];

  return (
    <PageLayout>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Good morning, Survey Team! 👋
                </h2>
                <p className="text-gray-600">
                  Here's what's happening with your surveys today.
                </p>
              </motion.div>
            </div>

            {/* Navigation Pills */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-white/30">
                {tabs.map((tab) => (
                  <PillButton
                    key={tab.id}
                    variant="primary"
                    size="sm"
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </PillButton>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <PillButton variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </PillButton>
                <PillButton variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </PillButton>
                <Link href="/surveys/new">
                  <PillButton variant="accent" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Survey
                  </PillButton>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Progress Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="lg:col-span-2"
              >
                <ModernCard className="h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Survey Progress
                      </h3>
                      <p className="text-gray-600">
                        Real-time progress tracking
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PillButton variant="secondary" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 days
                      </PillButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <ProgressRing progress={stats.completionRate} size={140}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.completionRate}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Completion
                          </div>
                        </div>
                      </ProgressRing>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Completed Surveys
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {stats.completedSurveys}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (stats.completedSurveys / stats.totalSurveys) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Pending Surveys
                        </span>
                        <span className="text-sm font-bold text-amber-600">
                          {stats.pendingSurveys}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (stats.pendingSurveys / stats.totalSurveys) * 100
                            }%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Active Cameras
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {stats.onlineCameras}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Recent Activity
                    </h3>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    {recentSurveys.map((survey, index) => (
                      <motion.div
                        key={survey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            survey.status === "completed"
                              ? "bg-green-500"
                              : survey.status === "in-progress"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {survey.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            {survey.surveyor} • {survey.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-900">
                            {survey.progress}%
                          </div>
                          <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1 rounded-full"
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
              className="flex flex-wrap gap-4"
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
