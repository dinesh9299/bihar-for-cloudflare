"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { message, Spin, Button, Input } from "antd";
import {
  CheckCircle,
  AlertCircle,
  Shield,
  Mail,
  Phone,
  MapPin,
  Users,
  FileText,
} from "lucide-react";

const AadharVerificationPage = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [clientId, setClientId] = useState("");
  const [verifying, setVerifying] = useState(false);

  const STRAPI_BASE = process.env.NEXT_PUBLIC_API_URL;
  const AADHAR_API = "https://aadharverification.womenrider.com/aadhar";
  const AUTH_TOKEN = process.env.NEXT_PUBLIC_AADHAR_BEARER;

  // 🔹 Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${STRAPI_BASE}/app-user/me?populate=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ User Data:", res.data.user);
        setUser(res.data.user);
      } catch (err: any) {
        console.error("❌ Error fetching user:", err);
        setError("Failed to fetch user. Token might be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Send OTP automatically using user's Aadhaar
  const handleSendOtp = async () => {
    if (!user?.Aadhar || user.Aadhar.length !== 12) {
      return message.error("Invalid or missing Aadhaar number in profile.");
    }

    try {
      setVerifying(true);
      const res = await axios.post(
        `${AADHAR_API}/send-otp`,
        { aadharNumber: user.Aadhar },
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        }
      );

      console.log("📤 OTP Sent:", res.data);
      setClientId(res.data.clientId);
      setOtpSent(true);
      message.success("OTP sent successfully!");
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      message.error("Failed to send OTP. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  // 🔹 Verify OTP and update in Strapi
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      return message.warning("Please enter a valid 6-digit OTP.");
    }

    try {
      setVerifying(true);
      const verifyRes = await axios.post(
        `${AADHAR_API}/verifi-otp`,
        {
          otp,
          clientId,
          aadharNumber: user.Aadhar,
        },
        {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        }
      );

      console.log("✅ Verification Response:", verifyRes.data);

      const { data } = verifyRes.data;

      if (
        verifyRes.data.message === "OTP VERIFIED" &&
        data?.status === "success_aadhaar"
      ) {
        // ✅ Update Strapi user with verified status + optional KYC info
        await axios.put(`${STRAPI_BASE}/app-users/updateAadharVerified`, {
          documentId: user.documentId,
          verified: true,
          kycDetails: {
            full_name: data.full_name,
            dob: data.dob,
            gender: data.gender,
            address: data.address,
            reference_id: data.reference_id,
            zip: data.zip,
          },
        });

        message.success("Aadhaar verified successfully ✅");
        setUser((prev: any) => ({
          ...prev,
          aadhar_verified: true,
          full_name: data.full_name,
          dob: data.dob,
          gender: data.gender,
        }));
      } else {
        message.error("OTP verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ OTP Verify Error:", err);
      message.error("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // 🔹 Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        <Spin size="large" />
      </div>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Error</h3>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // 🔹 Main UI
  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            Aadhaar Verification
          </h1>
          <p className="text-gray-600 text-lg">
            Secure your account with Aadhaar verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Card */}
            {user && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Profile Information
                </h2>

                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Full Name
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {user.Full_Name || "—"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Email
                      </p>
                      <p className="text-lg font-semibold text-black flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Phone Number
                      </p>
                      <p className="text-lg font-semibold text-black flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {user.Phone_Number || "—"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        District
                      </p>
                      <p className="text-lg font-semibold text-black flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {user.District || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Assembly
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {user.Assembly || "—"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Village
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {user.Village || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Father's Name
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {user.Father_Name || "—"}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Mother's Name
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {user.Mother_Name || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Aadhaar */}
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Aadhaar Number
                    </p>
                    <p className="text-xl font-bold text-black flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {user.Aadhar || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Verification Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              {/* Verification Status */}
              <div className="mb-6">
                <div className="text-center">
                  {user?.aadhar_verified ? (
                    <div className="space-y-3">
                      <div className="flex justify-center mb-3">
                        <div className="p-4 bg-green-100 rounded-full">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-black">Verified</h3>
                      <p className="text-sm text-gray-600">
                        Your Aadhaar has been successfully verified
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-semibold text-green-700">
                          ✅ Verification Complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center mb-3">
                        <div className="p-4 bg-yellow-100 rounded-full">
                          <AlertCircle className="w-12 h-12 text-yellow-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-black">
                        Pending Verification
                      </h3>
                      <p className="text-sm text-gray-600">
                        Complete verification to unlock all features
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Section */}
              {!user?.aadhar_verified ? (
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  {!otpSent ? (
                    <Button
                      type="primary"
                      block
                      size="large"
                      loading={verifying}
                      onClick={handleSendOtp}
                      style={{
                        background:
                          "linear-gradient(to right, #3b82f6, #10b981)",
                        borderColor: "transparent",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {verifying ? "Sending OTP..." : "Send OTP to Aadhaar"}
                    </Button>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Enter the 6-digit OTP sent to your Aadhaar-registered
                          mobile
                        </p>
                        <Input
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          size="large"
                          className="text-center tracking-widest text-lg font-bold"
                        />
                      </div>
                      <Button
                        type="primary"
                        block
                        size="large"
                        loading={verifying}
                        onClick={handleVerifyOtp}
                        style={{
                          background:
                            "linear-gradient(to right, #3b82f6, #10b981)",
                          borderColor: "transparent",
                          height: "48px",
                          fontSize: "16px",
                          fontWeight: "600",
                        }}
                      >
                        {verifying ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Didn't receive OTP?{" "}
                        <button
                          onClick={handleSendOtp}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Resend
                        </button>
                      </p>
                    </>
                  )}

                  {/* Info Box */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-green-900 mb-2 text-sm">
                      Why verify?
                    </h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>✓ Enhanced account security</li>
                      <li>✓ Comply with election guidelines</li>
                      <li>✓ Access all features</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-green-700">
                    ✅ Your Aadhaar is already verified
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AadharVerificationPage;
