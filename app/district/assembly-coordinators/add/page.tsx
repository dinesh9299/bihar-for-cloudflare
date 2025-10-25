"use client";

import React, { useEffect, useState } from "react";
import { Input, Select, Upload, message, Spin } from "antd";
import { Button } from "@/components/ui/button";
import { UploadOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const { Option } = Select;

export default function AddAssemblyCoordinatorPage() {
  const [form, setForm] = useState({
    Full_Name: "",
    email: "",
    password: "",
    phone_Number: "",
    State: "",
    District: "",
    Assembly: "",
    Aadhar: "",
    Father_Name: "",
    Mother_Name: "",
    Bank_or_UPI: "",
    Village: "",
    Pincode: "",
    address: "",
    Photo: null as File | null,
  });

  const [districts, setDistricts] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch logged-in user (for created_by)
  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
    }
  };

  // Fetch districts
  const fetchDistricts = async () => {
    try {
      const res = await api.get("/districts?pagination[pageSize]=1000");
      setDistricts(res.data.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  // Fetch assemblies by selected district documentId
  const fetchAssemblies = async (districtDocId: string) => {
    try {
      const res = await api.get(
        `/assemblies?filters[district][documentId][$eq]=${districtDocId}&pagination[pageSize]=1000`
      );
      setAssemblies(res.data.data);
    } catch (err) {
      console.error("Error fetching assemblies:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchDistricts();
  }, []);

  // Handle Submit
  const handleSubmit = async () => {
    if (
      !form.Full_Name ||
      !form.email ||
      !form.password ||
      !form.phone_Number ||
      !form.District
    ) {
      message.warning("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const roleID = "Assembly Coordinator";

      if (!user?.documentId) {
        message.error("Unable to identify current user. Please re-login.");
        return;
      }

      // Find selected District and Assembly names
      const selectedDistrict = districts.find(
        (d) => d.documentId === form.District
      );
      const selectedAssembly = assemblies.find(
        (a) => a.documentId === form.Assembly
      );

      // ✅ Save names instead of documentIds
      const payload = {
        username: form.Full_Name,
        email: form.email,
        password: form.password,
        role: roleID,
        Full_Name: form.Full_Name,
        Phone_Number: form.phone_Number,
        State: form.State,
        Aadhar: form.Aadhar,
        Father_Name: form.Father_Name,
        Mother_Name: form.Mother_Name,
        Bank_or_UPI: form.Bank_or_UPI,
        Village: form.Village,
        Pincode: form.Pincode,
        address: form.address,
        District: selectedDistrict?.district_name || "",
        Assembly: selectedAssembly?.Assembly_Name || "",
        createdby: user.documentId,
      };

      // Step 1️⃣: Register the user
      const registerRes = await api.post("/app-user/register", payload);
      const createdUser = registerRes.data?.data;

      if (!createdUser?.id && !createdUser?.documentId) {
        throw new Error("User not created");
      }

      // Step 2️⃣: Upload the photo (if selected)
      if (form.Photo) {
        const formData = new FormData();
        formData.append("files", form.Photo);
        formData.append("ref", "api::app-user.app-user");
        formData.append("refId", createdUser.id || createdUser.documentId);
        formData.append("field", "Photo");

        await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      message.success("Assembly Coordinator created successfully!");
      router.push("/district/assembly-coordinators");
    } catch (err: any) {
      console.error("Error creating coordinator:", err);
      message.error(
        err.response?.data?.error?.message ||
          "Failed to create Assembly Coordinator."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add Assembly Coordinator
        </h2>

        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* 👤 Full Name */}
            <Input
              placeholder="Full Name"
              value={form.Full_Name}
              onChange={(e) => setForm({ ...form, Full_Name: e.target.value })}
              className="w-full"
            />

            {/* 📧 Email */}
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full"
            />

            {/* 🔑 Password */}
            <Input.Password
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full"
            />

            {/* 📞 Phone Number */}
            <Input
              placeholder="Phone Number"
              value={form.phone_Number}
              onChange={(e) =>
                setForm({ ...form, phone_Number: e.target.value })
              }
              className="w-full"
            />

            {/* 🆔 Aadhar */}
            <Input
              placeholder="Aadhar"
              value={form.Aadhar}
              onChange={(e) => setForm({ ...form, Aadhar: e.target.value })}
              className="w-full"
            />

            {/* 👨‍👦 Father’s Name */}
            <Input
              placeholder="Father's Name"
              value={form.Father_Name}
              onChange={(e) =>
                setForm({ ...form, Father_Name: e.target.value })
              }
              className="w-full"
            />

            {/* 👩‍👦 Mother’s Name */}
            <Input
              placeholder="Mother's Name"
              value={form.Mother_Name}
              onChange={(e) =>
                setForm({ ...form, Mother_Name: e.target.value })
              }
              className="w-full"
            />

            {/* 🏦 Bank or UPI ID */}
            <Input
              placeholder="Bank / UPI ID"
              value={form.Bank_or_UPI}
              onChange={(e) =>
                setForm({ ...form, Bank_or_UPI: e.target.value })
              }
              className="w-full"
            />

            {/* 🏡 Village */}
            <Input
              placeholder="Village"
              value={form.Village}
              onChange={(e) => setForm({ ...form, Village: e.target.value })}
              className="w-full"
            />

            {/* 📮 Pincode */}
            <Input
              placeholder="Pincode"
              value={form.Pincode}
              onChange={(e) => setForm({ ...form, Pincode: e.target.value })}
              className="w-full"
            />

            {/* 🌎 State */}
            <Input
              placeholder="State"
              value={form.State}
              onChange={(e) => setForm({ ...form, State: e.target.value })}
              className="w-full"
            />

            {/* 🏛️ Select District */}
            <Select
              placeholder="Select District"
              value={form.District || undefined}
              onChange={(value) => {
                setForm({ ...form, District: value, Assembly: "" });
                fetchAssemblies(value);
              }}
              className="w-full"
            >
              {districts.map((d) => (
                <Option key={d.documentId} value={d.documentId}>
                  {d.district_name}
                </Option>
              ))}
            </Select>

            {/* 🗳️ Select Assembly */}
            <Select
              placeholder="Select Assembly"
              value={form.Assembly || undefined}
              onChange={(value) => setForm({ ...form, Assembly: value })}
              disabled={!form.District}
              className="w-full"
            >
              {assemblies.map((a) => (
                <Option key={a.documentId} value={a.documentId}>
                  {a.Assembly_Name}
                </Option>
              ))}
            </Select>

            {/* 📸 Photo Upload */}
            <div className="flex flex-col gap-2">
              <Upload
                beforeUpload={(file) => {
                  setForm({ ...form, Photo: file });
                  return false;
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button className="w-full bg-green-500 text-white hover:bg-green-600">
                  <UploadOutlined /> Upload Photo
                </Button>
              </Upload>
            </div>

            {/* 🏠 Address (Full Width) */}
            <div className="col-span-1 md:col-span-2">
              <Input.TextArea
                placeholder="Address"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : "Create Coordinator"}
          </Button>
        </div>
      </div>
    </div>
  );
}
