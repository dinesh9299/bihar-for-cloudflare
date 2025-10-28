"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Spin, Skeleton } from "antd";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  FileSpreadsheet,
  ClipboardList,
  MapPin,
} from "lucide-react";

export default function DistrictCoordinatorDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [partialLoading, setPartialLoading] = useState(false);
  const [district, setDistrict] = useState<any>(null);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAssemblies: 0,
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

  // 🧩 1. Fetch Logged-in User
  const getUser = async () => {
    try {
      const res = await api.get("/users/me?populate=*");
      return res.data;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error fetching user",
        description: "Unable to load user info.",
      });
      return null;
    }
  };

  // 🧩 2. Fetch Dashboard Data
  const fetchDashboardData = async (districtId: string) => {
    try {
      setLoading(true);

      // 🕸 Parallel fetch — district + location count
      const [distRes, locCountRes] = await Promise.all([
        api.get(`/districts/${districtId}?populate=assemblies`),
        api.get(
          `/locations?filters[assembly][district][documentId][$eq]=${districtId}&pagination[pageSize]=1`
        ),
      ]);

      const distData = distRes.data.data;
      setDistrict(distData);

      const assembliesList = distData.assemblies || [];
      const totalLocations = locCountRes.data.meta?.pagination?.total ?? 0;

      // 🧮 Parallel paginated camera fetching
      const fetchCameras = async () => {
        let all: any[] = [];
        let page = 1;
        while (true) {
          const res = await api.get(
            `/cameras?filters[assigned_booth][assembly][district][documentId][$eq]=${distData.documentId}&pagination[page]=${page}&pagination[pageSize]=100&populate=assigned_booth.assembly`
          );
          const data = res.data.data || [];
          all.push(...data);
          const meta = res.data.meta?.pagination;
          if (!meta || page >= meta.pageCount) break;
          page++;
        }
        return all;
      };

      const allCameras = await fetchCameras();

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

      // 🎥 District-level camera summary
      // 🎥 District-level camera summary
      const installedInCameras = normalizedCameras.filter(
        (c) => c.Position === "IN" && c.state === "Installed"
      ).length;
      const installedOutCameras = normalizedCameras.filter(
        (c) => c.Position === "OUT" && c.state === "Installed"
      ).length;

      // ✅ total cameras per location = 1 IN + 1 OUT
      const totalInCameras = totalLocations;
      const totalOutCameras = totalLocations;

      // ✅ Initialize with district-level totals
      const totalsTemplate = {
        totalAssemblies: assembliesList.length,
        totalLocations: 0, // 🧩 start from 0 to avoid adding twice
        totalSurveys: 0,
        raisedSurveys: 0,
        totalBoqs: 0,
        raisedBoqs: 0,
        totalInCameras: totalInCameras,
        installedInCameras: installedInCameras,
        totalOutCameras: totalOutCameras,
        installedOutCameras: installedOutCameras,
      };

      setSummary(totalsTemplate);

      // 🧩 Fetch assembly data progressively (non-blocking)
      setPartialLoading(true);
      const assemblyData: any[] = [];

      await Promise.all(
        assembliesList.map(async (assembly) => {
          const [locRes, surveyRes, boqRes] = await Promise.all([
            api.get(
              `/locations?filters[assembly][documentId][$eq]=${assembly.documentId}&pagination[pageSize]=1`
            ),
            api.get(
              `/surveys?filters[booth][assembly][documentId][$eq]=${assembly.documentId}&pagination[pageSize]=1`
            ),
            api.get(
              `/boqs?filters[location][assembly][documentId][$eq]=${assembly.documentId}&pagination[pageSize]=1`
            ),
          ]);

          const totalLocs = locRes.data.meta?.pagination?.total ?? 0;
          const raisedSurveyCount = surveyRes.data.meta?.pagination?.total ?? 0;
          const raisedBoqCount = boqRes.data.meta?.pagination?.total ?? 0;

          const cams = normalizedCameras.filter(
            (c) =>
              c.assigned_booth?.assembly?.documentId === assembly.documentId
          );
          const installedIn = cams.filter(
            (c) => c.Position === "IN" && c.state === "Installed"
          ).length;
          const installedOut = cams.filter(
            (c) => c.Position === "OUT" && c.state === "Installed"
          ).length;

          const data = {
            id: assembly.documentId,
            Assembly_Name: assembly.Assembly_Name,
            Assembly_No: assembly.Assembly_No,
            locations: totalLocs,
            raisedSurveys: raisedSurveyCount,
            raisedBoqs: raisedBoqCount,
            totalSurveys: totalLocs,
            totalBoqs: totalLocs,
            totalInCameras: totalLocs,
            totalOutCameras: totalLocs,
            installedInCameras: installedIn,
            installedOutCameras: installedOut,
          };

          assemblyData.push(data);
          // Progressive render (avoid re-renders for each)
          if (assemblyData.length % 3 === 0) {
            setAssemblies([...assemblyData]);
          }
        })
      );

      // ✅ Final render
      setAssemblies(assemblyData);

      // Update summary totals
      const totals = assemblyData.reduce((acc, a) => {
        acc.totalLocations += a.locations;
        acc.totalSurveys += a.totalSurveys;
        acc.raisedSurveys += a.raisedSurveys;
        acc.totalBoqs += a.totalBoqs;
        acc.raisedBoqs += a.raisedBoqs;
        acc.installedInCameras += a.installedInCameras;
        acc.installedOutCameras += a.installedOutCameras;
        return acc;
      }, totalsTemplate);

      setSummary(totals);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load dashboard data.",
      });
    } finally {
      setLoading(false);
      setPartialLoading(false);
    }
  };

  // 🧩 3. Initialize
  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u?.districts?.length) {
        fetchDashboardData(u.districts[0].documentId);
      } else {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "No District Assigned",
          description: "This coordinator is not linked to any district.",
        });
      }
    })();
  }, []);

  // 🧩 4. Loader
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );

  // 🧩 5. UI
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          District Dashboard — {district?.district_name}
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {Object.keys(summary).length === 0 ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : (
            <>
              <DashboardCard
                icon={<MapPin className="text-indigo-500" />}
                label="Total Assemblies"
                value={summary.totalAssemblies}
              />
              <DashboardCard
                icon={<FileSpreadsheet className="text-amber-500" />}
                label="Total Locations"
                value={summary.totalLocations}
              />
              <DashboardCard
                icon={<ClipboardList className="text-green-500" />}
                label="Surveys (Raised / Total)"
                value={`${summary.raisedSurveys} / ${summary.totalSurveys}`}
              />
              <DashboardCard
                icon={<BarChart3 className="text-blue-500" />}
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
            </>
          )}
        </div>

        {/* Assemblies Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Assemblies Summary
          </h2>
          {partialLoading && (
            <div className="text-sm text-gray-400 mb-3">
              Loading assembly data...
            </div>
          )}
          <div className="w-full overflow-x-auto">
            <Table
              loading={partialLoading}
              dataSource={assemblies}
              pagination={false}
              rowKey="id"
              columns={[
                { title: "Assembly Name", dataIndex: "Assembly_Name" },
                { title: "Assembly No", dataIndex: "Assembly_No" },
                { title: "Total Locations", dataIndex: "locations" },
                { title: "Raised Surveys", dataIndex: "raisedSurveys" },
                { title: "Raised BOQs", dataIndex: "raisedBoqs" },
                {
                  title: "IN Cameras (Installed / Total)",
                  render: (r) =>
                    `${r.installedInCameras} / ${r.totalInCameras}`,
                },
                {
                  title: "OUT Cameras (Installed / Total)",
                  render: (r) =>
                    `${r.installedOutCameras} / ${r.totalOutCameras}`,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧩 Reusable Dashboard Card Component
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
