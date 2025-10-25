"use client";

import React, { useEffect, useState, useRef } from "react";
import { Table, Avatar, message, Spin, Tag, Modal } from "antd";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AssemblyCoordinatorsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const [certBlobUrls, setCertBlobUrls] = useState<Record<number, string>>({});

  // 🔹 Fetch logged-in user
  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      message.error("Failed to fetch user details.");
    }
  };

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

  // 🔹 Fetch coordinators created by this user
  const fetchCoordinators = async (userId: string) => {
    try {
      setLoading(true);
      // fetch all users and normalize client-side (safer when shapes vary)
      const res = await api.get(`/app-users?populate=*`);
      const items = res.data.data || [];

      console.log("Fetched coordinators:", items);

      const normalized = items.map((r: any) => {
        const attrs = r.attributes ?? r;
        return {
          id: r.id,
          documentId: attrs.documentId ?? r.documentId,
          Full_Name: attrs.Full_Name ?? attrs.full_name ?? "",
          email: attrs.email ?? "",
          Phone_Number: attrs.Phone_Number ?? attrs.phone ?? "",
          District: attrs.District ?? "",
          Assembly: attrs.Assembly ?? "",
          Photo: attrs.Photo ?? [],
          Father_Name: attrs.Father_Name ?? "",
          Mother_Name: attrs.Mother_Name ?? "",
          Village: attrs.Village ?? "",
          Aadhar: attrs.Aadhar ?? "",
          address: attrs.address ?? "",
          // include uploaded files so modal can show them
          verified_certificate:
            attrs.verified_certificate ??
            attrs.verified_certificate_files ??
            [],
          // keep original created-by relation for filtering
          createdby_appuser: attrs.createdby_appuser ?? attrs.createdby ?? null,
          aadhar_verified:
            attrs.aadhar_verified === true || attrs.aadhar_verified === "true",
          raw: r,
        };
      });

      // filter only those created by current user (handles nested shapes)
      const filtered = normalized.filter((u: any) => {
        const cb = u.createdby_appuser;
        const createdDocId =
          cb?.documentId ??
          cb?.data?.attributes?.documentId ??
          cb?.attributes?.documentId ??
          cb?.id ??
          null;
        return createdDocId === userId;
      });

      // convert photos to base64 for PDF use
      for (const record of filtered) {
        const imgUrl = record?.Photo?.[0]?.url
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${record.Photo[0].url}`
          : null;
        record.base64Photo = imgUrl ? await getBase64Image(imgUrl) : "";
      }

      setData(filtered);
    } catch (err) {
      console.error("Error fetching coordinators:", err);
      message.error("Failed to fetch coordinators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  useEffect(() => {
    if (user?.documentId) {
      fetchCoordinators(user.documentId);
    }
  }, [user]);

  console.log("selectedRecord:", selectedRecord);

  useEffect(() => {
    console.log("selectedRecord changed:", selectedRecord);
    let mounted = true;
    const createCertBlobs = async () => {
      if (!selectedRecord?.verified_certificate?.length) return;
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;
        const pairs = await Promise.all(
          selectedRecord.verified_certificate.map(async (f: any) => {
            const url = `${base}${f.url}`;
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) {
              console.error("Failed to fetch file", url, res.status);
              throw new Error("Failed to fetch file");
            }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            return { id: f.id, blobUrl };
          })
        );
        if (!mounted) return;
        // revoke old urls before setting new
        Object.values(certBlobUrls).forEach((u) => URL.revokeObjectURL(u));
        const map: Record<number, string> = {};
        pairs.forEach((p) => (map[p.id] = p.blobUrl));
        setCertBlobUrls(map);
      } catch (err) {
        console.error("Error creating certificate blobs:", err);
      }
    };
    createCertBlobs();
    return () => {
      mounted = false;
      Object.values(certBlobUrls).forEach((u) => URL.revokeObjectURL(u));
      setCertBlobUrls({});
    };
  }, [selectedRecord]);

  // 🧾 Generate PDF
  const handleDownloadCertificate = async (record: any) => {
    try {
      const pdfElement = document.getElementById(`pdf-${record.documentId}`);
      if (!pdfElement) {
        message.error("Certificate not found.");
        return;
      }

      pdfElement.scrollIntoView({ behavior: "instant", block: "start" });
      await new Promise((r) => setTimeout(r, 300)); // wait for scroll/paint

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${record.Full_Name || "Certificate"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      message.error("PDF generation failed.");
    }
  };

  // 📋 Columns for Table
  const columns = [
    {
      title: "Photo",
      dataIndex: ["Photo", 0, "url"],
      render: (url: string) =>
        url ? (
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`}
            size={48}
          />
        ) : (
          <Avatar size={48}>N/A</Avatar>
        ),
    },
    {
      title: "Full Name",
      dataIndex: "Full_Name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "Phone_Number",
    },
    {
      title: "District",
      dataIndex: "District",
      render: (value: string) => <Tag color="blue">{value || "N/A"}</Tag>,
    },
    {
      title: "Assembly",
      dataIndex: "Assembly",
      render: (value: string) => <Tag color="purple">{value || "N/A"}</Tag>,
    },
    {
      title: "Aadhaar Verified",
      dataIndex: "aadhar_verified",
      render: (value: boolean) =>
        value ? (
          <Tag color="green">Verified</Tag>
        ) : (
          <Tag color="red">Not Verified</Tag>
        ),
    },

    {
      title: "Action",
      render: (record: any) => (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            console.log("Open modal record:", record);
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Assembly Coordinators
          </h2>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => router.push("/district/assembly-coordinators/add")}
          >
            + Add New
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table
              dataSource={data}
              columns={columns}
              rowKey="documentId"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </div>

      {/* Modal for viewing details */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <div className="flex justify-between items-center mb-4 mr-5">
              <h3 className="text-xl font-semibold">
                Coordinator Details - {selectedRecord.Full_Name}
              </h3>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleDownloadCertificate(selectedRecord)}
              >
                Download Certificate
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p>
                  <b>Name:</b> {selectedRecord.Full_Name}
                </p>
                <p>
                  <b>Father’s Name:</b> {selectedRecord.Father_Name}
                </p>
                <p>
                  <b>Mother’s Name:</b> {selectedRecord.Mother_Name}
                </p>
                <p>
                  <b>District:</b> {selectedRecord.District}
                </p>
              </div>
              <div>
                <p>
                  <b>Assembly:</b> {selectedRecord.Assembly}
                </p>
                <p>
                  <b>Village:</b> {selectedRecord.Village}
                </p>
                <p>
                  <b>Phone:</b> {selectedRecord.Phone_Number}
                </p>
                <p>
                  <b>Email:</b> {selectedRecord.email}
                </p>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="w-full overflow-y-auto">
              <div
                id={`pdf-${selectedRecord.documentId}`}
                className="border rounded-xl bg-white text-black shadow-md p-6 mx-auto"
                style={{
                  width: "794px", // A4 width in px at 96 DPI
                  minHeight: "1123px", // A4 height in px
                  backgroundColor: "#fff",
                }}
              >
                <h2 className="text-center text-xl font-bold mb-3 underline">
                  DECLARATION BY WEB CASTING AGENTS
                </h2>

                <p className="text-center mb-4">
                  I, <b>{selectedRecord.Full_Name}</b>, S/o / D/o{" "}
                  <b>{selectedRecord.Father_Name}</b> do hereby make a solemn
                  declaration in connection with the General Election to Lok
                  Sabha 2024, Assam, that:
                </p>

                <div className="mb-4 text-left pl-4">
                  <p>
                    A. I am not a close relative of any contesting candidate.
                  </p>
                  <p>
                    B. No criminal case is pending against me in any court of
                    law.
                  </p>
                </div>

                <div className="flex justify-between items-start mt-6 gap-4">
                  <div className="w-[180px] h-[180px] border border-gray-400 flex justify-center items-center overflow-hidden">
                    {selectedRecord.base64Photo ? (
                      <img
                        src={selectedRecord.base64Photo}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span>No Photo</span>
                    )}
                  </div>

                  <div className="flex-1 text-sm leading-6">
                    <p>
                      <b>Name:</b> {selectedRecord.Full_Name}
                    </p>
                    <p>
                      <b>Father’s Name:</b> {selectedRecord.Father_Name}
                    </p>
                    <p>
                      <b>District:</b> {selectedRecord.District}
                    </p>
                    <p>
                      <b>Mobile:</b> {selectedRecord.Phone_Number}
                    </p>
                    <p>
                      <b>Aadhar:</b> {selectedRecord.Aadhar}
                    </p>
                    <p>
                      <b>Address:</b> {selectedRecord.address}
                    </p>

                    <div className="mt-4">
                      <p>Signature With Date: ______________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Certificates */}
            {selectedRecord.verified_certificate?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Uploaded Certificates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedRecord.verified_certificate.map(
                    (file: any, idx: number) => {
                      const base = process.env.NEXT_PUBLIC_BACKEND_URL;
                      const src = certBlobUrls[file.id] ?? `${base}${file.url}`;
                      const isPdf =
                        (file.mime || "").toLowerCase().includes("pdf") ||
                        (file.ext || "")
                          .toString()
                          .toLowerCase()
                          .includes("pdf");
                      return (
                        <div
                          key={file.id ?? idx}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="bg-gray-100 p-2 text-sm font-medium">
                            {idx + 1}. {file.name ?? file.hash ?? "file"}
                          </div>
                          {isPdf ? (
                            <iframe
                              src={src}
                              title={file.name || `cert-${idx}`}
                              className="w-full h-64 border-0"
                            />
                          ) : (
                            <img
                              src={src}
                              alt={file.name}
                              className="w-full object-contain h-64"
                            />
                          )}
                          <div className="text-xs text-gray-500 p-2">
                            {file.createdAt
                              ? `Uploaded: ${new Date(
                                  file.createdAt
                                ).toLocaleString()}`
                              : ""}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
