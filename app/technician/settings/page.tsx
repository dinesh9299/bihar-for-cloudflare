"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: "Survey Team Admin",
      email: "admin@msrtc.gov.in",
      phone: "+91 98765 43210",
      division: "All",
      role: "Administrator",
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      surveyReminders: true,
      systemUpdates: false,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: "1year",
      gpsAccuracy: "high",
      cameraQuality: "4k",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30min",
      passwordExpiry: "90days",
      loginAttempts: "5",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("tokenExpiration");
    const currentTime = Date.now();

    if (!token || (expirationTime && currentTime > parseInt(expirationTime))) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
      router.push("/");
      return;
    }
  }, []);

  const token = localStorage.getItem("token");
  const { toast } = useToast();

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    { id: "system", label: "System", icon: <Database className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  ];

  const handleSave = () => {
    console.log("Settings saved:", settings);
    toast({
      variant: "success",
      title: "Success",
      description: "Settings saved successfully!",
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
        passwordConfirmation: passwordData.confirmPassword,
      });

      if (res.status !== 200) {
        throw new Error(
          res.data?.error?.message || "Failed to update password"
        );
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Password updated successfully!",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the password");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update password",
      });
    }
  };

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto ">
        <div className="max-w-full sm:max-w-3xl lg:max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <ModernCard className="p-2 sm:p-3">
              <div className="flex flex-wrap gap-2 sm:gap-3 bg-white/50 backdrop-blur-sm rounded-full p-1 sm:p-2 border border-white/30">
                {tabs.map((tab) => (
                  <PillButton
                    key={tab.id}
                    variant="primary"
                    size="sm"
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </PillButton>
                ))}
              </div>
            </ModernCard>
          </motion.div>

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Profile Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Update your personal information and preferences
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            name: e.target.value,
                          },
                        })
                      }
                      className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            email: e.target.value,
                          },
                        })
                      }
                      className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: {
                            ...settings.profile,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="division" className="text-sm font-medium">
                      Division
                    </Label>
                    <Select
                      value={settings.profile.division}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          profile: { ...settings.profile, division: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Divisions</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Nashik">Nashik</SelectItem>
                        <SelectItem value="Nagpur">Nagpur</SelectItem>
                        <SelectItem value="Aurangabad">Aurangabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                        Profile Picture
                      </h4>
                      <p className="text-sm text-gray-600">
                        Upload a new profile picture
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <PillButton
                        variant="secondary"
                        size="sm"
                        className="px-3 sm:px-4"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </PillButton>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Notification Preferences
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose how you want to receive notifications
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(settings.notifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl"
                      >
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {key === "emailAlerts" &&
                              "Receive email notifications for important updates"}
                            {key === "smsAlerts" &&
                              "Get SMS alerts for critical system events"}
                            {key === "pushNotifications" &&
                              "Browser push notifications for real-time updates"}
                            {key === "surveyReminders" &&
                              "Reminders for pending and upcoming surveys"}
                            {key === "systemUpdates" &&
                              "Notifications about system maintenance and updates"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [key]: !value,
                              },
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      System Configuration
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure system behavior and data management
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Backup Frequency
                    </Label>
                    <Select
                      value={settings.system.backupFrequency}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          system: {
                            ...settings.system,
                            backupFrequency: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Data Retention
                    </Label>
                    <Select
                      value={settings.system.dataRetention}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          system: { ...settings.system, dataRetention: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">GPS Accuracy</Label>
                    <Select
                      value={settings.system.gpsAccuracy}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          system: { ...settings.system, gpsAccuracy: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (±10m)</SelectItem>
                        <SelectItem value="medium">Medium (±5m)</SelectItem>
                        <SelectItem value="high">High (±1m)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Camera Quality
                    </Label>
                    <Select
                      value={settings.system.cameraQuality}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          system: { ...settings.system, cameraQuality: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                        Auto Backup
                      </h4>
                      <p className="text-sm text-gray-600">
                        Automatically backup survey data
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          system: {
                            ...settings.system,
                            autoBackup: !settings.system.autoBackup,
                          },
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.system.autoBackup
                          ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.system.autoBackup
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl sm:rounded-2xl">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Security Settings
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage your account security and access controls
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Session Timeout
                      </Label>
                      <Select
                        value={settings.security.sessionTimeout}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              sessionTimeout: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15min">15 Minutes</SelectItem>
                          <SelectItem value="30min">30 Minutes</SelectItem>
                          <SelectItem value="1hour">1 Hour</SelectItem>
                          <SelectItem value="4hours">4 Hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Password Expiry
                      </Label>
                      <Select
                        value={settings.security.passwordExpiry}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordExpiry: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30days">30 Days</SelectItem>
                          <SelectItem value="60days">60 Days</SelectItem>
                          <SelectItem value="90days">90 Days</SelectItem>
                          <SelectItem value="180days">180 Days</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl">
                      <div>
                        <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              twoFactorAuth: !settings.security.twoFactorAuth,
                            },
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.twoFactorAuth
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.security.twoFactorAuth
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl">
                      <h4 className="font-medium text-gray-900 text-base sm:text-lg mb-3 sm:mb-4">
                        Change Password
                      </h4>
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-3 sm:space-y-4"
                      >
                        {error && (
                          <p className="text-red-600 text-sm">{error}</p>
                        )}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              placeholder="Enter current password"
                              className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl pr-12 text-sm sm:text-base"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              New Password
                            </Label>
                            <Input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Enter new password"
                              className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Confirm Password
                            </Label>
                            <Input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              placeholder="Confirm new password"
                              className="h-10 sm:h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        <PillButton
                          variant="accent"
                          size="sm"
                          type="submit"
                          className="px-3 sm:px-4"
                        >
                          Update Password
                        </PillButton>
                      </form>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Save Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6"
          >
            <PillButton
              variant="secondary"
              size="lg"
              className="h-10 sm:h-12 px-4 sm:px-6 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </PillButton>
            <PillButton
              variant="accent"
              size="lg"
              onClick={handleSave}
              className="h-10 sm:h-12 px-4 sm:px-6 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </PillButton>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
