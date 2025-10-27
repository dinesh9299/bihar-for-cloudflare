"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Spin, message, Modal } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import bpi from "@/lib/bpi"; // ✅ use same axios instance like in your working page

export default function BlockDispatchPage() {
  const [user, setUser] = useState<any>(null);
  const [block, setBlock] = useState<any>(null);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || "";

  // ✅ Safe helper for reading documentId or id
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

  // ✅ Step 1: Fetch logged-in user and assigned block
  const fetchUserAndBlock = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No token found. Please login again.");
        return;
      }

      // 1️⃣ Fetch logged-in user
      const userRes = await bpi.get("/app-user/me?populate=*", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = userRes.data.user;
      setUser(currentUser);

      // 2️⃣ Fetch all blocks with assigned_coordinator populated
      const blocksRes = await bpi.get(
        `/blocks?populate[assigned_coordinator]=true&populate[Assembly]=true`,
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      const allBlocks = blocksRes.data.data || [];

      // 3️⃣ Filter blocks assigned to this user
      const myBlocks = allBlocks.filter(
        (b: any) => readDocId(b.assigned_coordinator) === currentUser.documentId
      );

      if (myBlocks.length === 0) {
        message.warning("No block assigned to this user.");
        setBlock(null);
        return;
      }

      const myBlock = myBlocks[0];
      setBlock(myBlock);

      // 4️⃣ Fetch dispatches for this block
      await fetchDispatches(readDocId(myBlock));
    } catch (err: any) {
      console.error("❌ Error fetching user/block:", err);
      message.error("Failed to load user or block info.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Fetch dispatches linked to this block
  const fetchDispatches = async (blockDocId: string) => {
    if (!blockDocId) return;
    try {
      const res = await bpi.get(
        `/dispatches?filters[To_Block][documentId][$eq]=${blockDocId}&populate[Photo]=true&populate[from_assembly]=true`,
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      const dispatchList = res.data.data || [];
      setDispatches(dispatchList);
    } catch (err) {
      console.error("❌ Error fetching dispatches:", err);
      message.error("Failed to load dispatches.");
    }
  };

  // ✅ Step 3: Confirm receipt
  const handleConfirmReceipt = async () => {
    if (!selectedDispatch) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return message.error("Token missing.");

      await bpi.put(
        `/dispatches/${selectedDispatch.documentId}`,
        {
          data: {
            State: "Delivered",
            Received_By: user?.Full_Name || "Block Coordinator",
            Received_On: new Date(),
          },
        },
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );

      message.success("✅ Dispatch marked as received!");
      setConfirmModal(false);
      setSelectedDispatch(null);
      await fetchDispatches(readDocId(block));
    } catch (err) {
      console.error("❌ Error confirming receipt:", err);
      message.error("Failed to confirm receipt.");
    }
  };

  useEffect(() => {
    fetchUserAndBlock();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Dispatches Received — {block?.Block_Name || "—"}
        </h2>

        {dispatches.length === 0 ? (
          <p className="text-gray-500 italic">No dispatches found.</p>
        ) : (
          <Table
            dataSource={dispatches}
            rowKey="documentId"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: "From Assembly",
                render: (record) =>
                  record.from_assembly?.Assembly_Name ||
                  record.from_assembly?.data?.attributes?.Assembly_Name ||
                  "—",
              },
              { title: "Material", dataIndex: "Material_Name" },
              { title: "Quantity", dataIndex: "Quantity" },
              { title: "Dispatched By", dataIndex: "Dispatched_By" },
              {
                title: "State",
                dataIndex: "State",
                render: (val) => (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      val === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {val}
                  </span>
                ),
              },
              {
                title: "Dispatched On",
                dataIndex: "Dispatched_On",
                render: (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—"),
              },
              {
                title: "Received On",
                dataIndex: "Received_On",
                render: (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—"),
              },
              { title: "Remarks", dataIndex: "Remarks" },
              {
                title: "Photo",
                dataIndex: "Photo",
                render: (photo) => {
                  const photoUrl =
                    photo?.url ||
                    photo?.data?.attributes?.url ||
                    photo?.attributes?.url;
                  return photoUrl ? (
                    <img
                      src={`${API_URL}${photoUrl}`}
                      alt="dispatch"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    "—"
                  );
                },
              },
              {
                title: "Action",
                render: (record) =>
                  record.State === "Delivered" ? (
                    <span className="text-green-600 font-semibold">
                      Received
                    </span>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedDispatch(record);
                        setConfirmModal(true);
                      }}
                    >
                      Confirm Received
                    </Button>
                  ),
              },
            ]}
          />
        )}
      </div>

      {/* Confirm Modal */}
      <Modal
        open={confirmModal}
        title="Confirm Dispatch Receipt"
        onCancel={() => setConfirmModal(false)}
        onOk={handleConfirmReceipt}
        okText="Confirm"
        okButtonProps={{ className: "bg-green-600" }}
        centered
      >
        <p>
          Are you sure you have received this dispatch from{" "}
          <b>
            {selectedDispatch?.from_assembly?.Assembly_Name ||
              selectedDispatch?.from_assembly?.data?.attributes
                ?.Assembly_Name ||
              "Assembly"}
          </b>{" "}
          ?
        </p>
      </Modal>
    </div>
  );
}
