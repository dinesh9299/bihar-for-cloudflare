"use client";

import React, { useEffect, useState } from "react";
import { Table, Modal, Input, Select, Upload, Spin, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import axios from "axios";
import dayjs from "dayjs";

export default function AssemblyToBlockDispatchPage() {
  const [user, setUser] = useState<any>(null);
  const [assembly, setAssembly] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    to_block: "",
    Material_Name: "",
    Quantity: "",
    Remarks: "",
    Photo: null as File | null,
  });

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 🔹 Fetch logged-in user (correct path)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = res.data.user;
      setUser(currentUser);

      const userAssembly = currentUser?.assemblies?.[0];
      if (!userAssembly?.documentId) {
        message.warning("No assembly assigned to this coordinator.");
        setLoading(false);
        return;
      }

      setAssembly(userAssembly);
      await fetchBlocks(userAssembly.documentId);
      await fetchDispatches(userAssembly.documentId);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
      setLoading(false);
    }
  };

  // 🔹 Fetch blocks under this assembly
  const fetchBlocks = async (assemblyDocId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/blocks?filters[Assembly][documentId][$eq]=${assemblyDocId}`,
        {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        }
      );
      setBlocks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      message.error("Failed to fetch blocks.");
    }
  };

  const AUTH_TOKEN =
    "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

  // 🔹 Fetch dispatches sent from this assembly
  const fetchDispatches = async (assemblyDocId: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/dispatches?filters[from_assembly][documentId][$eq]=${assemblyDocId}&populate=To_Block&populate=Photo`,
        { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
      );

      setDispatches(res.data.data || []);
    } catch (err) {
      console.error("Error fetching dispatches:", err);
      message.error("Failed to fetch dispatches.");
    } finally {
      setLoading(false);
    }
  };

  // 📤 Handle new dispatch
  const handleDispatchSubmit = async () => {
    if (!form.to_block || !form.Material_Name || !form.Quantity) {
      message.warning("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let uploadedPhotoId = null;

      if (form.Photo) {
        const formData = new FormData();
        formData.append("files", form.Photo);
        const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "multipart/form-data",
          },
        });
        uploadedPhotoId = uploadRes.data?.[0]?.id;
      }

      await axios.post(
        `${API_URL}/api/dispatches`,
        {
          data: {
            From_Level: "Assembly",
            To_Level: "Block",
            from_assembly: {
              connect: [{ documentId: assembly.documentId }],
            },
            To_Block: {
              connect: [{ documentId: form.to_block }],
            },
            Material_Name: form.Material_Name,
            Quantity: parseInt(form.Quantity),
            Dispatched_By: user?.Full_Name || "Assembly Coordinator",
            Dispatched_On: new Date(),
            Remarks: form.Remarks,
            State: "Pending",
            Photo: uploadedPhotoId,
          },
        },
        { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
      );

      message.success("Dispatch created successfully!");
      setIsModalVisible(false);
      setForm({
        to_block: "",
        Material_Name: "",
        Quantity: "",
        Remarks: "",
        Photo: null,
      });
      fetchDispatches(assembly.documentId);
    } catch (err) {
      console.error("Error creating dispatch:", err);
      message.error("Failed to create dispatch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="w-full bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Dispatches from Assembly —{" "}
            <span className="text-blue-600">
              {assembly?.Assembly_Name || "—"}
            </span>
          </h2>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsModalVisible(true)}
          >
            + New Dispatch
          </Button>
        </div>

        {/* Dispatch Table */}
        {dispatches.length === 0 ? (
          <p className="text-gray-500 italic">No dispatches found.</p>
        ) : (
          <Table
            dataSource={dispatches}
            rowKey="documentId"
            pagination={{ pageSize: 6 }}
            columns={[
              {
                title: "To Block",
                render: (record) =>
                  record.To_Block?.Block_Name ||
                  record.To_Block?.[0]?.Block_Name ||
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
                render: (date) =>
                  date ? dayjs(date).format("DD MMM YYYY") : "—",
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
            ]}
          />
        )}
      </div>

      {/* Add Dispatch Modal */}
      <Modal
        title="Add New Dispatch to Block"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          {/* Block Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Block
            </label>
            <Select
              placeholder="Select Block"
              style={{ width: "100%" }}
              value={form.to_block}
              onChange={(val) => setForm({ ...form, to_block: val })}
            >
              {blocks.map((b) => (
                <Select.Option key={b.documentId} value={b.documentId}>
                  {b.Block_Name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <Input
            placeholder="Material Name"
            value={form.Material_Name}
            onChange={(e) =>
              setForm({ ...form, Material_Name: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={form.Quantity}
            onChange={(e) => setForm({ ...form, Quantity: e.target.value })}
          />
          <Input.TextArea
            rows={3}
            placeholder="Remarks"
            value={form.Remarks}
            onChange={(e) => setForm({ ...form, Remarks: e.target.value })}
          />

          <Upload
            beforeUpload={(file) => {
              setForm({ ...form, Photo: file });
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Select Photo</Button>
          </Upload>
          {form.Photo && (
            <img
              src={URL.createObjectURL(form.Photo)}
              alt="preview"
              className="mt-3 w-32 h-32 object-cover rounded border"
            />
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleDispatchSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
