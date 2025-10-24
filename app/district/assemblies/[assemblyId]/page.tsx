"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, message, Select } from "antd";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function AssemblyDetailsPage() {
  const { assemblyId } = useParams();
  const [assembly, setAssembly] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [selectedCoordinators, setSelectedCoordinators] = useState<number[]>(
    []
  );
  const [editingCoordinators, setEditingCoordinators] =
    useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 🧩 Fetch logged-in user
  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
    }
  };

  // 🧩 Fetch assembly with coordinators + locations
  const fetchAssemblyDetails = async () => {
    try {
      const res = await api.get(
        `/assemblies/${assemblyId}?populate[0]=locations&populate[1]=coordinators`
      );

      const data = res.data.data;

      console.log("📄 Assembly Details:", res.data);
      if (!data) {
        message.error("Assembly not found");
        router.back();
        return;
      }

      setAssembly(data);
      setLocations(data.locations || []);

      // Extract currently assigned coordinator IDs (numeric)
      // coordinators likely returned as array of objects with `id` or attributes.id
      const existingCoordinators = (data.coordinators || []).map(
        (coord: any) => coord.id ?? coord
      );
      setSelectedCoordinators(existingCoordinators);
      // if at least one coordinator exists, keep Select hidden until user clicks "Change"
      setEditingCoordinators(false);
    } catch (err) {
      console.error("Failed to fetch assembly details:", err);
      message.error("Failed to load assembly details.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Fetch coordinators created by the logged-in user
  // 🧩 Fetch coordinators created by the logged-in user
  // 🧩 Fetch coordinators created by the logged-in user
  // 🧩 Fetch coordinators created by the logged-in user
  const fetchCoordinators = async (userId: string) => {
    try {
      const res = await api.get(`/app-users?populate=*`);
      const items = res.data.data || [];

      console.log("Fetched app-users:", items);

      // normalize structure like in AssemblyCoordinatorsPage
      const normalized = items.map((r: any) => {
        const attrs = r.attributes ?? r;
        return {
          id: r.id,
          documentId: attrs.documentId ?? r.documentId,
          Full_Name: attrs.Full_Name ?? attrs.full_name ?? "",
          Phone_Number: attrs.Phone_Number ?? attrs.phone ?? "",
          email: attrs.email ?? "",
          createdby_appuser: attrs.createdby_appuser ?? attrs.createdby ?? null,
        };
      });

      // filter by logged-in user's documentId (same logic as working page)
      const filtered = normalized.filter((u: any) => {
        const cb = u.createdby_appuser;
        const createdDocId =
          cb?.documentId ??
          cb?.data?.attributes?.documentId ??
          cb?.attributes?.documentId ??
          cb?.id ??
          null;
        return createdDocId === userId;
      });

      console.log("✅ Filtered Coordinators:", filtered);
      setCoordinators(filtered);
    } catch (err) {
      console.error("Error fetching coordinators:", err);
      message.error("Failed to fetch coordinators.");
    }
  };

  // 🧩 Assign (or reassign) coordinators
  const handleAssignCoordinators = async (selectedIds: (string | number)[]) => {
    try {
      // ensure numeric IDs if backend expects numeric DB ids
      const numericIds = selectedIds.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );
      setSelectedCoordinators(numericIds);
      await api.put(`/assemblies/${assemblyId}`, {
        data: {
          coordinators: numericIds,
        },
      });
      message.success("Coordinators updated successfully!");
      // exit edit mode and refresh
      setEditingCoordinators(false);
      fetchAssemblyDetails();
    } catch (err) {
      console.error("Error assigning coordinators:", err);
      message.error("Failed to update coordinators.");
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, []);

  useEffect(() => {
    if (user?.documentId) {
      fetchAssemblyDetails();
      fetchCoordinators(user.documentId);
    }
  }, [user, assemblyId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className=" bg-gray-50">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* 🔹 Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Locations under{" "}
            <span className="text-blue-600">
              {assembly?.Assembly_Name || "—"}
            </span>
          </h2>
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
        </div>

        {/* 🔹 Assigned Coordinator (show full details if at least one is assigned) */}
        <div className="mb-6">
          <p className="font-semibold mb-2 text-gray-700">Coordinator:</p>
          {selectedCoordinators &&
          selectedCoordinators.length > 0 &&
          !editingCoordinators ? (
            (() => {
              // find assigned coordinator details from fetched `coordinators` or assembly.coordinators
              const assignedId = selectedCoordinators[0];
              const assigned =
                // try assembly payload first
                (assembly?.coordinators || []).find(
                  (c: any) => c.id === assignedId
                ) ||
                // then try coordinators list fetched for selection (normalize shape)
                coordinators.find(
                  (c: any) => c.id === assignedId || c.documentId === assignedId
                );
              const name =
                assigned?.Full_Name ??
                assigned?.attributes?.Full_Name ??
                assigned?.attributes?.full_name ??
                "—";
              const phone =
                assigned?.Phone_Number ??
                assigned?.attributes?.Phone_Number ??
                assigned?.attributes?.phone ??
                "—";
              const email =
                assigned?.email ?? assigned?.attributes?.email ?? "—";
              return (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                  <div>
                    <div className="text-lg font-medium text-gray-800">
                      {name}
                    </div>
                    <div className="text-sm text-gray-600">📞 {phone}</div>
                    <div className="text-sm text-gray-600">✉️ {email}</div>
                  </div>
                  <div>
                    <Button
                      className="bg-blue-400 hover:bg-yellow-500 text-white"
                      onClick={() => setEditingCoordinators(true)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <p className="mb-2 text-sm text-gray-600">
                Select one or more coordinators (multiple allowed):
              </p>
              <Select
                mode="multiple"
                style={{ width: 400 }}
                placeholder="Select coordinators"
                value={selectedCoordinators}
                onChange={(vals) => handleAssignCoordinators(vals)}
                optionFilterProp="children"
              >
                {coordinators.map((coord: any) => {
                  const display =
                    coord.Full_Name ??
                    coord.attributes?.Full_Name ??
                    coord.attributes?.full_name ??
                    "Unnamed";
                  const phone =
                    coord.Phone_Number ??
                    coord.attributes?.Phone_Number ??
                    coord.attributes?.phone ??
                    "";
                  // value should be numeric DB id if backend expects it; fall back to documentId
                  const value = coord.id ?? coord.documentId;
                  return (
                    <Select.Option key={value} value={value}>
                      {display} — {phone}
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
          )}
        </div>

        {/* 🔹 Table of Locations */}
        {locations.length === 0 ? (
          <p className="text-gray-500 italic">No locations found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-100 text-gray-800 font-semibold text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Polling Station Name</th>
                  <th className="px-4 py-2">Location (Village)</th>
                  <th className="px-4 py-2">Latitude</th>
                  <th className="px-4 py-2">Longitude</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((loc: any, index: number) => (
                  <tr
                    key={loc.documentId}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">
                      {loc.PS_Name || "—"}
                    </td>
                    <td className="px-4 py-2">{loc.PS_Location || "—"}</td>
                    <td className="px-4 py-2">{loc.Latitude || "—"}</td>
                    <td className="px-4 py-2">{loc.Longitude || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
