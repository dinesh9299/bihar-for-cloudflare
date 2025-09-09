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
  locationType: string;
  division?: string; // Optional for MSRTC
  depot?: string; // Optional for MSRTC
  busStation?: string; // Optional for MSRTC
  busStand?: string; // Optional for MSRTC
  locationDetails?: string; // Optional for non-MSRTC
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
    locationType: "",
    surveyPurpose: "",
    cameraDetails: [],
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
            description: `${position.coords.latitude.toFixed(
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
            description: "Unable to get your current location.",
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
      });
    }
  };

  useEffect(() => {
    getGPSLocation();
    axios.get("http://localhost:1337/api/divisions").then((res) => {
      setDivisions(
        res.data.data.map((d: any) => ({ id: d.id.toString(), name: d.name }))
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
      const busStandsData = res.data.data.map((d: any) => ({
        id: d.id.toString(),
        name: d.name,
        busStation: d.bus_stations?.[0]?.id?.toString() || "",
      }));
      console.log("Fetched busStands:", busStandsData);
      setBusStands(busStandsData);
    });
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);
      toast({
        variant: "success",
        title: "Photos Uploaded",
        description: `${newFiles.length} photo(s) added`,
      });
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      if ((e.target as HTMLInputElement).files) {
        const newFiles = Array.from((e.target as HTMLInputElement).files);
        setPhotos([...photos, ...newFiles]);
        toast({ variant: "success", title: "Photo Captured" });
      }
    };
    input.click();
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    toast({ variant: "success", title: "Photo Removed" });
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
    toast({ variant: "success", title: "Camera Added" });
  };

  const removeCameraDetail = (index: number) => {
    setFormData({
      ...formData,
      cameraDetails: formData.cameraDetails.filter((_, i) => i !== index),
    });
    toast({ variant: "success", title: "Camera Removed" });
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
      toast({ variant: "success", title: "GPS Applied" });
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      "survey_draft",
      JSON.stringify({
        ...formData,
        location,
        photos: photos.map((p) => p.name),
      })
    );
    toast({ variant: "success", title: "Draft Saved" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.surveyName || !formData.locationType) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Survey name and location type are required",
      });
      return;
    }
    if (formData.locationType === "MSRTC") {
      if (
        !formData.division ||
        !formData.depot ||
        !formData.busStation ||
        !formData.busStand
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "All MSRTC location fields are required",
        });
        return;
      }
    } else if (!formData.locationDetails) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Location details are required",
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
        description: "Camera type and pole location are required",
      });
      return;
    }

    setIsSubmitting(true);

    try {
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

      const payload = {
        data: {
          surveyName: formData.surveyName,
          surveyPurpose: formData.surveyPurpose,
          workStatus: formData.workStatus,
          notes: formData.notes,
          ...(formData.locationType === "MSRTC"
            ? {
                division: Number(formData.division),
                depot: Number(formData.depot),
                bus_station: Number(formData.busStation),
                bus_stand: Number(formData.busStand),
              }
            : { locationDetails: formData.locationDetails }),
          cameraDetails: formData.cameraDetails,
          photos: photoIds,
        },
      };

      await axios.post("http://localhost:1337/api/surveys", payload);
      localStorage.removeItem("survey_draft");
      toast({
        variant: "success",
        title: "Survey Added Successfully",
        description: `${formData.surveyName} saved`,
      });
      setTimeout(() => router.push("/surveys"), 1500);
    } catch (error) {
      console.log(error.response?.data);
      toast({ variant: "destructive", title: "Failed to Create Survey" });
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
            subtitle="Create a survey"
            showGPS={true}
            gpsStatus={gpsStatus === "success" ? "connected" : "disconnected"}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ModernCard>
                    <div className="flex items-center space-x-3 mb-6">
                      <MapPin className="w-5 h-5 text-white bg-blue-600 rounded-2xl p-2" />
                      <div>
                        <h3 className="text-xl font-bold">
                          Survey Information
                        </h3>
                        <p className="text-gray-600">Basic survey details</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="surveyName">Survey Name *</Label>
                        <Input
                          id="surveyName"
                          value={formData.surveyName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surveyName: e.target.value,
                            })
                          }
                          placeholder="Enter survey name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationType">Location Type *</Label>
                        <Select
                          value={formData.locationType}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              locationType: value,
                              division: undefined,
                              depot: undefined,
                              busStation: undefined,
                              busStand: undefined,
                              locationDetails: undefined,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                            <SelectValue placeholder="Select Location Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MSRTC">MSRTC</SelectItem>
                            <SelectItem value="mall">Mall</SelectItem>
                            <SelectItem value="industry">Industry</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="shop">Shop</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.locationType === "MSRTC" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="division">Division *</Label>
                            <Select
                              value={formData.division || ""}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  division: value,
                                  depot: undefined,
                                  busStation: undefined,
                                  busStand: undefined,
                                })
                              }
                              disabled={!formData.locationType}
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
                            <Label htmlFor="depot">Depot Name *</Label>
                            <Select
                              value={formData.depot || ""}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  depot: value,
                                  busStation: undefined,
                                  busStand: undefined,
                                })
                              }
                              disabled={!formData.division}
                            >
                              <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                                <SelectValue placeholder="Select Depot" />
                              </SelectTrigger>
                              <SelectContent>
                                {depots
                                  .filter(
                                    (depot) =>
                                      depot.division === formData.division
                                  )
                                  .map((depot) => (
                                    <SelectItem key={depot.id} value={depot.id}>
                                      {depot.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="busStation">Bus Station *</Label>
                            <Select
                              value={formData.busStation || ""}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  busStation: value,
                                  busStand: undefined,
                                })
                              }
                              disabled={!formData.depot}
                            >
                              <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                                <SelectValue placeholder="Select Bus Station" />
                              </SelectTrigger>
                              <SelectContent>
                                {busStations
                                  .filter(
                                    (station) =>
                                      station.depot === formData.depot
                                  )
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
                            <Label htmlFor="busStand">Bus Stand *</Label>
                            <Select
                              value={formData.busStand || ""}
                              onValueChange={(value) =>
                                setFormData({ ...formData, busStand: value })
                              }
                              disabled={!formData.busStation}
                            >
                              <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl">
                                <SelectValue placeholder="Select Bus Stand" />
                              </SelectTrigger>
                              <SelectContent>
                                {busStands
                                  .filter(
                                    (stand) =>
                                      stand.busStation === formData.busStation
                                  )
                                  .map((stand) => (
                                    <SelectItem key={stand.id} value={stand.id}>
                                      {stand.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : formData.locationType ? (
                        <div className="space-y-2">
                          <Label htmlFor="locationDetails">
                            Location Details *
                          </Label>
                          <Input
                            id="locationDetails"
                            value={formData.locationDetails || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                locationDetails: e.target.value,
                              })
                            }
                            placeholder="Enter location details (e.g., address or name)"
                            className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                            required
                          />
                        </div>
                      ) : null}
                    </div>
                  </ModernCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ModernCard>
                    <div className="flex items-center space-x-3 mb-6">
                      <Camera className="w-5 h-5 text-white bg-purple-600 rounded-2xl p-2" />
                      <div>
                        <h3 className="text-xl font-bold">Survey Details</h3>
                        <p className="text-gray-600">Camera specifications</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="surveyPurpose">
                            Survey Purpose *
                          </Label>
                          <Select
                            value={formData.surveyPurpose}
                            onValueChange={(value) =>
                              setFormData({ ...formData, surveyPurpose: value })
                            }
                            className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new-installation">
                                New Installation
                              </SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="upgrade">Upgrade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workStatus">Work Status *</Label>
                          <Select
                            value={formData.workStatus}
                            onValueChange={(value) =>
                              setFormData({ ...formData, workStatus: value })
                            }
                            className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-2xl"
                          >
                            <SelectTrigger>
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
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold">Camera Details</h4>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={addCameraDetail}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Camera
                          </PillButton>
                        </div>
                        {formData.cameraDetails.map((camera, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 bg-white/50 border rounded-2xl"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium">
                                Camera {index + 1}
                              </h5>
                              {formData.cameraDetails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCameraDetail(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Camera Type *</Label>
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
                                      Bullet
                                    </SelectItem>
                                    <SelectItem value="dome">Dome</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Serial Number</Label>
                                <Input
                                  value={camera.serialNumber}
                                  onChange={(e) =>
                                    updateCameraDetail(
                                      index,
                                      "serialNumber",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter serial number"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Pole Location *</Label>
                                <Input
                                  value={camera.poleLocation}
                                  onChange={(e) =>
                                    updateCameraDetail(
                                      index,
                                      "poleLocation",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter location"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Distance Between Cameras (meters)</Label>
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
                                  placeholder="Enter distance"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Direction</Label>
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
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>GPS Latitude</Label>
                                <Input
                                  type="number"
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
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>GPS Longitude</Label>
                                <Input
                                  type="number"
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
                                />
                              </div>
                            </div>
                            {location && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span>
                                      Current GPS: {location.lat.toFixed(6)},{" "}
                                      {location.lng.toFixed(6)}
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
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ModernCard>
                    <div className="flex items-center space-x-3 mb-6">
                      <ImageIcon className="w-5 h-5 text-white bg-green-600 rounded-2xl p-2" />
                      <div>
                        <h3 className="text-xl font-bold">
                          Photo Documentation
                        </h3>
                        <p className="text-gray-600">Upload photos</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center">
                        <Upload className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium">Upload Photos</p>
                          <p className="text-sm text-gray-600">
                            Drag and drop or use the button
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
                            className="inline-flex items-center justify-center px-6 py-3 text-white bg-amber-500 rounded-2xl hover:bg-amber-600 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" /> Choose Files
                          </Label>
                        </div>
                      </div>
                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={photo.name}
                                className="w-full h-32 object-cover rounded-2xl"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-gray-800/50 text-white rounded-full p-1"
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ModernCard>
                    <div className="flex items-center space-x-3 mb-6">
                      <ImageIcon className="w-5 h-5 text-white bg-gray-600 rounded-2xl p-2" />
                      <div>
                        <h3 className="text-xl font-bold">Additional Notes</h3>
                        <p className="text-gray-600">Add notes</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Enter notes"
                        />
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
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
