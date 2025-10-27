"use client";

import React, { useEffect, useState } from "react";
import { Input, Select, Upload, message, Spin } from "antd";
import { Button } from "@/components/ui/button";
import { UploadOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import axios from "axios";
import { headers } from "next/headers";

const { Option } = Select;

export default function BlockCoordinatorPage() {
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

  const [token1, setToken] = useState<string | null>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("token");
    console.log("Stored Token from localStorage:", storedToken);
    setToken(storedToken);
  }
}, []);

  useEffect(() => {
  if (token1) {
    fetchUser();
    fetchDistricts();
  }
}, [token1]);

  const url = process.env.NEXT_PUBLIC_API_URL;
  const token =process.env.NEXT_PUBLIC_AUTH_TOKEN;

  // Fetch logged-in user (for created_by)
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${url}/app-user/me`, {
        headers: { Authorization: `Bearer ${token1}` },
      });
      setUser(res.data.user);
      console.log("✅ Fetched user data:", res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
    }
  };

  // Fetch districts
  const fetchDistricts = async () => {
    try {
      const res = await axios.get(
        `${url}/districts?pagination[pageSize]=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDistricts(res.data.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  // Fetch assemblies by selected district documentId
  const fetchAssemblies = async (districtDocId: string) => {
    try {
      const res = await axios.get(
        `${url}/assemblies?filters[district][documentId][$eq]=${districtDocId}&pagination[pageSize]=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
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
      const roleID = "Booth Coordinator";

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
        createdby_appuser: user.documentId,
      };

      // Step 1️⃣: Register the user
      const registerRes = await axios.post(
        `${url}/app-user/register`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const createdUser = registerRes.data?.data;

      if (!createdUser?.id && !createdUser?.documentId) {
        throw new Error("User not created");
      }

      // Step 2️⃣: Upload the photo (if selected)444444444444444444444
      if (form.Photo) {
        const formData = new FormData();
        formData.append("files", form.Photo);
        formData.append("ref", "api::app-user.app-user");
        formData.append("refId", createdUser.id || createdUser.documentId);
        formData.append("field", "Photo");

        await axios.post(`${url}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      message.success("Assembly Coordinator created successfully!");
      router.push("/block/coordinators");
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
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add Block Level Coordinator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            placeholder="Full Name"
            value={form.Full_Name}
            onChange={(e) => setForm({ ...form, Full_Name: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input.Password
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            value={form.phone_Number}
            onChange={(e) => setForm({ ...form, phone_Number: e.target.value })}
          />
          <Input
            placeholder="Aadhar"
            value={form.Aadhar}
            onChange={(e) => setForm({ ...form, Aadhar: e.target.value })}
          />
          <Input
            placeholder="Father's Name"
            value={form.Father_Name}
            onChange={(e) => setForm({ ...form, Father_Name: e.target.value })}
          />
          <Input
            placeholder="Mother's Name"
            value={form.Mother_Name}
            onChange={(e) => setForm({ ...form, Mother_Name: e.target.value })}
          />
          <Input
            placeholder="Bank / UPI ID"
            value={form.Bank_or_UPI}
            onChange={(e) => setForm({ ...form, Bank_or_UPI: e.target.value })}
          />
          <Input
            placeholder="Village"
            value={form.Village}
            onChange={(e) => setForm({ ...form, Village: e.target.value })}
          />
          <Input
            placeholder="Pincode"
            value={form.Pincode}
            onChange={(e) => setForm({ ...form, Pincode: e.target.value })}
          />
          <Input
            placeholder="State"
            value={form.State}
            onChange={(e) => setForm({ ...form, State: e.target.value })}
          />

          {/* 🏛️ Select District */}
          <Select
            placeholder="Select District"
            value={form.District || undefined}
            onChange={(value) => {
              setForm({ ...form, District: value, Assembly: "" });
              fetchAssemblies(value);
            }}
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
          >
            {assemblies.map((a) => (
              <Option key={a.documentId} value={a.documentId}>
                {a.Assembly_Name}
              </Option>
            ))}
          </Select>

          {/* 📸 Photo Upload */}
          <Upload
            beforeUpload={(file) => {
              setForm({ ...form, Photo: file });
              return false;
            }}
            maxCount={1}
            accept="image/*"
          >
            <Button className="bg-green-500 text-white hover:bg-green-600">
              <UploadOutlined /> Upload Photo
            </Button>
          </Upload>

          {/* 🏠 Address */}
          <div className="col-span-2">
            <Input.TextArea
              placeholder="Address"
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
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
