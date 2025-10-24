"use client";

import React, { useEffect, useState } from "react";
import { message, Spin, Table } from "antd";
import { MapPin, ClipboardList, FileSpreadsheet } from "lucide-react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

export default function BlockCoordinatorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [block, setBlock] = useState<any>(null);
  const [summary, setSummary] = useState({
    totalLocations: 0,
    totalSurveys: 0,
    raisedSurveys: 0,
    totalBoqs: 0,
    raisedBoqs: 0,
    totalInCameras: 0,
    installedInCameras: 0,
    totalOutCameras: 0,
    installedOutCameras: 0,
  });
  const [locationSummary, setLocationSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken =
    "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return message.error("No auth token found.");

      // 1️⃣ Logged-in user
      const userRes = await axios.get(`${API}/api/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = userRes.data.user;
      setUser(u);

      // 2️⃣ Find their assigned block
      const blockRes = await axios.get(
        `${API}/api/blocks?filters[assigned_coordinator][documentId][$eq]=${u.documentId}&populate[Locations]=true&populate[Assembly]=true`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const blockData = blockRes.data.data?.[0];
      if (!blockData) {
        message.warning("No block assigned to this user.");
        setLoading(false);
        return;
      }
      setBlock(blockData);

      const blockId = blockData.documentId;
      const locations = blockData.Locations || [];
      const totalLocations = locations.length;
      const totalSurveys = totalLocations;
      const totalBoqs = totalLocations;

      // 3️⃣ Fetch surveys & boqs under this block
      // ✅ Fetch surveys under this block (case-sensitive to Strapi model)
      // 🧭 1️⃣ Get all surveys (no filters by block)
      const surveysRes = await axios.get(
        `${API}/api/surveys?pagination[pageSize]=1000&populate=booth`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // 🧭 2️⃣ Get all BOQs (no filters by block)
      const boqsRes = await axios.get(
        `${API}/api/boqs?pagination[pageSize]=1000&populate=location`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // 3️⃣ Match them locally by location.documentId
      const surveys = surveysRes.data.data || [];
      const boqs = boqsRes.data.data || [];

      const raisedSurveyIds = new Set(
        surveys.map((s: any) => s.booth?.documentId).filter(Boolean)
      );
      const raisedBoqIds = new Set(
        boqs.map((b: any) => b.location?.documentId).filter(Boolean)
      );

      // 4️⃣ Get locations under the current block

      // 5️⃣ Count based on local match
      const raisedSurveys = locations.filter((l: any) =>
        raisedSurveyIds.has(l.documentId)
      ).length;

      const raisedBoqs = locations.filter((l: any) =>
        raisedBoqIds.has(l.documentId)
      ).length;

      // 🧭 3️⃣ Fetch all cameras and calculate IN/OUT stats
      const camerasRes = await axios.get(
        `${API}/api/cameras?pagination[pageSize]=1000&populate=assigned_booth`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const cameras = camerasRes.data.data || [];

      // Filter cameras belonging to this block’s locations
      const locationIds = new Set(locations.map((l: any) => l.documentId));
      const blockCameras = cameras.filter((cam: any) => {
        const assigned =
          cam.assigned_booth?.documentId ??
          cam.assigned_booth?.data?.attributes?.documentId ??
          cam.attributes?.assigned_booth?.data?.attributes?.documentId ??
          cam.attributes?.assigned_booth?.documentId;

        return assigned && locationIds.has(assigned);
      });

      // Count by position and installation state
      const inCameras = blockCameras.filter(
        (cam: any) => cam.Position === "IN"
      );
      const outCameras = blockCameras.filter(
        (cam: any) => cam.Position === "OUT"
      );

      const installedInCameras = inCameras.filter(
        (cam: any) => cam.state === "Installed"
      ).length;
      const installedOutCameras = outCameras.filter(
        (cam: any) => cam.state === "Installed"
      ).length;

      const totalInCameras = totalLocations; // each location needs one IN camera
      const totalOutCameras = totalLocations; // each location needs one OUT camera

      // 4️⃣ Location-wise summary
      const locSummary = locations.map((loc: any) => {
        return {
          PS_Name: loc.PS_Name,
          PS_No: loc.PS_No,
          PS_Location: loc.PS_Location,
          hasSurvey: raisedSurveyIds.has(loc.documentId),
          hasBoq: raisedBoqIds.has(loc.documentId),
        };
      });

      // 5️⃣ Set state
      setSummary({
        totalLocations,
        totalSurveys,
        raisedSurveys,
        totalBoqs,
        raisedBoqs,
        totalInCameras,
        installedInCameras,
        totalOutCameras,
        installedOutCameras,
      });
      setLocationSummary(locSummary);
    } catch (err) {
      console.error("Error loading block dashboard:", err);
      message.error("Failed to load block dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );

  return (
    <div className=" py-10 px-6">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Block Dashboard — {block?.Block_Name}
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <DashboardCard
            icon={<MapPin className="text-blue-500" />}
            label="Total Locations"
            value={summary.totalLocations}
          />
          <DashboardCard
            icon={<ClipboardList className="text-green-500" />}
            label="Surveys (Raised / Total)"
            value={`${summary.raisedSurveys} / ${summary.totalSurveys}`}
          />
          <DashboardCard
            icon={<FileSpreadsheet className="text-purple-500" />}
            label="BOQs (Raised / Total)"
            value={`${summary.raisedBoqs} / ${summary.totalBoqs}`}
          />

          <DashboardCard
            icon={<ClipboardList className="text-indigo-500" />}
            label="IN Cameras (Installed / Total)"
            value={`${summary.installedInCameras} / ${summary.totalInCameras}`}
          />
          <DashboardCard
            icon={<ClipboardList className="text-orange-500" />}
            label="OUT Cameras (Installed / Total)"
            value={`${summary.installedOutCameras} / ${summary.totalOutCameras}`}
          />
        </div>

        {/* Location-wise Summary Table */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Location-wise Summary
            </h2>
            <Table
              dataSource={locationSummary}
              rowKey="PS_No"
              pagination={false}
              columns={[
                { title: "Polling Station", dataIndex: "PS_Name" },
                { title: "PS No", dataIndex: "PS_No" },
                { title: "Location", dataIndex: "PS_Location" },
                {
                  title: "Survey",
                  render: (record) =>
                    record.hasSurvey ? (
                      <span className="text-green-600 font-semibold">
                        ✔ Done
                      </span>
                    ) : (
                      <span className="text-red-500">✘ Pending</span>
                    ),
                },
                {
                  title: "BOQ",
                  render: (record) =>
                    record.hasBoq ? (
                      <span className="text-green-600 font-semibold">
                        ✔ Done
                      </span>
                    ) : (
                      <span className="text-red-500">✘ Pending</span>
                    ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Small reusable stat card
const DashboardCard = ({ icon, label, value }: any) => (
  <Card className="shadow-md border-indigo-100">
    <CardContent className="p-5 flex items-center gap-3">
      {icon}
      <div>
        <h3 className="text-gray-600 text-sm">{label}</h3>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);
