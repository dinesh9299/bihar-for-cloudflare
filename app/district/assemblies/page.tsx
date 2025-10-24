"use client";

import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AssembliesPage() {
  const [user, setUser] = useState<any>(null);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 1️⃣ Get logged-in user info
  const getUser = async () => {
    try {
      const res = await api.get("/users/me?populate=*");
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      message.error("Unable to fetch user details.");
      return null;
    }
  };

  // 🔹 2️⃣ Find district assigned to this coordinator
  const getDistrictForCoordinator = async (userId: number) => {
    try {
      const res = await api.get(
        `/districts?filters[district_coordinator][id][$eq]=${userId}&populate[assemblies][populate]=coordinators`
      );

      if (res.data.data.length > 0) {
        const districtData = res.data.data[0];
        setDistrict(districtData);
        setAssemblies(districtData.assemblies || []);
      } else {
        message.warning("No district assigned to this coordinator.");
      }
    } catch (err) {
      console.error("Error fetching district:", err);
      message.error("Failed to fetch district details.");
    } finally {
      setLoading(false);
    }
  };

  // normalize coordinator info from several possible shapes
  const getCoordinatorInfo = (assembly: any) => {
    // possible shapes:
    // assembly.coordinator
    // assembly.coordinators -> array
    // assembly.coordinators.data -> array (Strapi)
    const raw =
      assembly?.coordinator ??
      (Array.isArray(assembly?.coordinators)
        ? assembly.coordinators[0]
        : null) ??
      (assembly?.coordinators?.data ? assembly.coordinators.data[0] : null) ??
      assembly;

    const attrs = raw?.attributes ?? raw ?? {};
    const name = attrs.Full_Name ?? attrs.full_name ?? attrs.name ?? "—";
    const phone = attrs.Phone_Number ?? attrs.phone ?? "—";
    const email = attrs.email ?? "—";
    return { name, phone, email };
  };

  useEffect(() => {
    (async () => {
      const userData = await getUser();
      if (userData?.id) {
        await getDistrictForCoordinator(userData.id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="">
      <div className="w-full mx-auto bg-white  rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Assemblies under{" "}
            <span className="text-blue-600">
              {district?.district_name || "—"}
            </span>
          </h2>
        </div>

        {assemblies.length === 0 ? (
          <p className="text-gray-500 italic">No assemblies found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-b from-blue-50 to-blue-50 text-gray-800 font-semibold text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Assembly No</th>
                  <th className="px-4 py-2">Assembly Name</th>
                  <th className="px-4 py-2">Coordinator</th>
                  <th className="px-4 py-2">State</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {assemblies.map((assembly: any, index: number) => {
                  const coord = getCoordinatorInfo(assembly);
                  return (
                    <tr
                      key={assembly.documentId}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{assembly.Assembly_No}</td>
                      <td className="px-4 py-2 font-medium">
                        {assembly.Assembly_Name}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium">{coord.name}</div>
                        <div className="text-xs text-gray-600">
                          📞 {coord.phone}
                        </div>
                        <div className="text-xs text-gray-600">
                          ✉️ {coord.email}
                        </div>
                      </td>
                      <td className="px-4 py-2">{assembly.State || "—"}</td>
                      <td className="px-4 py-2">
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() =>
                            router.push(
                              `/district/assemblies/${assembly.documentId}`
                            )
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
