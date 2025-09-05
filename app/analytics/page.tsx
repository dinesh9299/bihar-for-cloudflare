"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { ModernSidebar } from "@/components/layout/modern-sidebar"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernCard } from "@/components/ui/modern-card"
import { PillButton } from "@/components/ui/pill-button"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  MapPin,
  Clock,
  Target,
  Zap,
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [division, setDivision] = useState("all")

  const analyticsData = {
    overview: {
      totalSurveys: 156,
      completionRate: 79.5,
      avgSurveyTime: 2.4,
      efficiency: 85.2,
    },
    trends: {
      surveysThisMonth: 45,
      surveysLastMonth: 38,
      camerasInstalled: 142,
      camerasLastMonth: 128,
    },
    performance: [
      { division: "Pune", surveys: 45, completion: 89, efficiency: 92 },
      { division: "Mumbai", surveys: 38, completion: 76, efficiency: 78 },
      { division: "Nashik", surveys: 28, completion: 82, efficiency: 85 },
      { division: "Nagpur", surveys: 25, completion: 88, efficiency: 90 },
      { division: "Aurangabad", surveys: 20, completion: 75, efficiency: 80 },
    ],
    timeline: [
      { month: "Jan", surveys: 12, cameras: 42, completion: 75 },
      { month: "Feb", surveys: 18, cameras: 58, completion: 78 },
      { month: "Mar", surveys: 22, cameras: 76, completion: 82 },
      { month: "Apr", surveys: 28, cameras: 94, completion: 85 },
      { month: "May", surveys: 35, cameras: 118, completion: 88 },
      { month: "Jun", surveys: 41, cameras: 142, completion: 79 },
    ],
  }

  const surveyGrowth = (
    ((analyticsData.trends.surveysThisMonth - analyticsData.trends.surveysLastMonth) /
      analyticsData.trends.surveysLastMonth) *
    100
  ).toFixed(1)
  const cameraGrowth = (
    ((analyticsData.trends.camerasInstalled - analyticsData.trends.camerasLastMonth) /
      analyticsData.trends.camerasLastMonth) *
    100
  ).toFixed(1)

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="Analytics Dashboard"
            subtitle="Comprehensive insights and performance metrics"
            showGPS={false}
          />

          <main className="flex-1 overflow-y-auto p-6">
            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="nashik">Nashik</SelectItem>
                    <SelectItem value="nagpur">Nagpur</SelectItem>
                    <SelectItem value="aurangabad">Aurangabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3">
                <PillButton variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </PillButton>
                <PillButton variant="accent" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </PillButton>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <StatCard
                  title="Total Surveys"
                  value={analyticsData.overview.totalSurveys}
                  subtitle="All time"
                  trend={{ value: `+${surveyGrowth}%`, direction: "up" }}
                  icon={<BarChart3 className="w-6 h-6" />}
                  color="amber"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard
                  title="Completion Rate"
                  value={`${analyticsData.overview.completionRate}%`}
                  subtitle="This month"
                  trend={{ value: "+5.2%", direction: "up" }}
                  icon={<Target className="w-6 h-6" />}
                  color="green"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatCard
                  title="Avg Survey Time"
                  value={`${analyticsData.overview.avgSurveyTime}h`}
                  subtitle="Per survey"
                  trend={{ value: "-0.3h", direction: "down" }}
                  icon={<Clock className="w-6 h-6" />}
                  color="blue"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StatCard
                  title="Efficiency Score"
                  value={`${analyticsData.overview.efficiency}%`}
                  subtitle="Team performance"
                  trend={{ value: "+2.1%", direction: "up" }}
                  icon={<Zap className="w-6 h-6" />}
                  color="purple"
                />
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Completion Rate Circle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ModernCard className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Progress</h3>
                  <ProgressRing progress={analyticsData.overview.completionRate} size={160}>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.completionRate}%</div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                  </ProgressRing>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{analyticsData.trends.surveysThisMonth}</div>
                      <div className="text-gray-600">This Month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.trends.camerasInstalled}</div>
                      <div className="text-gray-600">Cameras</div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>

              {/* Monthly Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="lg:col-span-2"
              >
                <ModernCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Monthly Trends</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
                        <span>Surveys</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                        <span>Cameras</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.timeline.map((month, index) => (
                      <div key={month.month} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Surveys: {month.surveys}</span>
                            <span className="text-sm font-medium">{month.completion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${(month.surveys / 50) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Cameras: {month.cameras}</span>
                            <span className="text-sm font-medium">{Math.round((month.cameras / 150) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                              style={{ width: `${(month.cameras / 150) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModernCard>
              </motion.div>
            </div>

            {/* Division Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ModernCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Division Performance</h3>
                  <PillButton variant="secondary" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last 30 days
                  </PillButton>
                </div>

                <div className="space-y-4">
                  {analyticsData.performance.map((division, index) => (
                    <motion.div
                      key={division.division}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-2xl">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{division.division}</h4>
                          <p className="text-sm text-gray-600">{division.surveys} surveys completed</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{division.completion}%</div>
                          <div className="text-xs text-gray-600">Completion</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{division.efficiency}%</div>
                          <div className="text-xs text-gray-600">Efficiency</div>
                        </div>

                        <div className="w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${division.completion}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {division.completion > 85 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${division.completion > 85 ? "text-green-600" : "text-red-600"}`}
                          >
                            {division.completion > 85 ? "Excellent" : "Needs Improvement"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ModernCard>
            </motion.div>
          </main>
        </div>
      </div>
    </PageLayout>
  )
}
