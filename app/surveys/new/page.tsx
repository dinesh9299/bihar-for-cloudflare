"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  MapPin,
  Camera,
  Upload,
  Navigation,
  ImageIcon,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

interface FormData {
  surveyName: string;
  division: string;
  depot: string;
  busStation: string;
  busStand: string;
  surveyPurpose: string;
  cameraDetails: {
    type: string;
    serialNumber: string;
    poleLocation: string;
    distanceBetweenCameras: string;
    direction: string;
    gpsLatitude: string;
    gpsLongitude: string;
  }[];
  workStatus: string;
  notes: string;
}

export default function NewSurvey() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [gpsStatus, setGpsStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    surveyName: "",
    division: "",
    depot: "",
    busStation: "",
    busStand: "",
    surveyPurpose: "",
    cameraDetails: [], // <-- start empty
    workStatus: "",
    notes: "",
  });

  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [depots, setDepots] = useState<
    { id: string; name: string; division: string }[]
  >([]);
  const [busStations, setBusStations] = useState<
    { id: string; name: string; depot: string }[]
  >([]);
  const [busStands, setBusStands] = useState<
    { id: string; name: string; busStation: string }[]
  >([]);

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
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
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

  useEffect(() => {
    getGPSLocation();
  }, []);

  useEffect(() => {
    axios.get("http://localhost:1337/api/divisions").then((res) => {
      setDivisions(
        res.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
        }))
      );
    });
    axios.get("http://localhost:1337/api/depots?populate=*").then((res) => {
      setDepots(
        res.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          division: d.division?.id?.toString() || "",
        }))
      );
    });
    axios
      .get("http://localhost:1337/api/bus-stations?populate=*")
      .then((res) => {
        setBusStations(
          res.data.data.map((d: any) => ({
            id: d.id.toString(),
            name: d.name,
            depot: d.depot?.id?.toString() || "",
          }))
        );
      });
    axios.get("http://localhost:1337/api/bus-stands?populate=*").then((res) => {
      setBusStands(
        res.data.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          busStation: d.bus_station?.id?.toString() || "",
        }))
      );
    });
  }, []);

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

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const newFiles = Array.from(target.files);
        setPhotos([...photos, ...newFiles]);

        toast({
          variant: "success",
          title: "Photo Captured",
          description: "Photo captured and added to survey",
        });
      }
    };
    input.click();
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
    setFormData({
      ...formData,
      cameraDetails: [
        ...formData.cameraDetails,
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
    setFormData({
      ...formData,
      cameraDetails: formData.cameraDetails.filter((_, i) => i !== index),
    });

    toast({
      variant: "success",
      title: "Camera Removed",
      description: `Camera ${index + 1} details removed`,
    });
  };

  const updateCameraDetail = (index: number, field: string, value: string) => {
    const updatedDetails = [...formData.cameraDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData({ ...formData, cameraDetails: updatedDetails });
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

  const handleSaveDraft = () => {
    try {
      // Save to localStorage
      localStorage.setItem(
        "survey_draft",
        JSON.stringify({
          ...formData,
          location,
          photos: photos.map((p) => p.name),
        })
      );

      toast({
        variant: "success",
        title: "Draft Saved",
        description: "Survey draft has been saved locally",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.surveyName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Survey name is required",
      });
      return;
    }

    if (
      !formData.division ||
      !formData.depot ||
      !formData.busStation ||
      !formData.busStand
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All location fields are required",
      });
      return;
    }

    if (!formData.surveyPurpose || !formData.workStatus) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Survey purpose and work status are required",
      });
      return;
    }

    if (
      formData.cameraDetails.some(
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
          "GPS location is not available. Survey will be submitted without GPS data.",
      });
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photos to Strapi
      let photoIds: number[] = [];
      if (photos.length > 0) {
        const form = new FormData();
        photos.forEach((file) => form.append("files", file));
        const uploadRes = await axios.post(
          "http://localhost:1337/api/upload",
          form
        );
        photoIds = uploadRes.data.map((img: any) => img.id);
      }

      // 2. Prepare survey payload
      const payload = {
        data: {
          surveyName: formData.surveyName,
          surveyPurpose: formData.surveyPurpose,
          workStatus: formData.workStatus,
          notes: formData.notes,
          division: Number(formData.division),
          depot: Number(formData.depot),
          bus_station: Number(formData.busStation),
          bus_stand: Number(formData.busStand),
          cameraDetails: formData.cameraDetails,
          photos: photoIds,
        },
      };

      // 3. Submit survey to Strapi
      await axios.post("http://localhost:1337/api/surveys", payload);

      localStorage.removeItem("survey_draft");

      toast({
        variant: "success",
        title: "Survey Added Successfully",
        description: `${formData.surveyName} has been created and saved to your survey list`,
      });

      setTimeout(() => {
        router.push("/surveys");
      }, 1500);
    } catch (error) {
      console.log(error.response?.data); // See error details
      toast({
        variant: "destructive",
        title: "Failed to Create Survey",
        description:
          "Unable to save survey. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="New Site Survey"
            subtitle="Create comprehensive CCTV installation survey"
            showGPS={true}
            gpsStatus={gpsStatus === "success" ? "connected" : "disconnected"}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
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

                {/* Survey Basic Information */}
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
                          value={formData.surveyName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surveyName: e.target.value,
                            })
                          }
                          placeholder="Enter descriptive survey name (e.g., Central Terminal Security Survey)"
                          className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="division"
                            className="text-sm font-medium text-gray-700"
                          >
                            Division *
                          </Label>
                          <Select
                            value={formData.division}
                            onValueChange={(value) =>
                              setFormData({ ...formData, division: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                              <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                            <SelectContent>
                              {divisions.map((division) => (
                                <SelectItem
                                  key={division.id}
                                  value={division.id}
                                >
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
                            value={formData.depot}
                            onValueChange={(value) =>
                              setFormData({ ...formData, depot: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                              <SelectValue placeholder="Select Depot" />
                            </SelectTrigger>
                            <SelectContent>
                              {depots
                                // .filter(
                                //   (depot) =>
                                //     depot.division === formData.division
                                // )
                                .map((depot) => (
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
                            value={formData.busStation}
                            onValueChange={(value) =>
                              setFormData({ ...formData, busStation: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                              <SelectValue placeholder="Select Bus Station" />
                            </SelectTrigger>
                            <SelectContent>
                              {busStations
                                // .filter(
                                //   (station) => station.depot === formData.depot
                                // )
                                .map((station) => (
                                  <SelectItem
                                    key={station.id}
                                    value={station.id}
                                  >
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
                            value={formData.busStand}
                            onValueChange={(value) =>
                              setFormData({ ...formData, busStand: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                              <SelectValue placeholder="Select Bus Stand" />
                            </SelectTrigger>
                            <SelectContent>
                              {busStands
                                // .filter(
                                //   (stand) =>
                                //     stand.busStation === formData.busStation
                                // )
                                .map((stand) => (
                                  <SelectItem key={stand.id} value={stand.id}>
                                    {stand.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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
                            value={formData.surveyPurpose}
                            onValueChange={(value) =>
                              setFormData({ ...formData, surveyPurpose: value })
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
                            value={formData.workStatus}
                            onValueChange={(value) =>
                              setFormData({ ...formData, workStatus: value })
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

                      {/* Camera Details Section */}
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

                        {formData.cameraDetails.map((camera, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium text-gray-900">
                                Camera {index + 1}
                              </h5>
                              {formData.cameraDetails.length > 1 && (
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
                                    <SelectItem value="ptz">
                                      PTZ Camera
                                    </SelectItem>
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
                                    updateCameraDetail(
                                      index,
                                      "direction",
                                      value
                                    )
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
                                    <SelectItem value="exit">
                                      Exit Gate
                                    </SelectItem>
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
                                    location?.lng.toString() ||
                                    "Enter longitude"
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
                            Drag and drop files here, or use the buttons below
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
                          <PillButton
                            variant="secondary"
                            size="lg"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Creating Survey..."
                              : "Create Survey"}
                          </PillButton>
                        </div>
                      </div>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={
                                  URL.createObjectURL(photo) ||
                                  "/placeholder.svg"
                                }
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
                        {/* You can replace this with a notes icon if you have one */}
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
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
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
                  className="flex justify-between"
                >
                  <PillButton variant="secondary" onClick={handleSaveDraft}>
                    Save as Draft
                  </PillButton>
                  <PillButton
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Survey..." : "Create Survey"}
                  </PillButton>
                </motion.div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
