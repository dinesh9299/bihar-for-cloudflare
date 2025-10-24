"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { message, Spin, Button, Input } from "antd";

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
  const AUTH_TOKEN = process.env.NEXT_PUBLIC_AADHAR_BEARER; // Add this to .env.local

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
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 font-medium">
        {error}
      </div>
    );
  }

  // 🔹 Main UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          User Aadhaar Verification
        </h2>

        {/* ✅ User Info Card */}
        {user && (
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg mb-4">
            <div>
              <strong>Full Name:</strong>
              <p>{user.Full_Name || "—"}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{user.email || "—"}</p>
            </div>
            <div>
              <strong>Phone:</strong>
              <p>{user.Phone_Number || "—"}</p>
            </div>
            <div>
              <strong>District:</strong>
              <p>{user.District || "—"}</p>
            </div>
            <div>
              <strong>Assembly:</strong>
              <p>{user.Assembly || "—"}</p>
            </div>
            <div>
              <strong>Aadhaar No:</strong>
              <p>{user.Aadhar || "—"}</p>
            </div>
            <div>
              <strong>Father Name:</strong>
              <p>{user.Father_Name || "—"}</p>
            </div>
            <div>
              <strong>Mother Name:</strong>
              <p>{user.Mother_Name || "—"}</p>
            </div>
            <div>
              <strong>Village:</strong>
              <p>{user.Village || "—"}</p>
            </div>
            <div>
              <strong>Verified:</strong>
              <p>
                {user.aadhar_verified ? (
                  <span className="text-green-600 font-semibold">✅ Yes</span>
                ) : (
                  <span className="text-red-500 font-semibold">❌ No</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* 🚨 Aadhaar Verification Section */}
        {!user?.aadhar_verified ? (
          <div className="mt-6">
            {!otpSent ? (
              <Button
                type="primary"
                block
                loading={verifying}
                onClick={handleSendOtp}
              >
                Send OTP to Aadhaar
              </Button>
            ) : (
              <>
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="mb-3"
                />
                <Button
                  type="primary"
                  block
                  loading={verifying}
                  onClick={handleVerifyOtp}
                >
                  Verify OTP
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center text-green-600 font-semibold">
            ✅ Your Aadhaar is already verified
          </div>
        )}
      </div>
    </div>
  );
};

export default AadharVerificationPage;
