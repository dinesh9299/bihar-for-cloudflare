"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import bpi from "@/lib/bpi";

const Page = () => {
  const [user, setUser] = useState<any>(null);
  const [assembly, setAssembly] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const baseurl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        // 1️⃣ Fetch the logged-in user
        const userRes = await axios.get(`${baseurl}/app-user/me?populate=*`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentUser = userRes.data.user;
        setUser(currentUser);

        // 2️⃣ Get user’s Assembly_No (from user.assemblies[0])
        const userAssemblyNo = currentUser?.assemblies?.[0]?.Assembly_No;

        if (!userAssemblyNo) {
          setError("No Assembly assigned to this user.");
          setLoading(false);
          return;
        }

        console.log("🟢 Logged-in user's Assembly_No:", userAssemblyNo);

        // 3️⃣ Fetch all assemblies with locations populated
        const assembliesRes = await bpi.get(
          "/assemblies?pagination[pageSize]=1000&populate=*"
        );

        const allAssemblies = assembliesRes.data.data || [];

        // 4️⃣ Find the assembly matching user’s Assembly_No
        const matchedAssembly = allAssemblies.find(
          (asm: any) => asm.Assembly_No === userAssemblyNo
        );

        if (!matchedAssembly) {
          setError("No assembly found for this Assembly_No.");
          setLoading(false);
          return;
        }

        setAssembly(matchedAssembly);
        setLocations(matchedAssembly.locations || []);

        console.log(
          "✅ Matched Assembly:",
          matchedAssembly.Assembly_Name,
          "with",
          matchedAssembly.locations?.length || 0,
          "locations"
        );
      } catch (err: any) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to fetch assembly or user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center text-gray-500">
        Loading data...
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-600 font-medium">
        {error}
      </div>
    );

  if (!assembly)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        No assembly data available.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="w-full mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {user?.Full_Name} — {assembly.Assembly_Name} ({assembly.State})
        </h2>

        {locations.length > 0 ? (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-b from-blue-50 to-blue-50 text-gray-800 font-semibold text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Polling Station Name</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Latitude</th>
                  <th className="px-4 py-2">Longitude</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc: any, idx: number) => (
                  <tr
                    key={loc.documentId || idx}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{loc.PS_No}</td>
                    <td className="px-4 py-2 font-medium">{loc.PS_Name}</td>
                    <td className="px-4 py-2">{loc.PS_Location}</td>
                    <td className="px-4 py-2">{loc.Latitude || "—"}</td>
                    <td className="px-4 py-2">{loc.Longitude || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic pl-2">
            No locations found under this assembly.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
