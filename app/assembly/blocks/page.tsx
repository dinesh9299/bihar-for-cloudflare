"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Input, Select, message, Spin, Table, Tag } from "antd";
import axios from "axios";
import bpi from "@/lib/bpi";

const { Option } = Select;

export default function ManageBlocksPage() {
  const [user, setUser] = useState<any>(null);
  const [assembly, setAssembly] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    selectedLocations: [] as string[],
  });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [assignCoordinatorId, setAssignCoordinatorId] = useState<string | null>(
    null
  );

  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState<string | null>(
    null
  );

  const baseurl = process.env.NEXT_PUBLIC_API_URL;

  // ...existing code...
  // ...existing code...
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const token1 =
        "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";
      const headers1 = { Authorization: `Bearer ${token1}` };

      // 🧠 1️⃣ Get logged-in user
      const userRes = await axios.get(`${baseurl}/app-user/me?populate=*`, {
        headers,
      });
      const currentUser = userRes.data.user;
      setUser(currentUser);

      // 🔎 Fetch all app-users (we'll filter created-by-me below)
      const allUsersRes = await bpi.get(`/app-users?populate=*`);
      const allUsers = allUsersRes.data.data || [];
      const createdByMe = allUsers.filter(
        (u: any) => u.createdby_appuser?.documentId === currentUser.documentId
      );

      // 🧠 3️⃣ Get user’s assembly
      const userAssembly = currentUser?.assemblies?.[0];
      setAssembly(userAssembly);

      if (!userAssembly)
        return message.warning("No assembly found for this user.");

      // 🧱 4️⃣ Fetch existing blocks for this assembly
      const blockRes = await bpi.get(
        `/blocks?filters[Assembly][documentId][$eq]=${userAssembly.documentId}&populate[Assembly]=true&populate[assigned_coordinator]=true&populate[Locations]=true`
        // 🧩 this can use admin token for broad read
      );
      const existingBlocks = blockRes.data.data || [];
      setBlocks(existingBlocks);

      // 🧩 5️⃣ Collect assigned location IDs
      // Normalize and dedupe assigned location ids from all blocks
      const assignedLocationIds = Array.from(
        new Set(
          existingBlocks.flatMap((block: any) => {
            const locs = block?.Locations ?? [];
            return (locs || [])
              .map((loc: any) => {
                // support possible shapes
                if (!loc) return null;
                if (loc?.documentId) return String(loc.documentId);
                if (loc?.id && typeof loc.id === "number")
                  return String(loc.id);
                if (loc?.data?.documentId) return String(loc.data.documentId);
                if (loc?.attributes?.documentId)
                  return String(loc.attributes.documentId);
                if (loc?.data?.attributes?.documentId)
                  return String(loc.data.attributes.documentId);
                return null;
              })
              .filter(Boolean);
          })
        )
      );

      console.log("Blocks count:", existingBlocks.length);
      console.log(
        "Per-block locations:",
        existingBlocks.map((b: any) => b.Locations?.length ?? 0)
      );
      console.log("Assigned location ids (unique):", assignedLocationIds);

      // ✅ Collect assigned coordinator ids so we can exclude them
      const assignedCoordinatorIds = existingBlocks
        .map((b: any) => {
          // assigned_coordinator may be object with documentId or an id field
          const ac = b.assigned_coordinator;
          return ac?.documentId || ac?.id || null;
        })
        .filter(Boolean);

      // 📍 6️⃣ Fetch all available locations (under same assembly)
      // Fetch all pages of locations automatically
      const fetchAllLocations = async () => {
        let all: any[] = [];
        let page = 1;
        const pageSize = 100; // server max seems 25/100 — choose safe value
        let totalPages = 1;

        // request only the fields we need and add a stable sort
        const baseUrl1 = `${baseurl}/locations?filters[assembly][documentId][$eq]=${userAssembly.documentId}&fields=id,documentId,PS_Name,PS_No&sort=id:asc`;

        do {
          const res = await axios.get(
            `${baseUrl1}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
            { headers: headers1 }
          );
          const data = res.data.data || [];
          all = all.concat(data);
          const pagination = res.data.meta?.pagination || {};
          totalPages = pagination.pageCount || 1;
          console.log(
            `Fetched locations page ${page}/${totalPages} — items: ${data.length}`
          );
          page++;
        } while (page <= totalPages);

        return all;
      };

      const allLocations = await fetchAllLocations();

      // 🧩 Normalize all fetched locations (ensure documentId exists at root)
      const normalizedLocations = allLocations.map((loc: any) => {
        const documentId =
          loc.documentId ??
          loc?.attributes?.documentId ??
          loc?.data?.documentId ??
          loc?.data?.attributes?.documentId ??
          null;
        return {
          ...loc,
          documentId,
          PS_Name: loc.PS_Name ?? loc?.attributes?.PS_Name ?? "",
          PS_No: loc.PS_No ?? loc?.attributes?.PS_No ?? "",
        };
      });

      // Debug: count occurrences of each documentId (especially assigned ones)
      const counts: Record<string, number> = {};
      normalizedLocations.forEach((l: any) => {
        const id = String(l.documentId ?? "null");
        counts[id] = (counts[id] || 0) + 1;
      });
      console.log(
        "Location documentId occurrence counts (sample):",
        Object.entries(counts).slice(0, 10)
      );
      // show assigned ids occurrences
      assignedLocationIds.forEach((aid: string) =>
        console.log("Assigned id occurrence:", aid, counts[String(aid)] ?? 0)
      );

      // Dedupe normalizedLocations by documentId (keep first)
      const seen = new Set<string>();
      const dedupedLocations = normalizedLocations.filter((l: any) => {
        const id = String(l.documentId ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // 🚫 7️⃣ Remove already-assigned locations (use deduped list)
      const assignedSet = new Set(assignedLocationIds.map(String));
      const availableLocations = dedupedLocations.filter(
        (loc: any) => !assignedSet.has(String(loc.documentId))
      );

      console.log(
        "🧭 Total Locations fetched from Strapi:",
        normalizedLocations.length
      );
      console.log(
        "🧱 Locations available for assignment (after filtering):",
        availableLocations.length
      );

      setLocations(availableLocations);

      // 🧩 Debug Log
      console.log(
        "🧭 Total Locations fetched from Strapi:",
        allLocations.length
      );
      console.log(
        "🧱 Locations available for assignment (after filtering):",
        availableLocations.length
      );

      // 🚫 8️⃣ Remove coordinators who are already assigned to any block
      const availableCoordinators = createdByMe.filter(
        (u: any) => !assignedCoordinatorIds.includes(u.documentId)
      );
      setCoordinators(availableCoordinators);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  // ...existing code...
  // ...existing code...

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBlock = async () => {
    if (
      !form.name ||
      form.selectedLocations.length === 0 ||
      selectedCoordinator === null
    )
      return message.warning(
        "Enter a block name, select locations and select coordinator"
      );

    try {
      // const token = localStorage.getItem("token");
      // const token1 =
      //   "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";
      // const headers = { Authorization: `Bearer ${token1}` };

      const payload = {
        Block_Name: form.name,
        Assembly: assembly.documentId,
        Locations: form.selectedLocations,
        createdByCoordinator: user.documentId,
        assigned_coordinator: selectedCoordinator, // 👈 add this
      };

      await bpi.post("/blocks", { data: payload });
      message.success("Block created successfully!");
      setModalOpen(false);
      setForm({ name: "", selectedLocations: [] });
      fetchData(); // refresh blocks
    } catch (err) {
      console.error("Error creating block:", err);
      message.error("Failed to create block.");
    }
  };

  const handleAssignCoordinator = async () => {
    if (!assignCoordinatorId || !selectedBlock) {
      message.warning("Please select a coordinator.");
      return;
    }

    try {
      await bpi.put(`/blocks/${selectedBlock.id}`, {
        data: { assigned_coordinator: assignCoordinatorId },
      });

      message.success("Coordinator assigned successfully!");
      setAssignModalOpen(false);
      setAssignCoordinatorId(null);
      setSelectedBlock(null);
      fetchData(); // Refresh table
    } catch (err) {
      console.error("Error assigning coordinator:", err);
      message.error("Failed to assign coordinator.");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className=" bg-gray-50">
      <div className="w-full mx-auto bg-white p-8 rounded-xl ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Block-Level Groups — {assembly?.Assembly_Name}
          </h2>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setModalOpen(true)}
          >
            + Create Block
          </Button>
        </div>

        {/* Existing Blocks */}
        <Table
          dataSource={blocks}
          rowKey="documentId"
          columns={[
            { title: "Block Name", dataIndex: "Block_Name" },
            {
              title: "Locations",
              render: (block: any) =>
                block.Locations?.map((loc: any) => (
                  <Tag key={loc.id} color="blue">
                    {loc.PS_Name}
                  </Tag>
                )),
            },
            {
              title: "Assigned Coordinator",
              render: (block: any) =>
                block.assigned_coordinator ? (
                  <Tag color="green">
                    {block.assigned_coordinator.Full_Name} -
                    {block.assigned_coordinator.email}
                  </Tag>
                ) : (
                  <Button
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => {
                      setSelectedBlock(block);
                      setAssignModalOpen(true);
                    }}
                  >
                    Assign Coordinator
                  </Button>
                ),
            },
          ]}
        />

        {/* Modal for Adding Block */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleCreateBlock}
          title="Create New Block"
        >
          <Input
            placeholder="Block Name"
            className="mb-4"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Locations"
            value={form.selectedLocations}
            onChange={(val) => setForm({ ...form, selectedLocations: val })}
          >
            {locations.map((loc) => (
              <Option key={loc.documentId} value={loc.documentId}>
                {loc.PS_Name}-{loc.PS_No}
              </Option>
            ))}

            {blocks.flatMap((b) =>
              b.Locations?.map((loc: any) => (
                <Option key={loc.documentId} value={loc.documentId} disabled>
                  {loc.PS_Name} (Already in {b.Block_Name})
                </Option>
              ))
            )}
          </Select>
          <Select
            style={{ width: "100%", marginBottom: "1rem", marginTop: 10 }}
            placeholder="Select Coordinator"
            value={selectedCoordinator || undefined}
            onChange={(val) => setSelectedCoordinator(val)}
          >
            {coordinators.map((coord) => (
              <Option key={coord.documentId} value={coord.documentId}>
                {coord.Full_Name} — {coord.email}
              </Option>
            ))}
          </Select>
        </Modal>

        <Modal
          open={assignModalOpen}
          onCancel={() => setAssignModalOpen(false)}
          onOk={handleAssignCoordinator}
          title={`Assign Coordinator — ${selectedBlock?.Block_Name || ""}`}
        >
          <Select
            style={{ width: "100%" }}
            placeholder="Select Coordinator"
            value={assignCoordinatorId || undefined}
            onChange={(val) => setAssignCoordinatorId(val)}
          >
            {coordinators.map((coord) => (
              <Option key={coord.documentId} value={coord.documentId}>
                {coord.Full_Name} — {coord.email}
              </Option>
            ))}
          </Select>
        </Modal>
      </div>
    </div>
  );
}
