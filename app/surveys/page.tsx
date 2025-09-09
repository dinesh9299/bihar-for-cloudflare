"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  User,
  Camera,
  Eye,
  Edit,
  Download,
  MoreHorizontal,
  Clock,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Navigation,
  Upload,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Camera {
  id?: string;
  type: string;
  serialNumber: string;
  poleLocation: string;
  distanceBetweenCameras: string;
  direction: string;
  gpsLatitude: string;
  gpsLongitude: string;
}

interface Survey {
  id: string;
  documentId: string;
  surveyName: string;
  division: { id: string; name: string };
  depot: { id: string; name: string };
  bus_station: { id: string; name: string };
  bus_stand: { id: string; name: string };
  surveyPurpose: string;
  locationDetails: string;
  workStatus:
    | "survey-initiated"
    | "in-progress"
    | "survey-completed"
    | "pending-approval"
    | "ready-for-installation";
  notes?: string;
  cameraDetails: Camera[];
  photos: { id: number }[];
}

interface Division {
  id: string;
  name: string;
}
interface Depot {
  id: string;
  name: string;
  division: string;
}
interface BusStation {
  id: string;
  name: string;
  depot: string;
}
interface BusStand {
  id: string;
  name: string;
  busStation: string;
}

export default function SurveysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const itemsPerPage = 5;
  const { toast } = useToast();
  const router = useRouter();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [gpsStatus, setGpsStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [busStations, setBusStations] = useState<BusStation[]>([]);
  const [busStands, setBusStands] = useState<BusStand[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const [editFormData, setEditFormData] = useState({
    surveyName: "",
    division: "",
    depot: "",
    busStation: "",
    busStand: "",
    surveyPurpose: "",
    workStatus: "",
    notes: "",
    cameraDetails: [] as Camera[],
    locationDetails: "",
    photos: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchall();
        getGPSLocation();
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch surveys. Please try again.",
        });
      }
    };
    fetchData();
  }, []);

  const fetchall = async () => {
    try {
      const [surveyRes, divRes, depRes, busStatRes, busStandRes] =
        await Promise.all([
          axios.get("http://localhost:1337/api/surveys?populate=*"),
          axios.get("http://localhost:1337/api/divisions"),
          axios.get("http://localhost:1337/api/depots?populate=*"),
          axios.get("http://localhost:1337/api/bus-stations?populate=*"),
          axios.get("http://localhost:1337/api/bus-stands?populate=*"),
        ]);

      console.log("Survey Response:", surveyRes.data);

      setSurveys(
        surveyRes.data.data.map((s: any) => ({
          id: s.id.toString(),
          documentId: s.documentId,
          surveyName: s.surveyName,
          locationDetails: s.locationDetails,
          division: {
            id: s.division?.id.toString() ?? "",
            name: s.division?.name ?? "",
          },
          depot: s.depot
            ? { id: s.depot.id.toString(), name: s.depot.name }
            : { id: "", name: "" },
          bus_station: s.bus_station
            ? { id: s.bus_station.id.toString(), name: s.bus_station.name }
            : { id: "", name: "" },
          bus_stand: s.bus_stand
            ? { id: s.bus_stand.id.toString(), name: s.bus_stand.name }
            : { id: "", name: "" },
          surveyPurpose: s.surveyPurpose,
          workStatus: s.workStatus,
          notes: s.notes || "",
          cameraDetails: s.cameraDetails || [],
          photos: s.photos ? s.photos.map((p: any) => ({ id: p.id })) : [],
        }))
      );
      setDivisions(
        divRes.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
        }))
      );
      setDepots(
        depRes.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          division: d.division?.id?.toString() || "",
        }))
      );
      setBusStations(
        busStatRes.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          depot: d.depot?.id?.toString() || "",
        }))
      );
      setBusStands(
        busStandRes.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          busStation: d.bus_station?.id?.toString() || "",
        }))
      );
    } catch (error) {
      console.error("Fetchall error:", error);
      throw error; // Re-throw to be caught by useEffect
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "survey-completed":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "in-progress":
        return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
      case "survey-initiated":
      case "pending-approval":
      case "ready-for-installation":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.surveyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.bus_station.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || survey.workStatus === statusFilter;
    const matchesDivision =
      divisionFilter === "all" || survey.division.id === divisionFilter;
    return matchesSearch && matchesStatus && matchesDivision;
  });

  console.log("kjhgf", divisionFilter);

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getGPSLocation = () => {
    setIsRefreshingGPS(true);
    setGpsStatus("loading");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsStatus("success");
          setIsRefreshingGPS(false);
          toast({
            variant: "success",
            title: "GPS Location Updated",
            description: `Location: ${position.coords.latitude.toFixed(
              6
            )}, ${position.coords.longitude.toFixed(6)}`,
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          setGpsStatus("error");
          setIsRefreshingGPS(false);
          toast({
            variant: "destructive",
            title: "GPS Error",
            description:
              "Unable to get your current location. Please check your location settings.",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsStatus("error");
      setIsRefreshingGPS(false);
      toast({
        variant: "destructive",
        title: "GPS Not Supported",
        description: "Your browser doesn't support GPS location services.",
      });
    }
  };

  const handleEdit = async (survey: Survey) => {
    setEditingSurvey(survey);
    setEditFormData({
      surveyName: survey.surveyName || "",
      division: survey.division.id || "",
      depot: survey.depot?.id || "", // Handle null depot
      busStation: survey.bus_station.id || "",
      busStand: survey.bus_stand.id || "", // Handle null or missing bus_stand
      surveyPurpose: survey.surveyPurpose || "",
      workStatus: survey.workStatus || "",
      notes: survey.notes || "",
      locationDetails: survey.locationDetails || "",
      cameraDetails: survey.cameraDetails.map((c) => ({
        ...c,
        id: c.id?.toString() || "",
        gpsLatitude: c.gpsLatitude || "",
        gpsLongitude: c.gpsLongitude || "",
      })),
      photos: survey.photos.map((p) => p.id) || [],
    });
    setPhotos([]);

    // Fetch existing photo URLs
    try {
      const photoUrls = await Promise.all(
        survey.photos.map(async (photo) => {
          const response = await axios.get(
            `http://localhost:1337/api/upload/files/${photo.id}`
          );
          const url = response.data.url;
          return url.startsWith("http") ? url : `http://localhost:1337${url}`;
        })
      );
      setExistingPhotos(photoUrls);
    } catch (error) {
      console.error("Error fetching photo URLs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch existing photos. Please try again.",
      });
    }
    setIsEditDialogOpen(true);

    console.log("Editing survey:", survey);

    // Debug log
    console.log("Editing survey data:", {
      division: survey.division.id,
      depot: survey.depot?.id,
      busStation: survey.bus_station.id,
      busStand: survey.bus_stand.id,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);
      toast({
        variant: "success",
        title: "Photos Uploaded",
        description: `${newFiles.length} photo(s) added successfully`,
      });
    }
  };

  const removePhoto = (index: number) => {
    const removedPhoto = photos[index];
    setPhotos(photos.filter((_, i) => i !== index));
    toast({
      variant: "success",
      title: "Photo Removed",
      description: `${removedPhoto.name} has been removed from the survey`,
    });
  };

  const addCameraDetail = () => {
    setEditFormData({
      ...editFormData,
      cameraDetails: [
        ...editFormData.cameraDetails,
        {
          type: "",
          serialNumber: "",
          poleLocation: "",
          distanceBetweenCameras: "",
          direction: "",
          gpsLatitude: location?.lat.toString() || "",
          gpsLongitude: location?.lng.toString() || "",
        },
      ],
    });
    toast({
      variant: "success",
      title: "Camera Added",
      description: "New camera details section added",
    });
  };

  const removeCameraDetail = (index: number) => {
    setEditFormData({
      ...editFormData,
      cameraDetails: editFormData.cameraDetails.filter((_, i) => i !== index),
    });
    toast({
      variant: "success",
      title: "Camera Removed",
      description: `Camera ${index + 1} details removed`,
    });
  };

  const updateCameraDetail = (index: number, field: string, value: string) => {
    const updatedDetails = [...editFormData.cameraDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setEditFormData({ ...editFormData, cameraDetails: updatedDetails });
  };

  const applyCurrentLocationToCamera = (index: number) => {
    if (location) {
      updateCameraDetail(index, "gpsLatitude", location.lat.toString());
      updateCameraDetail(index, "gpsLongitude", location.lng.toString());
      toast({
        variant: "success",
        title: "GPS Applied",
        description: `Current location applied to Camera ${index + 1}`,
      });
    }
  };
  const handleSaveEdit = async () => {
    try {
      if (editFormData.locationDetails) {
        if (
          !editFormData.surveyName ||
          !editFormData.locationDetails ||
          !editFormData.surveyPurpose ||
          !editFormData.workStatus
        ) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "All required fields must be filled",
          });
          return;
        }
      } else {
        if (
          !editFormData.surveyName ||
          !editFormData.division ||
          !editFormData.busStation ||
          !editFormData.busStand ||
          !editFormData.surveyPurpose ||
          !editFormData.workStatus
        ) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "All required fields must be filled",
          });
          return;
        }
      }

      if (
        editFormData.cameraDetails.some(
          (camera) => !camera.type || !camera.poleLocation
        )
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Camera type and pole location are required for all cameras",
        });
        return;
      }

      if (gpsStatus !== "success") {
        toast({
          variant: "warning",
          title: "GPS Warning",
          description:
            "GPS location is not available. Survey will be updated without current GPS data.",
        });
      }

      setIsSubmitting(true);

      let photoIds: number[] = [...editFormData.photos];
      if (photos.length > 0) {
        const form = new FormData();
        photos.forEach((file) => form.append("files", file));
        const uploadRes = await axios.post(
          "http://localhost:1337/api/upload",
          form
        );
        const newPhotoIds = uploadRes.data.map((img: any) => img.id);
        photoIds = [...photoIds, ...newPhotoIds];
      }

      if (editingSurvey) {
        if (editFormData.locationDetails) {
          const payload = {
            data: {
              surveyName: editFormData.surveyName,
              surveyPurpose: editFormData.surveyPurpose,
              workStatus: editFormData.workStatus,
              notes: editFormData.notes,
              locationDetails: editFormData.locationDetails,
              cameraDetails: editFormData.cameraDetails.map((camera) => {
                const { id, ...rest } = camera;
                return rest;
              }),
              photos: photoIds,
            },
          };

          console.log("Payload:", payload);
          const response = await axios.put(
            `http://localhost:1337/api/surveys/${editingSurvey.documentId}`,
            payload
          );
        } else {
          const payload = {
            data: {
              surveyName: editFormData.surveyName,
              surveyPurpose: editFormData.surveyPurpose,
              workStatus: editFormData.workStatus,
              notes: editFormData.notes,
              division: editFormData.division, // Use string
              depot: editFormData.depot || null, // Use string or null
              bus_station: editFormData.busStation, // Use string
              bus_stand: editFormData.busStand, // Use string
              cameraDetails: editFormData.cameraDetails.map((camera) => {
                const { id, ...rest } = camera;
                return rest;
              }),
              photos: photoIds,
            },
          };

          console.log("Payload:", payload);
          const response = await axios.put(
            `http://localhost:1337/api/surveys/${editingSurvey.documentId}`,
            payload
          );
        }

        await fetchall(); // Refresh data
        setSurveys((prevSurveys) =>
          prevSurveys.map((survey) =>
            survey.documentId === editingSurvey.documentId
              ? {
                  ...survey,
                  surveyName: editFormData.surveyName,
                  division: {
                    id: editFormData.division,
                    name: survey.division.name,
                  },
                  depot: editFormData.depot
                    ? { id: editFormData.depot, name: survey.depot.name }
                    : { id: "", name: "" },
                  bus_station: {
                    id: editFormData.busStation,
                    name: survey.bus_station.name,
                  },
                  bus_stand: {
                    id: editFormData.busStand,
                    name: survey.bus_stand.name,
                  },
                  surveyPurpose: editFormData.surveyPurpose,
                  workStatus: editFormData.workStatus,
                  notes: editFormData.notes,
                  cameraDetails: editFormData.cameraDetails,
                  photos: photoIds.map((id) => ({ id })),
                }
              : survey
          )
        );
        setIsEditDialogOpen(false);
        setEditingSurvey(null);
        setPhotos([]);

        toast({
          variant: "success",
          title: "Survey Updated",
          description: `${editFormData.surveyName} has been successfully updated`,
        });
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to update survey. Please try again. Check console for details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setEditingSurvey(null);
    setEditFormData({
      surveyName: "",
      division: "",
      depot: "",
      busStation: "",
      busStand: "",
      surveyPurpose: "",
      workStatus: "",
      notes: "",
      cameraDetails: [],
      photos: [],
    });
    setPhotos([]);
  };

  const handleDelete = async (survey: Survey) => {
    if (confirm(`Are you sure you want to delete "${survey.surveyName}"?`)) {
      try {
        // Step 1: Delete associated images
        if (survey.photos && survey.photos.length > 0) {
          await Promise.all(
            survey.photos.map(async (photo) => {
              await axios.delete(
                `http://localhost:1337/api/upload/files/${photo.id}`
              );
            })
          );
          console.log(
            `Deleted ${survey.photos.length} images for survey ${survey.surveyName}`
          );
        }

        // Step 2: Delete the survey
        await axios.delete(
          `http://localhost:1337/api/surveys/${survey.documentId}`
        );

        // Step 3: Update local state
        setSurveys(surveys.filter((s) => s.documentId !== survey.documentId));
        toast({
          variant: "success",
          title: "Survey Deleted",
          description: `${survey.surveyName} has been successfully deleted along with its images`,
        });
      } catch (error) {
        console.error("Error deleting survey or images:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to delete survey or its images. Please try again.",
        });
      }
    }
  };
  const handleExport = () => {
    try {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "ID,Survey Name,Bus Station,Division,Status,Date,Cameras\n" +
        surveys
          .map(
            (s) =>
              `${s.documentId},${s.surveyName},${s.bus_station.name},${s.division.name},${s.workStatus},${s.id},${s.cameraDetails.length}`
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "surveys_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        variant: "success",
        title: "Export Successful",
        description: "Survey data has been exported to CSV file",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export survey data. Please try again.",
      });
    }
  };

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="Site Surveys"
            subtitle="Manage and track all CCTV installation surveys"
            showGPS={true}
            gpsStatus={gpsStatus === "success" ? "connected" : "disconnected"}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StatCard
                  title="Total Surveys"
                  value={surveys.length}
                  subtitle="All time"
                  icon={<MapPin className="w-6 h-6" />}
                  color="amber"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard
                  title="Completed"
                  value={
                    surveys.filter((s) => s.workStatus === "survey-completed")
                      .length
                  }
                  subtitle="This month"
                  icon={<Camera className="w-6 h-6" />}
                  color="green"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatCard
                  title="In Progress"
                  value={
                    surveys.filter((s) => s.workStatus === "in-progress").length
                  }
                  subtitle="Active now"
                  icon={<Clock className="w-6 h-6" />}
                  color="blue"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StatCard
                  title="Pending"
                  value={
                    surveys.filter((s) =>
                      [
                        "survey-initiated",
                        "pending-approval",
                        "ready-for-installation",
                      ].includes(s.workStatus)
                    ).length
                  }
                  subtitle="Awaiting start"
                  icon={<User className="w-6 h-6" />}
                  color="purple"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ModernCard className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search surveys..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="survey-completed">
                          Completed
                        </SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="survey-initiated">
                          Initiated
                        </SelectItem>
                        <SelectItem value="pending-approval">
                          Pending Approval
                        </SelectItem>
                        <SelectItem value="ready-for-installation">
                          Ready for Installation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={divisionFilter}
                      onValueChange={setDivisionFilter}
                    >
                      <SelectTrigger className="w-40 h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                        <SelectValue placeholder="Division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Divisions</SelectItem>
                        {divisions.map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PillButton variant="secondary" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </PillButton>
                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </PillButton>
                    <Link href="/surveys/new">
                      <PillButton variant="accent" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Survey
                      </PillButton>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ModernCard>
                <div className="space-y-2 sm:space-y-4">
                  {paginatedSurveys.map((survey, index) => (
                    <motion.div
                      key={survey.documentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-2xl hover:bg-white/70 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-4 w-full mb-2 sm:mb-0">
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-1 sm:p-2 rounded-lg sm:rounded-2xl">
                          <MapPin className="w-4 h-4 sm:w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900">
                              {survey.surveyName}
                            </h3>
                            <Badge
                              className={getStatusColor(survey.workStatus)}
                            >
                              {survey.workStatus.replace("-", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 mb-1">
                            {survey.bus_station.name}
                          </p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3 sm:w-4 h-4" />
                              <span>{survey.division.name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 sm:w-4 h-4" />
                              <span>{survey.id}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Camera className="w-3 h-3 sm:w-4 h-4" />
                              <span>{survey.cameraDetails.length} cameras</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <div className="text-right w-full sm:w-20 mb-2 sm:mb-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            0%
                          </div>
                          <div className="w-full sm:w-20 bg-gray-200 rounded-full h-1 sm:h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1 sm:h-2 rounded-full"
                              style={{ width: `0%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                          <Link href={`/surveys/${survey.documentId}`}>
                            <PillButton variant="secondary" size="sm">
                              <Eye className="w-3 h-3 sm:w-4 h-4" />
                            </PillButton>
                          </Link>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(survey)}
                          >
                            <Edit className="w-3 h-3 sm:w-4 h-4" />
                          </PillButton>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(survey)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 h-4" />
                          </PillButton>
                          <PillButton variant="secondary" size="sm">
                            <MoreHorizontal className="w-3 h-3 sm:w-4 h-4" />
                          </PillButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/30">
                    <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredSurveys.length
                      )}{" "}
                      of {filteredSurveys.length} surveys
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 h-4" />
                      </PillButton>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PillButton
                            key={page}
                            variant={
                              currentPage === page ? "accent" : "secondary"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PillButton>
                        )
                      )}
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 h-4" />
                      </PillButton>
                    </div>
                  </div>
                )}
                {filteredSurveys.length === 0 && (
                  <div className="text-center py-4 sm:py-12">
                    <MapPin className="w-8 h-8 sm:w-12 h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                    <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                      No surveys found
                    </h3>
                    <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <Link href="/surveys/new">
                      <PillButton variant="accent" size="sm">
                        <Plus className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" />
                        Create New Survey
                      </PillButton>
                    </Link>
                  </div>
                )}
              </ModernCard>
            </motion.div>
          </main>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-white/30">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Survey</DialogTitle>
              {/* <PillButton
                variant="secondary"
                size="sm"
                onClick={handleCloseEdit}
              >
                <X className="w-4 h-4" />
              </PillButton> */}
            </div>
          </DialogHeader>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto">
            {/* GPS Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ModernCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        gpsStatus === "success"
                          ? "bg-gradient-to-br from-green-400 to-emerald-500"
                          : gpsStatus === "error"
                          ? "bg-gradient-to-br from-red-400 to-red-500"
                          : "bg-gradient-to-br from-amber-400 to-yellow-500"
                      }`}
                    >
                      <Navigation className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        GPS Location Status
                      </h3>
                      <p className="text-sm text-gray-600">
                        {gpsStatus === "success" && location
                          ? `Lat: ${location.lat.toFixed(
                              6
                            )}, Lng: ${location.lng.toFixed(6)}`
                          : gpsStatus === "error"
                          ? "Unable to get location"
                          : "Getting location..."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        gpsStatus === "success"
                          ? "bg-green-100 text-green-800"
                          : gpsStatus === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {gpsStatus === "success"
                        ? "Connected"
                        : gpsStatus === "error"
                        ? "Offline"
                        : "Connecting..."}
                    </div>
                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={getGPSLocation}
                      disabled={isRefreshingGPS}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isRefreshingGPS ? "animate-spin" : ""
                        }`}
                      />
                    </PillButton>
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Survey Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ModernCard>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Survey Information
                    </h3>
                    <p className="text-gray-600">
                      Basic survey details and identification
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="surveyName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Survey Name *
                    </Label>
                    <Input
                      id="surveyName"
                      value={editFormData.surveyName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          surveyName: e.target.value,
                        })
                      }
                      placeholder="Enter descriptive survey name"
                      className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                      required
                    />
                  </div>

                  {editFormData.locationDetails ? (
                    <div>
                      <Label
                        htmlFor="locationDetails"
                        className="text-sm font-medium text-gray-700"
                      >
                        Location Details *
                      </Label>
                      <Input
                        id="locationdetails"
                        value={editFormData.locationDetails}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            locationDetails: e.target.value,
                          })
                        }
                        placeholder="Enter descriptive survey name"
                        className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                        required
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="division"
                          className="text-sm font-medium text-gray-700"
                        >
                          Division *
                        </Label>
                        <Select
                          value={editFormData.division}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              division: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                            <SelectValue placeholder="Select Division" />
                          </SelectTrigger>
                          <SelectContent>
                            {divisions.map((division) => (
                              <SelectItem key={division.id} value={division.id}>
                                {division.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="depot"
                          className="text-sm font-medium text-gray-700"
                        >
                          Depot Name *
                        </Label>
                        <Select
                          value={editFormData.depot}
                          onValueChange={(value) =>
                            setEditFormData({ ...editFormData, depot: value })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                            <SelectValue placeholder="Select Depot" />
                          </SelectTrigger>
                          <SelectContent>
                            {depots.map((depot) => (
                              <SelectItem key={depot.id} value={depot.id}>
                                {depot.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="busStation"
                          className="text-sm font-medium text-gray-700"
                        >
                          Bus Station *
                        </Label>
                        <Select
                          value={editFormData.busStation}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              busStation: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                            <SelectValue placeholder="Select Bus Station" />
                          </SelectTrigger>
                          <SelectContent>
                            {busStations.map((station) => (
                              <SelectItem key={station.id} value={station.id}>
                                {station.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="busStand"
                          className="text-sm font-medium text-gray-700"
                        >
                          Bus Stand *
                        </Label>
                        <Select
                          value={editFormData.busStand}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              busStand: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                            <SelectValue placeholder="Select Bus Stand" />
                          </SelectTrigger>
                          <SelectContent>
                            {busStands.map((stand) => (
                              <SelectItem key={stand.id} value={stand.id}>
                                {stand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </ModernCard>
            </motion.div>

            {/* Survey Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ModernCard>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Survey Details
                    </h3>
                    <p className="text-gray-600">
                      Camera specifications and installation requirements
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="surveyPurpose"
                        className="text-sm font-medium text-gray-700"
                      >
                        Survey Purpose *
                      </Label>
                      <Select
                        value={editFormData.surveyPurpose}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            surveyPurpose: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                          <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-installation">
                            New Installation
                          </SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance Survey
                          </SelectItem>
                          <SelectItem value="upgrade">
                            System Upgrade
                          </SelectItem>
                          <SelectItem value="relocation">
                            Camera Relocation
                          </SelectItem>
                          <SelectItem value="expansion">
                            Coverage Expansion
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="workStatus"
                        className="text-sm font-medium text-gray-700"
                      >
                        Work Status *
                      </Label>
                      <Select
                        value={editFormData.workStatus}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            workStatus: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="survey-initiated">
                            Survey Initiated
                          </SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="survey-completed">
                            Survey Completed
                          </SelectItem>
                          <SelectItem value="pending-approval">
                            Pending Approval
                          </SelectItem>
                          <SelectItem value="ready-for-installation">
                            Ready for Installation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-900">
                        Camera Details
                      </h4>
                      <PillButton
                        variant="secondary"
                        size="sm"
                        onClick={addCameraDetail}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Camera
                      </PillButton>
                    </div>
                    {editFormData.cameraDetails.map((camera, index) => (
                      <motion.div
                        key={camera.id || index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium text-gray-900">
                            Camera {index + 1}
                          </h5>
                          {editFormData.cameraDetails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCameraDetail(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Camera Type *
                            </Label>
                            <Select
                              value={camera.type}
                              onValueChange={(value) =>
                                updateCameraDetail(index, "type", value)
                              }
                            >
                              <SelectTrigger className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bullet">
                                  Bullet Camera
                                </SelectItem>
                                <SelectItem value="dome">
                                  Dome Camera
                                </SelectItem>
                                <SelectItem value="ptz">PTZ Camera</SelectItem>
                                <SelectItem value="anpr">
                                  ANPR Camera
                                </SelectItem>
                                <SelectItem value="thermal">
                                  Thermal Camera
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Direction/Angle *
                            </Label>
                            <Select
                              value={camera.direction}
                              onValueChange={(value) =>
                                updateCameraDetail(index, "direction", value)
                              }
                            >
                              <SelectTrigger className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl">
                                <SelectValue placeholder="Select Direction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="north">North</SelectItem>
                                <SelectItem value="south">South</SelectItem>
                                <SelectItem value="east">East</SelectItem>
                                <SelectItem value="west">West</SelectItem>
                                <SelectItem value="northeast">
                                  Northeast
                                </SelectItem>
                                <SelectItem value="northwest">
                                  Northwest
                                </SelectItem>
                                <SelectItem value="southeast">
                                  Southeast
                                </SelectItem>
                                <SelectItem value="southwest">
                                  Southwest
                                </SelectItem>
                                <SelectItem value="entrance">
                                  Main Entrance
                                </SelectItem>
                                <SelectItem value="exit">Exit Gate</SelectItem>
                                <SelectItem value="platform">
                                  Platform View
                                </SelectItem>
                                <SelectItem value="parking">
                                  Parking Area
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Serial Number
                            </Label>
                            <Input
                              value={camera.serialNumber}
                              onChange={(e) =>
                                updateCameraDetail(
                                  index,
                                  "serialNumber",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Pole Location *
                            </Label>
                            <Input
                              value={camera.poleLocation}
                              onChange={(e) =>
                                updateCameraDetail(
                                  index,
                                  "poleLocation",
                                  e.target.value
                                )
                              }
                              placeholder="Describe pole location"
                              className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Distance Between Cameras (meters)
                            </Label>
                            <Input
                              type="number"
                              value={camera.distanceBetweenCameras}
                              onChange={(e) =>
                                updateCameraDetail(
                                  index,
                                  "distanceBetweenCameras",
                                  e.target.value
                                )
                              }
                              placeholder="30"
                              className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              GPS Latitude
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              value={camera.gpsLatitude}
                              onChange={(e) =>
                                updateCameraDetail(
                                  index,
                                  "gpsLatitude",
                                  e.target.value
                                )
                              }
                              placeholder={
                                location?.lat.toString() || "Enter latitude"
                              }
                              className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              GPS Longitude
                            </Label>
                            <Input
                              type="number"
                              step="any"
                              value={camera.gpsLongitude}
                              onChange={(e) =>
                                updateCameraDetail(
                                  index,
                                  "gpsLongitude",
                                  e.target.value
                                )
                              }
                              placeholder={
                                location?.lng.toString() || "Enter longitude"
                              }
                              className="h-10 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                            />
                          </div>
                        </div>
                        {location && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Navigation className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Current GPS Location
                                </span>
                              </div>
                              <PillButton
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  applyCurrentLocationToCamera(index)
                                }
                              >
                                Use Current Location
                              </PillButton>
                            </div>
                            <p className="text-sm text-blue-600 mt-1">
                              Lat: {location.lat.toFixed(6)}, Lng:{" "}
                              {location.lng.toFixed(6)}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Photo Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ModernCard>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Photo Documentation
                    </h3>
                    <p className="text-gray-600">
                      Upload photos with GPS location data for comprehensive
                      documentation
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center hover:border-amber-400 transition-colors bg-amber-50/50">
                    <Upload className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">
                        Upload Survey Photos
                      </p>
                      <p className="text-sm text-gray-600">
                        Drag and drop files here, or use the button below
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-4">
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label
                        htmlFor="photo-upload"
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl hover:from-amber-500 hover:to-yellow-600 cursor-pointer transition-colors shadow-lg"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Label>
                    </div>
                  </div>

                  {existingPhotos.length > 0 || photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingPhotos.map((photoUrl, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={photoUrl}
                            alt={`Existing photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingPhotos(
                                existingPhotos.filter((_, i) => i !== index)
                              );
                              setEditFormData({
                                ...editFormData,
                                photos: editFormData.photos.filter(
                                  (_, i) => i !== index
                                ),
                              });
                              toast({
                                variant: "success",
                                title: "Photo Removed",
                                description: `Existing photo ${
                                  index + 1
                                } has been removed`,
                              });
                            }}
                            className="absolute top-2 right-2 bg-gray-800/50 text-white rounded-full p-1 hover:bg-gray-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {photos.map((photo, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={photo.name}
                            className="w-full h-32 object-cover rounded-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-gray-800/50 text-white rounded-full p-1 hover:bg-gray-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">
                        No photos available
                      </p>
                    </div>
                  )}
                </div>
              </ModernCard>
            </motion.div>

            {/* Notes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ModernCard>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Additional Notes
                    </h3>
                    <p className="text-gray-600">
                      Any additional information or specific requirements
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700"
                    >
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Enter any additional notes or requirements here"
                      className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                    />
                  </div>
                </div>
              </ModernCard>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-end space-x-3"
            >
              <PillButton variant="secondary" onClick={handleCloseEdit}>
                Cancel
              </PillButton>
              <PillButton
                variant="primary"
                size="lg"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </PillButton>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
