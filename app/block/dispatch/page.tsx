"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Spin, message, Modal } from "antd";
import axios from "axios";
import dayjs from "dayjs";

export default function BlockDispatchPage() {
  const [user, setUser] = useState<any>(null);
  const [block, setBlock] = useState<any>(null);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const ADMIN_TOKEN =
    "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

  // 🔹 Step 1: Fetch logged-in user and their block
  const fetchUserAndBlock = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return message.error("No token found. Please login again.");

      // Fetch logged-in user
      const userRes = await axios.get(`${API_URL}/api/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = userRes.data.user;
      setUser(u);

      // Fetch block assigned to this user
      const blockRes = await axios.get(
        `${API_URL}/api/blocks?filters[assigned_coordinator][documentId][$eq]=${u.documentId}&populate=*`,
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      const blockData = blockRes.data.data?.[0];
      if (!blockData) {
        message.warning("No block assigned to this user.");
        setLoading(false);
        return;
      }

      setBlock(blockData);
      await fetchDispatches(blockData.documentId);
    } catch (err) {
      console.error("Error fetching user/block:", err);
      message.error("Failed to load user or block info.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2: Fetch dispatches sent to this block
  const fetchDispatches = async (blockDocId: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/dispatches?filters[To_Block][documentId][$eq]=${blockDocId}&populate=from_assembly&populate=Photo`,
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      setDispatches(res.data.data || []);
    } catch (err) {
      console.error("Error fetching dispatches:", err);
      message.error("Failed to load dispatches.");
    }
  };

  // 🔹 Step 3: Confirm Receipt
  const handleConfirmReceipt = async () => {
    if (!selectedDispatch) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return message.error("Token missing.");

      await axios.put(
        `${API_URL}/api/dispatches/${selectedDispatch.documentId}`,
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
      fetchDispatches(block.documentId);
    } catch (err) {
      console.error("Error confirming receipt:", err);
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
                  record.from_assembly?.[0]?.Assembly_Name ||
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
                render: (photo) =>
                  photo?.url ? (
                    <img
                      src={`${API_URL}${photo.url}`}
                      alt="dispatch"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    "—"
                  ),
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
              selectedDispatch?.from_assembly?.[0]?.Assembly_Name ||
              "Assembly"}
          </b>{" "}
          ?
        </p>
      </Modal>
    </div>
  );
}
