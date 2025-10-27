"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button, Spin, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function LoggedInUserCertificate() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const pdfRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  // Convert image URL → Base64
  const getBase64Image = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
	console.log("token",token);
      const res = await axios.get(`${API_URL}/api/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedUser = res.data.user;
      const photoUrl = fetchedUser.Photo?.[0]?.url
        ? `${API_URL}${fetchedUser.Photo[0].url}`
        : null;

      fetchedUser.base64Photo = photoUrl ? await getBase64Image(photoUrl) : "";

      setUser(fetchedUser);
      console.log("Fetched user:", fetchedUser);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      message.error("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // create blob URLs for uploaded files (clean up on unmount)
  useEffect(() => {
    let mounted = true;
    const createBlobUrls = async () => {
      if (!user?.verified_certificate?.length) return;
      try {
        const pairs = await Promise.all(
          user.verified_certificate.map(async (file: any) => {
            const url = `${API_URL}${file.url}`;
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error("Failed to fetch file");
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            return { id: file.id, blobUrl };
          })
        );
        if (!mounted) return;
        const map: Record<number, string> = {};
        pairs.forEach((p) => (map[p.id] = p.blobUrl));
        setBlobUrls(map);
      } catch (err) {
        console.error("Error creating blob URLs:", err);
      }
    };
    createBlobUrls();
    return () => {
      mounted = false;
      // revoke created URLs
      Object.values(blobUrls).forEach((u) => URL.revokeObjectURL(u));
      setBlobUrls({});
    };
  }, [user?.verified_certificate?.length]);

  // Download Certificate
  const handleDownloadCertificate = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user.Full_Name}_Certificate.pdf`);
      message.success("Certificate downloaded!");
    } catch (err) {
      console.error("❌ PDF generation error:", err);
      message.error("Failed to generate PDF.");
    }
  };

  // Upload verified certificate
  const handleUpload = async () => {
    if (!selectedFile) {
      message.warning("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("verified_certificate", selectedFile);
      formData.append("documentId", user.documentId);

      await axios.post(`${API_URL}/api/app-user/upload-certificate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("✅ Verified certificate uploaded successfully!");
      setSelectedFile(null);
      fetchUser();
    } catch (err) {
      console.error("❌ Upload error:", err);
      message.error("Failed to upload certificate.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        No user data found.
      </div>
    );

  const assembly = user.assemblies?.[0]?.Assembly_Name || user.Assembly || "-";

  return (
    <div className="min-h-screen  py-10 px-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            Coordinator Details – {user.Full_Name}
          </h3>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleDownloadCertificate}
          >
            Download Certificate
          </Button>
        </div>

        {/* User Details Section (the top part you wanted to keep) */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-gray-800">
          <div>
            <p>
              <b>Full Name:</b> {user.Full_Name}
            </p>
            <p>
              <b>Father’s Name:</b> {user.Father_Name || "-"}
            </p>
            <p>
              <b>Mother’s Name:</b> {user.Mother_Name || "-"}
            </p>
            <p>
              <b>District:</b> {user.District || "-"}
            </p>
            <p>
              <b>State:</b> {user.State || "-"}
            </p>
          </div>
          <div>
            <p>
              <b>Assembly:</b> {assembly}
            </p>
            <p>
              <b>Village:</b> {user.Village || "-"}
            </p>
            <p>
              <b>Phone:</b> {user.Phone_Number || "-"}
            </p>
            <p>
              <b>Email:</b> {user.email || "-"}
            </p>
            <p>
              <b>Aadhar:</b> {user.Aadhar || "-"}
            </p>
          </div>
        </div>

        {/* Certificate Template */}
        <div
          ref={pdfRef}
          className="border rounded-xl bg-white text-black shadow-md p-6 mb-10"
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">Election Commission of India</h2>
            <p className="text-gray-600 text-sm">
              Web Casting Agent Declaration Certificate
            </p>
            <hr className="my-2 border-gray-400" />
          </div>

          <h2 className="text-center text-lg font-bold mb-3 underline">
            DECLARATION BY WEB CASTING AGENT
          </h2>

          <p className="text-center mb-4">
            I, <b>{user.Full_Name}</b>, S/o / D/o{" "}
            <b>{user.Father_Name || "________"}</b> do hereby make a solemn
            declaration in connection with the General Election to Lok Sabha
            2024, that:
          </p>

          <div className="mb-4 text-left pl-4">
            <p>A. I am not a close relative of any contesting candidate.</p>
            <p>
              B. No criminal case is pending against me in any court of law.
            </p>
          </div>

          <div className="flex justify-between items-start mt-6 gap-4">
            <div className="w-[180px] h-[180px] border border-gray-400 flex justify-center items-center overflow-hidden">
              {user.base64Photo ? (
                <img
                  src={user.base64Photo}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>No Photo</span>
              )}
            </div>

            <div className="flex-1 text-sm leading-6">
              <p>
                <b>Name:</b> {user.Full_Name}
              </p>
              <p>
                <b>Father’s Name:</b> {user.Father_Name || "-"}
              </p>
              <p>
                <b>District:</b> {user.District || "-"}
              </p>
              <p>
                <b>Assembly:</b> {assembly}
              </p>
              <p>
                <b>Mobile:</b> {user.Phone_Number || "-"}
              </p>
              <p>
                <b>Aadhar:</b> {user.Aadhar || "-"}
              </p>
              <p>
                <b>Address:</b> {user.address || "-"}
              </p>

              <div className="mt-4">
                <p>Signature with Date: ______________________</p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            Generated by Election Web Portal | © Brihaspathi Technologies
          </div>
        </div>

        {/* Upload Section */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">
            Upload Police Verified Certificate
          </h4>

          <Upload
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false;
            }}
            accept=".jpg,.jpeg,.png,.pdf"
            maxCount={1}
            showUploadList={{ showPreviewIcon: false }}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>

          {selectedFile && (
            <p className="mt-3 text-gray-600">
              Selected File: <b>{selectedFile.name}</b>
            </p>
          )}

          <Button
            type="primary"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Verified Certificate"}
          </Button>

          {user.verified_certificate?.length > 0 && (
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-4">
                Uploaded Certificates:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.verified_certificate.map((file: any, index: number) => (
                  <div
                    key={file.id}
                    className="border rounded-lg overflow-hidden shadow-sm bg-white"
                  >
                    <div className="bg-gray-100 p-2 text-sm font-medium text-gray-700">
                      {index + 1}. {file.name}
                    </div>

                    {file.mime.includes("pdf") ? (
                      // use blob URL if available, fallback to direct URL
                      <iframe
                        src={blobUrls[file.id] ?? `${API_URL}${file.url}`}
                        title={`Certificate ${index + 1}`}
                        className="w-full h-[400px] border-0"
                      />
                    ) : (
                      <img
                        src={blobUrls[file.id] ?? `${API_URL}${file.url}`}
                        alt={`Certificate ${index + 1}`}
                        className="w-full object-contain max-h-[400px]"
                      />
                    )}

                    <div className="text-xs text-gray-500 px-2 py-1 border-t">
                      Uploaded on {new Date(file.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
