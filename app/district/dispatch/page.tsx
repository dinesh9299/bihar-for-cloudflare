"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Spin, Modal, Input, Select, Upload } from "antd";
import { Button } from "@/components/ui/button";
import { UploadOutlined, FileText } from "@ant-design/icons";
import api from "@/lib/api";
import dayjs from "dayjs";

export default function DistrictDispatchPage() {
  const [user, setUser] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    to_assembly: "",
    Material_Name: "",
    Quantity: "",
    Remarks: "",
    Photo: null as File | null,
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 🔹 Fetch logged-in user
  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me?populate=*");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
    }
  };

  // 🔹 Get District for this Coordinator
  const fetchDistrict = async (userId: number) => {
    try {
      const res = await api.get(
        `/districts?filters[district_coordinator][id][$eq]=${userId}&populate[assemblies][populate]=*`
      );
      const districtData = res.data.data?.[0];

      if (districtData) {
        setDistrict(districtData);
        setAssemblies(districtData.assemblies || []);
      } else {
        message.warning("No district assigned to you.");
      }
    } catch (err) {
      console.error("Error fetching district:", err);
      message.error("Failed to fetch district details.");
    }
  };

  // 🔹 Fetch existing dispatches
  const fetchDispatches = async (districtDocId: string) => {
    try {
      const res = await api.get(
        `/dispatches?filters[from_district][documentId][$eq]=${districtDocId}&populate=to_assembly&populate=Photo`
      );
      setDispatches(res.data.data || []);
      console.log("dispatches", res.data.data);
    } catch (err) {
      console.error("Error fetching dispatches:", err);
      message.error("Failed to load dispatch records.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Init
  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDistrict(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (district?.documentId) {
      fetchDispatches(district.documentId);
    }
  }, [district]);

  // 📤 Handle Dispatch Submit
  const handleDispatchSubmit = async () => {
    if (!form.to_assembly || !form.Material_Name || !form.Quantity) {
      message.warning("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedPhotoId = null;
      if (form.Photo) {
        const formData = new FormData();
        formData.append("files", form.Photo);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedPhotoId = uploadRes.data?.[0]?.id;
      }

      await api.post("/dispatches", {
        data: {
          From_Level: "District",
          To_Level: "Assembly",
          from_district: district.documentId,
          to_assembly: form.to_assembly,
          Material_Name: form.Material_Name,
          Quantity: parseInt(form.Quantity),
          Dispatched_By: user?.Full_Name || "District Coordinator",
          Dispatched_On: new Date(),
          Remarks: form.Remarks,
          State: "Pending",
          Photo: uploadedPhotoId,
        },
      });

      message.success("Dispatch created successfully!");
      setIsModalVisible(false);
      setForm({
        to_assembly: "",
        Material_Name: "",
        Quantity: "",
        Remarks: "",
        Photo: null,
      });
      fetchDispatches(district.documentId);
    } catch (err) {
      console.error("Error creating dispatch:", err);
      message.error("Failed to create dispatch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Material Dispatch —{" "}
            <span className="text-blue-600">
              {district?.district_name || "—"}
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
          <p className="text-gray-500 italic">No dispatch records yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <Table
              dataSource={dispatches}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              columns={[
                {
                  title: "Assembly",
                  key: "assembly",
                  render: (_: any, record: any) =>
                    Array.isArray(record.to_assembly)
                      ? record.to_assembly
                          .map((a: any) => a.Assembly_Name)
                          .join(", ")
                      : record.to_assembly?.Assembly_Name || "—",
                },

                {
                  title: "Material",
                  dataIndex: "Material_Name",
                  key: "material",
                },
                {
                  title: "Quantity",
                  dataIndex: "Quantity",
                  key: "qty",
                },
                {
                  title: "Dispatched By",
                  dataIndex: "Dispatched_By",
                  key: "dispatchedby",
                },
                {
                  title: "Received By",
                  dataIndex: "Received_By",
                  key: "receivedby",
                  render: (val) => val || "—",
                },
                {
                  title: "State",
                  dataIndex: "State",
                  render: (val) => (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        val === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : val === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {val}
                    </span>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "Dispatched_On",
                  render: (date) =>
                    date ? dayjs(date).format("DD MMM YYYY") : "—",
                },
                {
                  title: "Remarks",
                  dataIndex: "Remarks",
                },
                {
                  title: "Photo",
                  dataIndex: "Photo",
                  render: (photo) =>
                    photo?.url ? (
                      <img
                        src={`${BASE_URL}${photo.url}`}
                        alt="dispatch"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      "—"
                    ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title="Dispatch Material to Assembly"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          {/* Assembly Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Assembly
            </label>
            <Select
              placeholder="Select Assembly"
              style={{ width: "100%" }}
              value={form.to_assembly}
              onChange={(val) => setForm({ ...form, to_assembly: val })}
            >
              {assemblies.map((a) => (
                <Select.Option key={a.documentId} value={a.documentId}>
                  {a.Assembly_Name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Material Name
            </label>
            <Input
              placeholder="Enter material name"
              value={form.Material_Name}
              onChange={(e) =>
                setForm({ ...form, Material_Name: e.target.value })
              }
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input
              type="number"
              placeholder="Enter quantity"
              value={form.Quantity}
              onChange={(e) => setForm({ ...form, Quantity: e.target.value })}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <Input.TextArea
              rows={3}
              placeholder="Add remarks"
              value={form.Remarks}
              onChange={(e) => setForm({ ...form, Remarks: e.target.value })}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Photo (optional)
            </label>
            <Upload
              beforeUpload={(file) => {
                setForm({ ...form, Photo: file });
                return false; // prevent auto upload
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
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleDispatchSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Dispatch"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
