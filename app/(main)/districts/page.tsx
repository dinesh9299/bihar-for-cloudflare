"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spin, Select, message } from "antd";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Eye } from "lucide-react";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Fetch Districts and Users
  const fetchData = async () => {
    try {
      const [districtRes, userRes] = await Promise.all([
        api.get("/districts?populate=district_coordinator"),
        // api.get("/users"),
        api.get("/users?filters[role][name][$eq]=District Coordinator"),
      ]);
      setDistricts(districtRes.data.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignCoordinator = async (
    districtId: number,
    userId: number
  ) => {
    try {
      await api.put(`/districts/${districtId}`, {
        data: { district_coordinator: userId },
      });
      message.success("Coordinator assigned successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to assign coordinator");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Districts & Coordinators
        </h2>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-blue-50 to-blue-50 text-gray-800 font-semibold text-left">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">District Name</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Coordinator</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d, index) => (
                <tr
                  key={d.id}
                  className="border-b hover:bg-gradient-to-b hover:from-blue-50 hover:to-blue-50 text-gray-700"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{d.district_name}</td>
                  <td className="px-4 py-2">{d.state || "—"}</td>
                  <td className="px-4 py-2">
                    {d.district_coordinator.username}
                    <br></br>
                    {d.district_coordinator.email}
                    <br></br>
                    {d.district_coordinator.Phone_Number}
                  </td>
                  {/* <td className="px-4 py-2">
                    <Select
                      style={{ width: 200 }}
                      placeholder="Select Coordinator"
                      value={d.district_coordinator?.id || undefined}
                      onChange={(val) =>
                        handleAssignCoordinator(d.documentId, val)
                      }
                    >
                      {users.map((u) => (
                        <Select.Option key={u.id} value={u.id}>
                          {u.username}
                        </Select.Option>
                      ))}
                    </Select>
                  </td> */}
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/districts/${d.documentId}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
