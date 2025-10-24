"use client";

import React, { useEffect, useState } from "react";
import { message, Spin, Table } from "antd";
import { MapPin, ClipboardList, FileSpreadsheet, Layers } from "lucide-react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AssemblyCoordinatorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [assembly, setAssembly] = useState<any>(null);
  const [summary, setSummary] = useState({
    totalBlocks: 0,
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
  const [blockSummary, setBlockSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken =
    "0ac039714b346f2465c0759415521dcb2201a61c8ce0890559a67f4ce1da1abacbc97f0d4d96d57fb4b4d25dd0a6d157dd001554f8d2da86b859e7a7894e84c2a5652c1f66d01f759da344e096286235c0f5e2c540b21819c3f3df843503b6f341c12d6c4a50a9f80ac85d99f20ae895f1ced331e85f2f7bab504aa376887cad";

  // helper
  const count = async (url: string) => {
    try {
      const res = await axios.get(`${API}${url}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.data?.meta?.pagination?.total ?? 0;
    } catch {
      return 0;
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return message.error("No auth token found.");

      // 1️⃣ Fetch logged-in user
      const userRes = await axios.get(`${API}/api/app-user/me?populate=*`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = userRes.data.user;
      setUser(u);

      const userAssembly = u.assemblies?.[0];
      if (!userAssembly) {
        message.warning("No assembly assigned to this user.");
        setLoading(false);
        return;
      }
      setAssembly(userAssembly);

      const assemblyId = userAssembly.documentId;

      // 2️⃣ Fetch total blocks under assembly
      // 2️⃣ Fetch total blocks under assembly
      const blockRes = await axios.get(
        `${API}/api/blocks?filters[Assembly][documentId][$eq]=${assemblyId}&pagination[pageSize]=1000&populate[Locations]=true`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const allBlocks = blockRes.data.data || [];
      const totalBlocks = allBlocks.length;

      // ✅ Correct: Fetch all locations under this assembly (not just assigned ones)
      // ✅ Fetch ALL locations under this assembly (handle Strapi’s 100-item limit)
      let allAssemblyLocations: any[] = [];
      let page = 1;

      while (true) {
        const res = await axios.get(
          `${API}/api/locations?filters[assembly][documentId][$eq]=${assemblyId}&pagination[page]=${page}&pagination[pageSize]=100`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        const pageData = res.data.data || [];
        allAssemblyLocations = allAssemblyLocations.concat(pageData);

        const meta = res.data.meta?.pagination;
        if (!meta || page >= meta.pageCount) break; // exit when all pages are fetched
        page++;
      }

      // ✅ All locations under this assembly
      const totalLocations = allAssemblyLocations.length;

      // ✅ total surveys = total locations (each location needs one survey)
      const totalSurveys = totalLocations;
      const totalBoqs = totalLocations;

      // 🧮 Fetch all raised surveys (with pagination)
      let raisedSurveyIds = new Set<string>();
      let surveyPage = 1;
      while (true) {
        const res = await axios.get(
          `${API}/api/surveys?filters[booth][assembly][documentId][$eq]=${assemblyId}&pagination[page]=${surveyPage}&pagination[pageSize]=100&populate=booth`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        const data = res.data.data || [];
        data.forEach((s: any) => {
          const boothId = s.booth?.documentId;
          if (boothId) raisedSurveyIds.add(boothId);
        });

        const meta = res.data.meta?.pagination;
        if (!meta || surveyPage >= meta.pageCount) break;
        surveyPage++;
      }
      const raisedSurveys = raisedSurveyIds.size;

      // 🧮 Fetch all raised BOQs (with pagination)
      let raisedBoqIds = new Set<string>();
      let boqPage = 1;
      while (true) {
        const res = await axios.get(
          `${API}/api/boqs?filters[location][assembly][documentId][$eq]=${assemblyId}&pagination[page]=${boqPage}&pagination[pageSize]=100&populate=location`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        const data = res.data.data || [];
        data.forEach((b: any) => {
          const locId = b.location?.documentId;
          if (locId) raisedBoqIds.add(locId);
        });

        const meta = res.data.meta?.pagination;
        if (!meta || boqPage >= meta.pageCount) break;
        boqPage++;
      }
      const raisedBoqs = raisedBoqIds.size;

      // 6️⃣ Build block-wise summary (fixed logic)
      const allSurveysRes = await axios.get(
        `${API}/api/surveys?filters[booth][assembly][documentId][$eq]=${assemblyId}&pagination[pageSize]=1000&populate=booth`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const allSurveys = allSurveysRes.data.data || [];

      const allBoqsRes = await axios.get(
        `${API}/api/boqs?filters[location][assembly][documentId][$eq]=${assemblyId}&pagination[pageSize]=1000&populate=location`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const allBoqs = allBoqsRes.data.data || [];

      // 🧭 Fetch all cameras under this assembly and calculate IN/OUT stats
      let allCameras: any[] = [];
      let camPage = 1;

      while (true) {
        const res = await axios.get(
          `${API}/api/cameras?filters[assigned_booth][assembly][documentId][$eq]=${assemblyId}&pagination[page]=${camPage}&pagination[pageSize]=100&populate=assigned_booth`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        const pageData = res.data.data || [];
        allCameras = allCameras.concat(pageData);

        const meta = res.data.meta?.pagination;
        if (!meta || camPage >= meta.pageCount) break;
        camPage++;
      }

      // Normalize camera data
      const normalizedCameras = allCameras.map((c: any) => {
        const attrs = c.attributes ?? c;
        const assigned =
          attrs.assigned_booth?.data?.attributes ??
          attrs.assigned_booth ??
          c.assigned_booth;
        return {
          id: c.id,
          Position: attrs.Position ?? attrs.position,
          state: attrs.state ?? attrs.State,
          assigned_booth: assigned,
        };
      });

      // Filter by assembly locations
      const locationIds = new Set(
        allAssemblyLocations.map((l: any) => l.documentId)
      );
      const assemblyCameras = normalizedCameras.filter(
        (cam: any) =>
          cam.assigned_booth?.documentId &&
          locationIds.has(cam.assigned_booth.documentId)
      );

      // Count by type and installation
      const installedInCameras = assemblyCameras.filter(
        (c: any) => c.Position === "IN" && c.state === "Installed"
      ).length;
      const installedOutCameras = assemblyCameras.filter(
        (c: any) => c.Position === "OUT" && c.state === "Installed"
      ).length;

      // Totals = total locations (each needs one IN + one OUT)
      const totalInCameras = totalLocations;
      const totalOutCameras = totalLocations;

      // ✅ Build summary by matching survey.booth.documentId and block.Locations[].documentId
      const blockData = allBlocks.map((block: any) => {
        const blockId = block.documentId;
        const blockName = block.Block_Name;

        // All location IDs under this block
        const blockLocationIds = (block.Locations || []).map(
          (loc: any) => loc.documentId
        );

        // ✅ Raised surveys
        const raisedSurveys = allSurveys.filter((s: any) =>
          blockLocationIds.includes(s.booth?.documentId)
        ).length;

        // ✅ Raised BOQs
        const raisedBoqs = allBoqs.filter((b: any) =>
          blockLocationIds.includes(b.location?.documentId)
        ).length;

        // ✅ Cameras under this block
        const blockCameras = assemblyCameras.filter((c: any) =>
          blockLocationIds.includes(c.assigned_booth?.documentId)
        );

        const installedInCameras = blockCameras.filter(
          (c: any) => c.Position === "IN" && c.state === "Installed"
        ).length;
        const installedOutCameras = blockCameras.filter(
          (c: any) => c.Position === "OUT" && c.state === "Installed"
        ).length;

        return {
          id: blockId,
          Block_Name: blockName,
          totalLocations: blockLocationIds.length,
          raisedSurveys,
          raisedBoqs,
          installedInCameras,
          installedOutCameras,
          totalInCameras: blockLocationIds.length,
          totalOutCameras: blockLocationIds.length,
        };
      });

      // 7️⃣ Set state
      setSummary({
        totalBlocks,
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
      setBlockSummary(blockData);
    } catch (err) {
      console.error("Error loading assembly dashboard:", err);
      message.error("Failed to load assembly dashboard data");
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
    <div className="  py-10 px-6">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Assembly Dashboard — {assembly?.Assembly_Name}
        </h1>

        {/* Summary Cards */}
        {/* Summary Cards */}
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <DashboardCard
            icon={<Layers className="text-blue-500" />}
            label="Total Blocks"
            value={summary.totalBlocks}
          />
          <DashboardCard
            icon={<MapPin className="text-amber-500" />}
            label="Total Locations"
            value={summary.totalLocations}
          />

          {/* 🟢 Surveys card with raised/total */}
          <DashboardCard
            icon={<ClipboardList className="text-green-500" />}
            label="Surveys (Raised / Total)"
            value={`${summary.raisedSurveys} / ${summary.totalSurveys}`}
          />

          {/* 🟣 BOQs card with raised/total */}
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

        {/* Block-wise Summary Table */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Block-wise Summary
            </h2>
            <Table
              dataSource={blockSummary}
              pagination={false}
              rowKey="id"
              columns={[
                { title: "Block Name", dataIndex: "Block_Name" },
                { title: "Total Locations", dataIndex: "totalLocations" },
                { title: "Raised Surveys", dataIndex: "raisedSurveys" },
                { title: "Raised BOQs", dataIndex: "raisedBoqs" },
                {
                  title: "IN Cameras (Installed / Total)",
                  render: (record) =>
                    `${record.installedInCameras} / ${record.totalInCameras}`,
                },
                {
                  title: "OUT Cameras (Installed / Total)",
                  render: (record) =>
                    `${record.installedOutCameras} / ${record.totalOutCameras}`,
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
