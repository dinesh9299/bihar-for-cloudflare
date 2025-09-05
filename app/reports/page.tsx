"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { ModernSidebar } from "@/components/layout/modern-sidebar"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernCard } from "@/components/ui/modern-card"
import { PillButton } from "@/components/ui/pill-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, PieChart, TrendingUp, Calendar, FileText, Camera } from "lucide-react"

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedDivision, setSelectedDivision] = useState("all")

  const reportData = {
    totalSurveys: 156,
    completedSurveys: 124,
    pendingSurveys: 32,
    totalCameras: 468,
    divisionsData: [
      { name: "Pune", surveys: 45, cameras: 156, completion: 89 },
      { name: "Mumbai", surveys: 38, cameras: 142, completion: 76 },
      { name: "Nashik", surveys: 28, cameras: 98, completion: 82 },
      { name: "Nagpur", surveys: 25, cameras: 72, completion: 88 },
      { name: "Aurangabad", surveys: 20, cameras: 68, completion: 75 },
    ],
    monthlyProgress: [
      { month: "Jan", surveys: 12, cameras: 42 },
      { month: "Feb", surveys: 18, cameras: 58 },
      { month: "Mar", surveys: 22, cameras: 76 },
      { month: "Apr", surveys: 28, cameras: 94 },
      { month: "May", surveys: 35, cameras: 118 },
      { month: "Jun", surveys: 41, cameras: 142 },
    ],
  }

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader title="Survey Reports" subtitle="Analytics and progress tracking" showGPS={false} />

          <main className="flex-1 overflow-y-auto p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PillButton variant="accent">
                <Download className="w-4 h-4 mr-2" />
                Export
              </PillButton>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalSurveys}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-2xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.completedSurveys}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      79% completion rate
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-2xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{reportData.pendingSurveys}</p>
                    <p className="text-xs text-orange-600 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      21% remaining
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ModernCard>

              <ModernCard>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cameras</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.totalCameras}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Camera className="w-3 h-3 mr-1" />
                      Across all locations
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-2xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Division Performance */}
            <ModernCard className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Division Performance</h3>
              <p className="text-gray-600 mb-6">Survey completion status by division</p>

              <div className="space-y-4">
                {reportData.divisionsData.map((division) => (
                  <div
                    key={division.name}
                    className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{division.name}</h4>
                        <p className="text-sm text-gray-500">
                          {division.surveys} surveys • {division.cameras} cameras
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{division.completion}%</p>
                        <p className="text-xs text-gray-500">Completion</p>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full"
                          style={{ width: `${division.completion}%` }}
                        ></div>
                      </div>
                      <Badge
                        variant={
                          division.completion > 85 ? "default" : division.completion > 70 ? "secondary" : "outline"
                        }
                      >
                        {division.completion > 85 ? "Excellent" : division.completion > 70 ? "Good" : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Monthly Progress */}
            <ModernCard className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Progress</h3>
              <p className="text-gray-600 mb-6">Survey and camera installation trends</p>

              <div className="grid grid-cols-6 gap-4">
                {reportData.monthlyProgress.map((month) => (
                  <div key={month.month} className="text-center">
                    <div className="bg-blue-100 p-4 rounded-2xl mb-2">
                      <div className="text-lg font-bold text-blue-600">{month.surveys}</div>
                      <div className="text-xs text-blue-600">Surveys</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-2xl mb-2">
                      <div className="text-lg font-bold text-green-600">{month.cameras}</div>
                      <div className="text-xs text-green-600">Cameras</div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{month.month}</div>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <PillButton variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Survey Data
              </PillButton>
              <PillButton variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </PillButton>
              <PillButton variant="secondary">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </PillButton>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  )
}
