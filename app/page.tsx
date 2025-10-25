"use client";

import React, { useState } from "react";
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
      // STEP 1️⃣ Try Strapi default user login
      let data = null;
      let isAppUser = false;

      try {
        const res = await api.post("/auth/local", {
          identifier: credentials.username,
          password: credentials.password,
        });

        data = res.data;
        console.log("✅ Logged in as default user:", data);

        // ✅ Save JWT in localStorage (for frontend API calls)
        localStorage.setItem("token", data.jwt);
        localStorage.setItem(
          "tokenExpiration",
          (Date.now() + 24 * 60 * 60 * 1000).toString()
        );
      } catch (defaultErr: any) {
        console.warn(
          "Default user login failed, trying App User...",
          defaultErr.message
        );

        // STEP 2️⃣ Try App User login
        const res2 = await api.post("/app-user/login", {
          email: credentials.username,
          password: credentials.password,
        });

        data = res2.data;
        isAppUser = true;
        console.log("✅ Logged in as app user:", data);

        // ✅ Save JWT in localStorage (for frontend API calls)
        localStorage.setItem("token", data.jwt);
        localStorage.setItem(
          "tokenExpiration",
          (Date.now() + 24 * 60 * 60 * 1000).toString()
        );
      }

      // STEP 3️⃣ Determine role and username
      let roleName = "";
      let username = "";

      if (isAppUser) {
        roleName = data.user?.role.toLowerCase() || "app-user";
        username = data.user?.Full_Name || data.user?.email;
      } else {
        const userRes = await api.get("/users/me?populate=*");
        const userData = userRes.data;
        roleName = userData?.role?.name?.toLowerCase();
        username = userData?.username;
      }

      // 🚨 REMOVE THIS OLD CODE:
      // Cookies.set("token", data.jwt, { expires: 1 });
      // Cookies.set("role", roleName, { expires: 1 });

      // ✅ REPLACE WITH THIS:
      // This tells Next.js (server) to set cookies readable by middleware
      console.log("🟢 Role to set:", roleName);
      const response = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.jwt,
          role: roleName,
        }),
      });
      const resData = await response.json();
      console.log("🍪 Cookie API response:", resData);

      // STEP 4️⃣ Success toast
      toast({
        variant: "success",
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });

      // STEP 5️⃣ Redirect based on role
      if (roleName === "superadmin") {
        router.push("/dashboard");
      } else if (roleName === "district coordinator") {
        router.push("/district/dashboard");
      } else if (
        roleName.toLowerCase() === "assembly coordinator" ||
        roleName === "app-user"
      ) {
        router.push("/assembly/dashboard");
      } else if (roleName === "block coordinator") {
        router.push("/block/dashboard");
      } else if (roleName === "booth coordinator") {
        router.push("/booth/locations");
      } else {
        router.push("/home"); // default route
      }
    } catch (err: any) {
      console.error("❌ Login failed completely:", err);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials or server error.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Location Management",
      description: "Manage polling booth locations",
    },
    {
      icon: <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Voter Monitoring",
      description: "Real-time election monitoring",
    },
    {
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Team Coordination",
      description: "Coordinate election observers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 sm:left-40 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-200/30 to-green-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 lg:px-12">
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
                className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-xl"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Bihar Election
                </h1>
                <p className="text-lg text-black">Monitoring System</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-black mb-6 leading-tight">
              Comprehensive Election{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Monitoring Platform
              </span>
            </h2>

            <p className="text-lg text-black mb-8 leading-relaxed">
              Streamline your election management process with our comprehensive
              monitoring platform. Track locations, manage teams, and ensure
              smooth conduct of elections across all polling booths in Bihar.
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
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl text-blue-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black text-base">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-black">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-black">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
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
            <ModernCard className="shadow-2xl p-6" padding="xl">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-black mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-black">
                  Sign in to access your monitoring dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-black">
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
                    required
                    className="text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">
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
                      required
                      className="pr-12 text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-black/70"
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
                >
                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
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

              <div className="mt-8 pt-6 border-t border-black/10">
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>System Online</span>
                  </div>
                  <div className="w-px h-4 bg-black/20" />
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Zap className="w-4 h-4" />
                    <span>Monitoring Active</span>
                  </div>
                </div>
              </div>
            </ModernCard>

            <div className="mt-6 text-center">
              <p className="text-xs text-black">
                Protected by enterprise-grade security • Version 2.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
