"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Spin, message, Button, Modal, Select } from "antd";
import bpi from "@/lib/bpi";

const { Option } = Select;

export default function BlockLocationsPage() {
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [boothCoordinators, setBoothCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedBoothCoordinator, setSelectedBoothCoordinator] = useState<
    string | null
  >(null);

  // helper to normalize coordinator shape
  const getCoordinatorInfo = (bc: any) => {
    if (!bc) return null;
    const src = bc?.data?.attributes ?? bc?.attributes ?? bc;
    return {
      name: src?.Full_Name ?? src?.full_name ?? src?.name ?? "N/A",
      email: src?.email ?? bc?.email ?? "N/A",
      phone: src?.Phone_Number ?? src?.phone ?? "N/A",
    };
  };

  const columns = [
    { title: "Polling Station", dataIndex: "PS_Name" },
    { title: "PS No", dataIndex: "PS_No" },
    { title: "Location", dataIndex: "PS_Location" },
    {
      title: "Booth Coordinator",
      render: (loc: any) => {
        const bc = loc.booth_coordinator;
        const info = getCoordinatorInfo(bc);
        if (!info) {
          return (
            <Button
              className="bg-blue-600 text-white"
              onClick={() => {
                setSelectedLocation(loc);
                setAssignModalOpen(true);
              }}
            >
              Assign Booth Coordinator
            </Button>
          );
        }
        return (
          <div>
            <Tag color="green" style={{ display: "block", marginBottom: 6 }}>
              {info.name}
            </Tag>
            <div style={{ fontSize: 12, color: "#444" }}>
              <div>{info.email}</div>
              <div>{info.phone}</div>
            </div>
          </div>
        );
      },
    },
  ];

  const router = useRouter();

  const fetchUserAndData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const token1 =
        "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

      if (!token) {
        message.error("No token found. Please log in again.");
        return;
      }

      // 1️⃣ Fetch logged-in user
      const userRes = await bpi.get("/app-user/me?populate=*", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = userRes.data.user;
      setUser(currentUser);

      // Helper to safely read nested documentId
      const readDocId = (obj: any) => {
        if (!obj) return undefined;
        return (
          obj.documentId ||
          obj?.data?.attributes?.documentId ||
          obj?.attributes?.documentId ||
          obj?.id ||
          undefined
        );
      };

      // 2️⃣ Fetch ALL app-users and normalize (server-side filter sometimes returns unexpected shape)
      const allUsersRes = await bpi.get(`/app-users?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawUsers = allUsersRes.data.data || [];

      const normalizedUsers = rawUsers.map((u: any) => {
        const attrs = u.attributes ?? u;
        return {
          id: u.id ?? attrs.id,
          documentId: attrs?.documentId ?? u.documentId,
          Full_Name: attrs?.Full_Name ?? attrs?.full_name ?? "",
          email: attrs?.email ?? "",
          raw: u,
          createdby_appuser_docId:
            readDocId(attrs?.createdby_appuser) ||
            readDocId(u.createdby_appuser),
        };
      });

      // 3️⃣ Keep only users created by currentUser (same logic as coordinators page)
      const createdByMe = normalizedUsers.filter(
        (nu: any) => nu.createdby_appuser_docId === currentUser.documentId
      );

      // 4️⃣ Fetch all blocks with Locations populated including booth_coordinator
      const blocksRes = await bpi.get(
        `/blocks?populate[Locations][populate]=booth_coordinator&populate[assigned_coordinator]=true&populate[Assembly]=true`,
        { headers: { Authorization: `Bearer ${token1}` } }
      );
      const allBlocks = blocksRes.data.data || [];
      console.log("All Blocks fetched:", allBlocks);

      // 5️⃣ Blocks assigned to the logged-in block coordinator
      const myBlocks = allBlocks.filter(
        (b: any) =>
          (b.assigned_coordinator &&
            (b.assigned_coordinator.documentId ||
              b.assigned_coordinator?.data?.attributes?.documentId ||
              b.assigned_coordinator?.id)) === currentUser.documentId
      );

      // 6️⃣ Locations under those blocks
      const allLocations = myBlocks.flatMap(
        (block: any) => block.Locations || []
      );
      setLocations(allLocations);

      // 7️⃣ Collect booth coordinator ids already assigned on these locations
      const assignedBoothIds = allLocations
        .map((loc: any) => {
          const bc =
            loc.booth_coordinator ?? loc.booth_coordinator?.data?.attributes;
          return bc?.documentId || bc?.id || loc.booth_coordinator || undefined;
        })
        .filter(Boolean);

      // 8️⃣ From createdByMe exclude those already assigned (compare normalized documentId or id)
      const availableBoothCoordinators = createdByMe.filter(
        (u: any) =>
          !assignedBoothIds.includes(u.documentId) &&
          !assignedBoothIds.includes(u.id)
      );

      setBoothCoordinators(availableBoothCoordinators);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  // ...existing code...
  // ...existing code...
  // ...existing code...

  useEffect(() => {
    fetchUserAndData();
  }, []);

  // 🧾 Assign booth coordinator
  const handleAssignBoothCoordinator = async () => {
    if (!selectedBoothCoordinator || !selectedLocation) {
      message.warning("Please select a booth coordinator.");
      return;
    }

    try {
      const token1 =
        "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

      await bpi.put(
        `/locations/${selectedLocation.documentId}`,
        {
          data: {
            booth_coordinator: selectedBoothCoordinator,
          },
        },
        { headers: { Authorization: `Bearer ${token1}` } }
      );

      message.success("Booth Coordinator assigned successfully!");
      setAssignModalOpen(false);
      setSelectedBoothCoordinator(null);
      setSelectedLocation(null);
      fetchUserAndData();
    } catch (err) {
      console.error("❌ Error assigning booth coordinator:", err);
      message.error("Failed to assign booth coordinator.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className=" bg-gray-50">
      <div className="w-full mx-auto bg-white  rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          My Assigned Locations
        </h2>
        <h3 className="mb-6">{user?.email}</h3>

        {locations.length === 0 ? (
          <p className="text-center text-gray-500">
            No locations assigned to your block yet.
          </p>
        ) : (
          <Table
            dataSource={locations}
            rowKey="documentId"
            pagination={{ pageSize: 10 }}
            columns={columns}
            onRow={(record) => ({
              style: { cursor: "pointer" },
              onClick: (event) => {
                // don't navigate if user clicked a button/link/input inside the row
                const actionable = (event.target as HTMLElement).closest(
                  "button, a, input, [role='button']"
                );
                if (actionable) return;
                router.push(`/block/locations/${record.documentId}`);
              },
            })}
          />
        )}
      </div>
      {/* Modal for Assign Booth Coordinator */}
      <Modal
        open={assignModalOpen}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedLocation(null);
          setSelectedBoothCoordinator(null);
        }}
        onOk={handleAssignBoothCoordinator}
        title={
          selectedLocation
            ? `Assign Booth Coordinator — ${
                selectedLocation.PS_Name || selectedLocation.documentId
              }`
            : "Assign Booth Coordinator"
        }
      >
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Select Booth Coordinator"
          optionFilterProp="children"
          value={selectedBoothCoordinator || undefined}
          onChange={(val) => setSelectedBoothCoordinator(val)}
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {boothCoordinators.map((coord: any) => (
            <Option key={coord.documentId} value={coord.documentId}>
              {coord.Full_Name || coord.email || coord.documentId}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
