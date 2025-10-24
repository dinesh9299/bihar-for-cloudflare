"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import bpi from "@/lib/bpi";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const res = await bpi.get("/app-user/me?populate=*", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ User data:", res.data.user);
        setUser(res.data.user);
      } catch (err: any) {
        console.error("❌ Error fetching user:", err);
        setError("Failed to fetch user. Token might be invalid or expired.");
      }
    };

    fetchUser();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-[400px]">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Logged-in User</h2>
        <pre className="bg-gray-100 text-sm text-gray-700 p-3 rounded-md overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Page;
