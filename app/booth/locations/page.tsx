"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, message, Spin, Button } from "antd";
import { useRouter } from "next/navigation";
import bpi from "@/lib/bpi";

export default function BoothLocationsPage() {
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // normalize possible shapes for coordinator object
  const getCoordinatorInfo = (bc: any) => {
    if (!bc) return null;
    const src = bc?.data?.attributes ?? bc?.attributes ?? bc;
    return {
      name: src?.Full_Name ?? src?.full_name ?? src?.name ?? "N/A",
      email: src?.email ?? "N/A",
      phone: src?.Phone_Number ?? src?.phone ?? "N/A",
      documentId: src?.documentId ?? src?.id ?? null,
    };
  };

  const url = process.env.NEXT_PUBLIC_API_URL || "";

  const token1 = process.env.NEXT_PUBLIC_AUTH_TOKEN || "";

  const fetchMyLocations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No auth token found. Please login.");
        return;
      }

      // 1) get logged-in user (to read documentId)
      const meRes = await axios.get(`${url}/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = meRes.data.user;
      if (!currentUser?.documentId) {
        message.error("Unable to read current user documentId.");
        setUser(currentUser);
        return;
      }
      setUser(currentUser);

      const docId = currentUser.documentId;

      // 2) fetch locations where booth_coordinator.documentId == current user's documentId
      // populate the coordinator relation so we can show details
      const locRes = await bpi.get(
        `/locations?filters[booth_coordinator][documentId][$eq]=${docId}&populate=*&pagination[pageSize]=1000`,
        { headers: { Authorization: `Bearer ${token1}` } }
      );

      // Strapi might return { data: [ { id, attributes: {...} } ] } or flattened objects.
      const raw = locRes.data.data ?? locRes.data ?? [];
      const normalized = raw.map((r: any) => {
        // if shape is { id, attributes: {...} }
        const attrs = r.attributes ?? r;
        return {
          id: r.id ?? attrs.id,
          documentId: attrs.documentId ?? r.documentId,
          PS_Name: attrs.PS_Name ?? attrs.PS_Name ?? "",
          PS_No: attrs.PS_No ?? "",
          PS_Location: attrs.PS_Location ?? "",
          Latitude: attrs.Latitude ?? null,
          Longitude: attrs.Longitude ?? null,
          booth_coordinator:
            attrs.booth_coordinator ?? attrs.booth_coordinator ?? null,
          raw: r,
        };
      });

      setLocations(normalized);
    } catch (err) {
      console.error("Error fetching booth locations:", err);
      message.error("Failed to fetch assigned locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLocations();
  }, []);

  const columns = [
    {
      title: "Polling Station",
      dataIndex: "PS_Name",
      key: "PS_Name",
    },
    { title: "PS No", dataIndex: "PS_No", key: "PS_No" },
    { title: "Location", dataIndex: "PS_Location", key: "PS_Location" },
    {
      title: "Coordinator",
      key: "coordinator",
      render: (row: any) => {
        const info = getCoordinatorInfo(row.booth_coordinator);
        if (!info) {
          return <Tag color="red">Unassigned</Tag>;
        }
        return (
          <div>
            <div>
              <b>{info.name}</b>
            </div>
            <div style={{ fontSize: 12, color: "#444" }}>
              <div>{info.email}</div>
              <div>{info.phone}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (row: any) => (
        <Button
          onClick={() => router.push(`/booth/locations/${row.documentId}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h2 className="text-xl font-semibold mb-4">My Assigned Locations</h2>

      {locations.length === 0 ? (
        <div className="text-gray-600">No locations assigned to you.</div>
      ) : (
        <Table
          dataSource={locations}
          columns={columns}
          rowKey={(row) => row.documentId ?? row.id}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
}
