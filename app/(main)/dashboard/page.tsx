"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { message, Spin, Table } from "antd";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernCard } from "@/components/ui/modern-card";
import { StatCard } from "@/components/ui/stat-card";
import {
  MapPin,
  Box,
  FileText,
  ClipboardList,
  CheckCircle,
  Camera,
} from "lucide-react";
import api from "@/lib/api";

export default function BiharElectionDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDistricts: 0,
    totalAssemblies: 0,
    totalLocations: 0,
    totalSurveys: 0,
    totalBoqs: 0,
    totalInCameras: 0,
    installedInCameras: 0,
    totalOutCameras: 0,
    installedOutCameras: 0,
  });
  const [districtSummary, setDistrictSummary] = useState<any[]>([]);
  const [assemblySummary, setAssemblySummary] = useState<any[]>([]);

  // helper: get count via pagination meta
  const count = async (endpoint: string) => {
    try {
      const res = await api.get(`${endpoint}?pagination[pageSize]=1`);
      return res.data?.meta?.pagination?.total ?? 0;
    } catch (err) {
      console.warn(`Failed to fetch ${endpoint}`, err);
      return 0;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // 1️⃣ Global counts
        const [districts, assemblies, locations, surveys, boqs] =
          await Promise.all([
            count("/districts"),
            count("/assemblies"),
            count("/locations"),
            count("/surveys"),
            count("/boqs"),
          ]);

        // 2️⃣ Fetch all cameras with relations
        const cameraRes = await api.get(
          `/cameras?populate=assigned_booth.assembly.district&pagination[pageSize]=10000`
        );
        const allCameras = cameraRes.data.data || [];

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
            assembly: assigned?.assembly,
            district: assigned?.assembly?.district,
          };
        });

        const installedInCameras = normalizedCameras.filter(
          (c) => c.Position === "IN" && c.state === "Installed"
        ).length;
        const installedOutCameras = normalizedCameras.filter(
          (c) => c.Position === "OUT" && c.state === "Installed"
        ).length;

        setStats({
          totalDistricts: districts,
          totalAssemblies: assemblies,
          totalLocations: locations,
          totalSurveys: surveys,
          totalBoqs: boqs,
          totalInCameras: locations,
          installedInCameras,
          totalOutCameras: locations,
          installedOutCameras,
        });

        // 3️⃣ District-level summary
        const distRes = await api.get(`/districts?populate=assemblies`);
        const allDistricts = distRes.data.data || [];

        const districtData = await Promise.all(
          allDistricts.map(async (dist: any) => {
            const districtId = dist.documentId;
            const districtName = dist.district_name;

            const locRes = await api.get(
              `/locations?filters[assembly][district][documentId][$eq]=${districtId}&pagination[pageSize]=1`
            );
            const totalLocs = locRes.data.meta?.pagination?.total ?? 0;

            const surveyRes = await api.get(
              `/surveys?filters[booth][assembly][district][documentId][$eq]=${districtId}&pagination[pageSize]=1`
            );
            const raisedSurveys = surveyRes.data.meta?.pagination?.total ?? 0;

            const boqRes = await api.get(
              `/boqs?filters[location][assembly][district][documentId][$eq]=${districtId}&pagination[pageSize]=1`
            );
            const raisedBoqs = boqRes.data.meta?.pagination?.total ?? 0;

            const districtCameras = normalizedCameras.filter(
              (c) => c.district?.documentId === districtId
            );

            const installedIn = districtCameras.filter(
              (c) => c.Position === "IN" && c.state === "Installed"
            ).length;
            const installedOut = districtCameras.filter(
              (c) => c.Position === "OUT" && c.state === "Installed"
            ).length;

            return {
              id: districtId,
              name: districtName,
              assemblies: dist.assemblies?.length || 0,
              totalLocations: totalLocs,
              raisedSurveys,
              raisedBoqs,
              totalInCameras: totalLocs,
              installedInCameras: installedIn,
              totalOutCameras: totalLocs,
              installedOutCameras: installedOut,
            };
          })
        );

        setDistrictSummary(districtData);

        // 4️⃣ Assembly-level summary
        const asmRes = await api.get(
          `/assemblies?populate=district&pagination[pageSize]=1000`
        );
        const allAssemblies = asmRes.data.data || [];

        const asmData = await Promise.all(
          allAssemblies.map(async (asm: any) => {
            const asmId = asm.documentId;
            const asmName = asm.Assembly_Name;
            const asmNo = asm.Assembly_No;
            const districtName = asm.district?.district_name ?? "N/A";

            const locRes = await api.get(
              `/locations?filters[assembly][documentId][$eq]=${asmId}&pagination[pageSize]=1`
            );
            const totalLocs = locRes.data.meta?.pagination?.total ?? 0;

            const surveyRes = await api.get(
              `/surveys?filters[booth][assembly][documentId][$eq]=${asmId}&pagination[pageSize]=1`
            );
            const raisedSurveys = surveyRes.data.meta?.pagination?.total ?? 0;

            const boqRes = await api.get(
              `/boqs?filters[location][assembly][documentId][$eq]=${asmId}&pagination[pageSize]=1`
            );
            const raisedBoqs = boqRes.data.meta?.pagination?.total ?? 0;

            const assemblyCameras = normalizedCameras.filter(
              (c) => c.assembly?.documentId === asmId
            );

            const installedIn = assemblyCameras.filter(
              (c) => c.Position === "IN" && c.state === "Installed"
            ).length;
            const installedOut = assemblyCameras.filter(
              (c) => c.Position === "OUT" && c.state === "Installed"
            ).length;

            return {
              id: asmId,
              assemblyName: asmName,
              assemblyNo: asmNo,
              district: districtName,
              totalLocations: totalLocs,
              raisedSurveys,
              raisedBoqs,
              totalInCameras: totalLocs,
              installedInCameras: installedIn,
              totalOutCameras: totalLocs,
              installedOutCameras: installedOut,
            };
          })
        );

        setAssemblySummary(asmData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        message.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading)
    return (
      <PageLayout>
        <div className="flex justify-center bg-white items-center h-screen">
          <Spin size="large" />
        </div>
      </PageLayout>
    );

  return (
    <PageLayout>
      <main className=" sm:p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-8 text-center">
          {" "}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900"
          >
            {" "}
            Bihar Election Monitoring Dashboard{" "}
          </motion.h1>{" "}
          <p className="text-gray-600 mt-2 text-sm">
            {" "}
            Real-time project summary and operational overview{" "}
          </p>{" "}
        </div>{" "}
        {/* Project Info */}{" "}
        <ModernCard className="mb-6">
          {" "}
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {" "}
            Project Details{" "}
          </h3>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
            {" "}
            <div>
              {" "}
              <span className="font-medium">Project Name:</span> Bihar Election
              Monitoring{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="font-medium">Project Code:</span> BEM-2025{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="font-medium">State:</span> Bihar{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="font-medium">Managed By:</span> Brihaspathi
              Technologies Pvt. Ltd.{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="font-medium">Phase:</span> Phase I – Setup &
              Monitoring{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="font-medium">Description:</span> Election data
              management, coordination, and live booth monitoring system.{" "}
            </div>{" "}
          </div>{" "}
        </ModernCard>{" "}
        {/* Stats Grid */}{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {" "}
          <StatCard
            title="Districts"
            value={stats.totalDistricts}
            subtitle="Included in this project"
            icon={<MapPin className="w-6 h-6" />}
            color="blue"
          />{" "}
          <StatCard
            title="Assemblies"
            value={stats.totalAssemblies}
            subtitle="Total covered assemblies"
            icon={<Box className="w-6 h-6" />}
            color="orange"
          />{" "}
          <StatCard
            title="Locations"
            value={stats.totalLocations}
            subtitle="Polling/Booth locations"
            icon={<MapPin className="w-6 h-6" />}
            color="green"
          />{" "}
          <StatCard
            title="Raised Surveys"
            value={stats.totalSurveys}
            subtitle="Submitted field surveys"
            icon={<FileText className="w-6 h-6" />}
            color="purple"
          />{" "}
          <StatCard
            title="Raised BOQs"
            value={stats.totalBoqs}
            subtitle="Total generated BOQs"
            icon={<ClipboardList className="w-6 h-6" />}
            color="amber"
          />{" "}
          <StatCard
            title="Status"
            value="Active"
            subtitle="Currently operational"
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />{" "}
        </div>
        {/* 📍 District Summary Table */}
        <ModernCard className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            District Summary
          </h2>
          <Table
            dataSource={districtSummary}
            pagination={false}
            rowKey="id"
            columns={[
              { title: "District", dataIndex: "name" },
              { title: "Assemblies", dataIndex: "assemblies" },
              { title: "Total Locations", dataIndex: "totalLocations" },
              { title: "Raised Surveys", dataIndex: "raisedSurveys" },
              { title: "Raised BOQs", dataIndex: "raisedBoqs" },
              {
                title: "IN Cameras (Installed / Total)",
                render: (r) => `${r.installedInCameras} / ${r.totalInCameras}`,
              },
              {
                title: "OUT Cameras (Installed / Total)",
                render: (r) =>
                  `${r.installedOutCameras} / ${r.totalOutCameras}`,
              },
            ]}
          />
        </ModernCard>
        {/* 🏛 Assembly Summary Table */}
        <ModernCard>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Assembly Summary
          </h2>
          <Table
            dataSource={assemblySummary}
            pagination={false}
            rowKey="id"
            columns={[
              { title: "Assembly Name", dataIndex: "assemblyName" },
              { title: "Assembly No", dataIndex: "assemblyNo" },
              { title: "District", dataIndex: "district" },
              { title: "Total Locations", dataIndex: "totalLocations" },
              { title: "Raised Surveys", dataIndex: "raisedSurveys" },
              { title: "Raised BOQs", dataIndex: "raisedBoqs" },
              {
                title: "IN Cameras (Installed / Total)",
                render: (r) => `${r.installedInCameras} / ${r.totalInCameras}`,
              },
              {
                title: "OUT Cameras (Installed / Total)",
                render: (r) =>
                  `${r.installedOutCameras} / ${r.totalOutCameras}`,
              },
            ]}
          />
        </ModernCard>
      </main>
    </PageLayout>
  );
}
