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
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  // 🧩 Fetch logged-in user + districts together
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [userRes, districtRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/districts?pagination[pageSize]=1000"),
        ]);
        setUser(userRes.data);
        setDistricts(districtRes.data.data);
      } catch (err) {
        console.error("Initialization failed:", err);
        message.error("Failed to load user or district data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🧩 Fetch assemblies by district
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

  // 🧩 Form validation helper
  const validateForm = () => {
    const required = [
      "Full_Name",
      "email",
      "password",
      "phone_Number",
      "District",
    ];
    for (const key of required) {
      if (!form[key as keyof typeof form]) {
        message.warning("Please fill all required fields.");
        return false;
      }
    }
    return true;
  };

  // 🧩 Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.documentId) {
      message.error("Unable to identify current user. Please re-login.");
      return;
    }

    setSubmitting(true);

    try {
      // Lookup selected district and assembly names
      const selectedDistrict = districts.find(
        (d) => d.documentId === form.District
      );
      const selectedAssembly = assemblies.find(
        (a) => a.documentId === form.Assembly
      );

      const payload = {
        username: form.Full_Name,
        email: form.email,
        password: form.password,
        role: "Assembly Coordinator",
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

      // Step 1️⃣: Register user
      const registerRes = await api.post("/app-user/register", payload);
      const createdUser = registerRes.data?.data;
      if (!createdUser?.id && !createdUser?.documentId)
        throw new Error("User not created");

      // Step 2️⃣: Upload photo if selected
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
      setSubmitting(false);
    }
  };

  // 🧩 Handle photo selection + preview
  const handlePhotoUpload = (file: File) => {
    setForm({ ...form, Photo: file });
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    return false;
  };

  // 🧩 Loader
  if (loading)
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

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <Input
            placeholder="Full Name"
            value={form.Full_Name}
            onChange={(e) => setForm({ ...form, Full_Name: e.target.value })}
          />

          {/* Email */}
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Password */}
          <Input.Password
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Phone */}
          <Input
            placeholder="Phone Number"
            value={form.phone_Number}
            onChange={(e) => setForm({ ...form, phone_Number: e.target.value })}
          />

          {/* Aadhar */}
          <Input
            placeholder="Aadhar"
            value={form.Aadhar}
            onChange={(e) => setForm({ ...form, Aadhar: e.target.value })}
          />

          {/* Father’s Name */}
          <Input
            placeholder="Father's Name"
            value={form.Father_Name}
            onChange={(e) => setForm({ ...form, Father_Name: e.target.value })}
          />

          {/* Mother’s Name */}
          <Input
            placeholder="Mother's Name"
            value={form.Mother_Name}
            onChange={(e) => setForm({ ...form, Mother_Name: e.target.value })}
          />

          {/* Bank / UPI */}
          <Input
            placeholder="Bank / UPI ID"
            value={form.Bank_or_UPI}
            onChange={(e) => setForm({ ...form, Bank_or_UPI: e.target.value })}
          />

          {/* Village */}
          <Input
            placeholder="Village"
            value={form.Village}
            onChange={(e) => setForm({ ...form, Village: e.target.value })}
          />

          {/* Pincode */}
          <Input
            placeholder="Pincode"
            value={form.Pincode}
            onChange={(e) => setForm({ ...form, Pincode: e.target.value })}
          />

          {/* State */}
          <Input
            placeholder="State"
            value={form.State}
            onChange={(e) => setForm({ ...form, State: e.target.value })}
          />

          {/* District */}
          <Select
            placeholder="Select District"
            value={form.District || undefined}
            onChange={(value) => {
              setForm({ ...form, District: value, Assembly: "" });
              fetchAssemblies(value);
            }}
            className="w-full"
            showSearch
            optionFilterProp="children"
          >
            {districts.map((d) => (
              <Option key={d.documentId} value={d.documentId}>
                {d.district_name}
              </Option>
            ))}
          </Select>

          {/* Assembly */}
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

          {/* Photo Upload */}
          <div className="flex flex-col items-start gap-2">
            <Upload
              beforeUpload={handlePhotoUpload}
              maxCount={1}
              accept="image/*"
              showUploadList={false}
            >
              <Button className="bg-green-500 text-white hover:bg-green-600">
                <UploadOutlined /> Upload Photo
              </Button>
            </Upload>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-lg border object-cover"
              />
            )}
          </div>

          {/* Address */}
          <div className="col-span-1 md:col-span-2">
            <Input.TextArea
              placeholder="Address"
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={submitting}
          >
            {submitting ? <Spin size="small" /> : "Create Coordinator"}
          </Button>
        </div>
      </div>
    </div>
  );
}
