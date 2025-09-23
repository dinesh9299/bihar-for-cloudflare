"use client";

import type React from "react";
import { useState } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import {
  Shield,
  MapPin,
  Camera,
  Users,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Login
      const res = await api.post("/auth/local", {
        identifier: credentials.username,
        password: credentials.password,
      });

      const data = res.data;

      if (data.error) {
        throw new Error(data.error.message || "Invalid credentials");
      }

      // Save JWT and expiration time (1 hour from now)
      const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("tokenExpiration", expirationTime.toString());

      // Step 2: Fetch full user with role
      const userRes = await api.get("/users/me?populate=*");
      const userData = userRes.data;

      const roleName = userData?.role?.name?.toLowerCase();
      console.log("User Role:", roleName);

      Cookies.set("token", data.jwt, { expires: 1 }); // expires in 1 day
      Cookies.set("role", roleName, { expires: 1 });

      toast({
        variant: "success",
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
      });

      // Step 3: Redirect based on role
      if (roleName === "superadmin") {
        router.push("/dashboard");
      } else if (roleName === "admin") {
        router.push("/admin/dashboard");
      } else if (roleName === "technician") {
        router.push("/technician/dashboard");
      } else if (roleName === "purchase") {
        router.push("/purchase/dashboard");
      } else {
        throw new Error("Unauthorized role");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Something went wrong, please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "GPS Tracking",
      description: "Real-time location tracking",
    },
    {
      icon: <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Smart Surveys",
      description: "Intelligent survey forms",
    },
    {
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Team Collaboration",
      description: "Multi-user access control",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 sm:left-40 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-3 sm:p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl sm:rounded-2xl shadow-xl"
              >
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  MSRTC CCTV
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Survey Management System
                </p>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Advanced Site Survey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                for Bus Stop Security
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Streamline your CCTV installation process with our comprehensive
              survey management platform. Track locations, manage teams, and
              ensure optimal camera placement across all MSRTC facilities.
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <ModernCard className="p-3 sm:p-4" hover={false}>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl text-amber-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Mobile Ready</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <ModernCard className="shadow-2xl p-4 sm:p-6" padding="xl">
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
                >
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-600">
                  Sign in to access your survey dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                    className="h-10 sm:h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      className="h-10 sm:h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl sm:rounded-2xl pr-12 text-sm sm:text-base"
                      required
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

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <button
                    type="submit"
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-medium rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </button>
                </motion.div>
              </form>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>System Online</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center space-x-2 text-amber-600">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>GPS Ready</span>
                  </div>
                </div>
              </div>
            </ModernCard>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs text-gray-500">
                Protected by enterprise-grade security • Version 2.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
