"use client";

import type React from "react";
import { useState } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
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

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsLoading(true)

  //   // Simulate API call
  //   await new Promise((resolve) => setTimeout(resolve, 1500))

  //   if (credentials.username && credentials.password) {
  //     window.location.href = "/dashboard"
  //   }
  //   setIsLoading(false)
  // }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Login
      const res = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error.message);
        setIsLoading(false);
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.jwt);

      // Step 2: Fetch full user with role
      const userRes = await fetch(
        "http://localhost:1337/api/users/me?populate=*",
        {
          headers: {
            Authorization: `Bearer ${data.jwt}`,
          },
        }
      );

      const userData = await userRes.json();

      // Save user in localStorage
      // localStorage.setItem("user", JSON.stringify(userData));

      const roleName = userData?.role?.name?.toLowerCase();
      console.log("User Role:", roleName);

      // Step 3: Redirect based on role
      if (roleName === "superadmin") {
        window.location.href = "/dashboard";
      } else if (roleName === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (roleName === "technician") {
        window.location.href = "/technician";
      } else {
        alert("Unauthorized role");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong, please try again.");
    }

    setIsLoading(false);
  };

  const features = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "GPS Tracking",
      description: "Real-time location tracking",
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Smart Surveys",
      description: "Intelligent survey forms",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Team Collaboration",
      description: "Multi-user access control",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="flex items-center space-x-4 mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl shadow-xl"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MSRTC CCTV</h1>
                <p className="text-lg text-gray-600">
                  Survey Management System
                </p>
              </div>
            </div>

            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Advanced Site Survey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                for Bus Stop Security
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Streamline your CCTV installation process with our comprehensive
              survey management platform. Track locations, manage teams, and
              ensure optimal camera placement across all MSRTC facilities.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <ModernCard className="p-4" hover={false}>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl text-amber-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Mobile Ready</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <ModernCard className="shadow-2xl" padding="xl">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to access your survey dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
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
                    className="h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-amber-400 focus:ring-amber-400/20 rounded-2xl"
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
                      className="h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-amber-400 focus:ring-amber-400/20 rounded-2xl pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
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
                    className="w-full h-12 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </motion.div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>System Online</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center space-x-2 text-amber-600">
                    <Zap className="w-3 h-3" />
                    <span>GPS Ready</span>
                  </div>
                </div>
              </div>
            </ModernCard>

            <div className="mt-6 text-center">
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
