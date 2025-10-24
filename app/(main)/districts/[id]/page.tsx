"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message } from "antd";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function DistrictDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch District + Assemblies + Coordinators
  const fetchData = async () => {
    try {
      const districtRes = await api.get(
        `/districts/${id}?populate[assemblies][populate]=coordinators`
      );
      setDistrict(districtRes.data.data);
      console.log("District details:", districtRes.data.data);
    } catch (err) {
      console.error("Error fetching district details:", err);
      message.error("Failed to fetch district details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (!district)
    return (
      <div className="p-6 text-center text-gray-600">District not found.</div>
    );

  return (
    <div className=" bg-gray-50 ">
      <div className="  w-full mx-auto bg-white  rounded-2xl p-8">
        {/* 🔙 Back Button */}
        <div className="flex items-center space-x-2 mb-6">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800 ml-4">
            {district.district_name} — District Details
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          <strong>State:</strong> {district.state || "—"}
        </p>

        {/* 🧾 Assemblies Table */}
        <div className="overflow-x-auto border rounded-lg mt-8">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-blue-50 to-blue-50 text-gray-800 font-semibold text-left">
                <th className="px-4 py-2">Assembly No</th>
                <th className="px-4 py-2">Assembly Name</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Coordinator Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {district.assemblies?.length ? (
                district.assemblies.map((assembly: any) => {
                  const coordinator = assembly.coordinators?.[0]; // first assigned coordinator
                  return (
                    <tr
                      key={assembly.id}
                      className="border-b hover:bg-gradient-to-b hover:from-blue-50 hover:to-blue-50 text-gray-700"
                    >
                      <td className="px-4 py-2">{assembly.Assembly_No}</td>
                      <td className="px-4 py-2">{assembly.Assembly_Name}</td>
                      <td className="px-4 py-2">{assembly.State}</td>
                      <td className="px-4 py-2">
                        {coordinator?.Full_Name || (
                          <span className="text-gray-400 italic">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {coordinator?.Phone_Number || "-"}
                      </td>
                      <td className="px-4 py-2">{coordinator?.email || "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-4 italic"
                  >
                    No assemblies found in this district.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
