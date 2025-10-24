"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ArrowLeft, ClipboardList, FileText, X, Wrench } from "lucide-react";
import { Spin, Modal, Input, Switch, Select, DatePicker, message } from "antd";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

export default function LocationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [location, setLocation] = useState<any>(null);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧾 Survey Form
  const [surveyForm, setSurveyForm] = useState({
    Power_Available: false,
    Network_Available: false,
    site_condition: "Good",
    GPS_Latitude: "",
    GPS_Longitude: "",
    Remarks: "",
    survey_date: dayjs(),
    photos: [] as File[],
    airtel_signal: 0,
    jio_signal: 0,
  });

  const [boqs, setBoqs] = useState<any[]>([]);

  // 🔹 Fetch BOQs for this location
  const fetchBoqs = async () => {
    try {
      const res = await api.get(
        `/boqs?filters[location][documentId][$eq]=${id}&populate=location`
      );
      setBoqs(res.data.data);
    } catch (err) {
      console.error("Error fetching BOQs:", err);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([fetchLocation(), fetchSurveys(), fetchBoqs()]).finally(() =>
        setLoading(false)
      );
    }
  }, [id]);

  // 🧰 BOQ Form
  const [boqForm, setBoqForm] = useState({
    kits_required: "",
    additional_requirements: "",
    Remarks: "",
  });

  // 🔹 Fetch location details
  const fetchLocation = async () => {
    try {
      const res = await api.get(
        `/locations/${id}?populate=assembly&populate=boqs`
      );
      setLocation(res.data.data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch location details.",
      });
    }
  };

  // 🔹 Fetch surveys for this location
  const fetchSurveys = async () => {
    try {
      const res = await api.get(
        `/surveys?filters[Booth][documentId][$eq]=${id}&populate=raised_by`
      );
      setSurveys(res.data.data);
    } catch (err) {
      console.error("Error fetching surveys:", err);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([fetchLocation(), fetchSurveys()]).finally(() =>
        setLoading(false)
      );
    }
  }, [id]);

  // 📍 Get current location
  const getCurrentGPS = () => {
    if (!navigator.geolocation) {
      message.error("Your browser does not support GPS.");
      return;
    }
    message.info("Fetching current GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSurveyForm({
          ...surveyForm,
          GPS_Latitude: pos.coords.latitude.toFixed(6),
          GPS_Longitude: pos.coords.longitude.toFixed(6),
        });
        message.success("GPS fetched successfully!");
      },
      (err) => {
        console.error(err);
        message.error("Failed to fetch GPS. Please allow permission.");
      }
    );
  };

  // 🧾 Submit Survey
  const handleSurveySubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = 1; // later replace with logged-in user

      let uploadedPhotoIds: number[] = [];

      // 1️⃣ Upload photos (if any)
      if (surveyForm.photos.length > 0) {
        const formData = new FormData();
        surveyForm.photos.forEach((file) => formData.append("files", file));

        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedPhotoIds = uploadRes.data.map((img: any) => img.id);
      }

      // 2️⃣ Create survey entry
      await api.post("/surveys", {
        data: {
          Booth: id,
          Power_Available: surveyForm.Power_Available,
          Network_Available: surveyForm.Network_Available,
          site_condition: surveyForm.site_condition,
          GPS_Latitude: parseFloat(surveyForm.GPS_Latitude) || null,
          GPS_Longitude: parseFloat(surveyForm.GPS_Longitude) || null,
          survey_date: surveyForm.survey_date.toISOString(),
          Remarks: surveyForm.Remarks,
          raised_by: userId,
          Photos: uploadedPhotoIds,
          airtel_signal: surveyForm.airtel_signal,
          jio_signal: surveyForm.jio_signal,
        },
      });

      toast({
        variant: "success",
        title: "Survey Created",
        description: `Survey created successfully for ${location.PS_Name}.`,
      });

      setIsSurveyModalOpen(false);
      fetchSurveys(); // refresh list
    } catch (err) {
      console.error("Survey submit error:", err);
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not create survey. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧰 Submit BOQ
  const handleBoqSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/boqs", {
        data: {
          location: id,
          kits_required: boqForm.kits_required,
          additional_requirements: boqForm.additional_requirements,
          Remarks: boqForm.Remarks,
          state: "Pending",
        },
      });

      toast({
        variant: "success",
        title: "BOQ Raised",
        description: "BOQ raised successfully for this site.",
      });
      setIsBoqModalOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not raise BOQ. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (!location)
    return (
      <div className="p-6 text-center text-gray-600">Location not found.</div>
    );

  const { PS_Name, PS_No, PS_Location, assembly } = location;

  const hasSurvey = surveys.length > 0; // check if survey already exists

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="w-full mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Back Button */}
        <div className="flex items-center space-x-2 mb-6">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800 ml-4">
            Location Details
          </h2>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
          <div>
            <p className="font-semibold">PS Name:</p>
            <p>{PS_Name}</p>
          </div>
          <div>
            <p className="font-semibold">PS No:</p>
            <p>{PS_No}</p>
          </div>
          <div>
            <p className="font-semibold">Village:</p>
            <p>{PS_Location || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">Assembly:</p>
            <p>{assembly?.Assembly_Name || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">District:</p>
            <p>{assembly?.Election_District || "—"}</p>
          </div>
          <div>
            <p className="font-semibold">State:</p>
            <p>{assembly?.State || "—"}</p>
          </div>
        </div>

        {/* 🏛️ Assembly Details */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Assembly (LAC) Details
          </h3>

          {assembly ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
              <div>
                <p className="font-semibold">Assembly No:</p>
                <p>{assembly.Assembly_No || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">Assembly Name:</p>
                <p>{assembly.Assembly_Name || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">Election District:</p>
                <p>{assembly.Election_District || "—"}</p>
              </div>
              <div>
                <p className="font-semibold">State:</p>
                <p>{assembly.State || "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No assembly information available.
            </p>
          )}
        </div>

        {/* 🎥 Camera Details */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Camera Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
            <div>
              <p className="font-semibold">IN Camera:</p>
              <p>{location.IN_Camera || "Not Assigned"}</p>
            </div>
            <div>
              <p className="font-semibold">OUT Camera:</p>
              <p>{location.OUT_CAMERA || "Not Assigned"}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-10">
          {!hasSurvey && (
            <Button
              onClick={() => setIsSurveyModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Raise Survey</span>
            </Button>
          )}

          <Button
            onClick={() => setIsBoqModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Raise BOQ</span>
          </Button>
        </div>

        {/* 🧾 Survey Details */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Survey Details
          </h3>
          {surveys.length === 0 ? (
            <p className="text-gray-500 italic">
              No surveys raised yet for this location.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-gray-800 font-semibold text-left">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Survey Date</th>
                    <th className="px-4 py-2">Condition</th>
                    <th className="px-4 py-2">Power</th>
                    <th className="px-4 py-2">Network</th>
                    <th className="px-4 py-2">Airtel Signal</th>
                    <th className="px-4 py-2">Jio Signal</th>
                    <th className="px-4 py-2">Remarks</th>
                    <th className="px-4 py-2">Raised By</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((s, i) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">
                        {new Date(s.survey_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{s.site_condition}</td>
                      <td className="px-4 py-2">
                        {s.Power_Available ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {s.Network_Available ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`inline-block w-3 h-3 rounded-full mr-1 ${
                              i <= s.airtel_signal
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </td>
                      <td className="px-4 py-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`inline-block w-3 h-3 rounded-full mr-1 ${
                              i <= s.jio_signal ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </td>

                      <td className="px-4 py-2">{s.Remarks}</td>
                      <td className="px-4 py-2">
                        {s.raised_by?.username || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🧰 BOQ Details */}
        {/* 🧰 BOQ Details */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            BOQ Details
          </h3>

          {boqs.length === 0 ? (
            <p className="text-gray-500 italic">
              No BOQs raised yet for this location.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm border-collapse">
                <tbody>
                  {location.boqs?.length ? (
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-amber-100 text-gray-800 font-semibold text-left">
                          <th className="px-4 py-2">#</th>
                          <th className="px-4 py-2">Kits Required</th>
                          <th className="px-4 py-2">Additional Requirements</th>
                          <th className="px-4 py-2">Remarks</th>
                          <th className="px-4 py-2">State</th>
                          <th className="px-4 py-2">Created On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {location.boqs.map((boq, index) => (
                          <tr
                            key={boq.id}
                            className="border-b hover:bg-gray-50 text-gray-700"
                          >
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">
                              {boq.kits_required || "—"}
                            </td>
                            <td className="px-4 py-2">
                              {boq.additional_requirements || "—"}
                            </td>
                            <td className="px-4 py-2">{boq.Remarks || "—"}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  boq.state === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : boq.state === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : boq.state === "Completed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {boq.state || "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {new Date(boq.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 italic">
                      No BOQs raised yet for this location.
                    </p>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🧾 Survey Modal */}
      <Modal
        title="Raise Survey"
        open={isSurveyModalOpen}
        onCancel={() => setIsSurveyModalOpen(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Power Available</span>
            <Switch
              checked={surveyForm.Power_Available}
              onChange={(val) =>
                setSurveyForm({ ...surveyForm, Power_Available: val })
              }
            />
          </div>

          <div className="flex justify-between">
            <span>Network Available</span>
            <Switch
              checked={surveyForm.Network_Available}
              onChange={(val) =>
                setSurveyForm({ ...surveyForm, Network_Available: val })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Site Condition
            </label>
            <Select
              style={{ width: "100%" }}
              value={surveyForm.site_condition}
              onChange={(val) =>
                setSurveyForm({ ...surveyForm, site_condition: val })
              }
            >
              <Select.Option value="Good">Good</Select.Option>
              <Select.Option value="Average">Average</Select.Option>
              <Select.Option value="Poor">Poor</Select.Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              📶 Mobile Network Signal Strength
            </label>
            <div className="space-y-3">
              {["Airtel", "Jio"].map((provider) => (
                <div
                  key={provider}
                  className="flex items-center justify-between border rounded-md px-3 py-2"
                >
                  <span className="font-medium text-gray-700">{provider}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        onClick={() =>
                          setSurveyForm({
                            ...surveyForm,
                            [`${provider.toLowerCase()}_signal`]: level,
                          })
                        }
                        className={`w-4 h-4 cursor-pointer rounded-sm ${
                          level <=
                          surveyForm[`${provider.toLowerCase()}_signal`]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">
                GPS Latitude
              </label>
              <Input
                placeholder="Enter latitude"
                value={surveyForm.GPS_Latitude}
                onChange={(e) =>
                  setSurveyForm({
                    ...surveyForm,
                    GPS_Latitude: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                GPS Longitude
              </label>
              <Input
                placeholder="Enter longitude"
                value={surveyForm.GPS_Longitude}
                onChange={(e) =>
                  setSurveyForm({
                    ...surveyForm,
                    GPS_Longitude: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-2 flex justify-end mt-2">
              <Button
                onClick={getCurrentGPS}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Get Current Location
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Photos
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || []);
                setSurveyForm({
                  ...surveyForm,
                  photos: [...surveyForm.photos, ...newFiles],
                });
              }}
            />

            {/* Preview Section */}
            {surveyForm.photos?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {surveyForm.photos.map((file: any, i: number) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`photo-${i}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = surveyForm.photos.filter(
                          (_: any, idx: number) => idx !== i
                        );
                        setSurveyForm({ ...surveyForm, photos: updated });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <Input.TextArea
              rows={3}
              placeholder="Enter remarks"
              value={surveyForm.Remarks}
              onChange={(e) =>
                setSurveyForm({ ...surveyForm, Remarks: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsSurveyModalOpen(false)}
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              onClick={handleSurveySubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 🧰 BOQ Modal */}
      <Modal
        title="Raise BOQ"
        open={isBoqModalOpen}
        onCancel={() => setIsBoqModalOpen(false)}
        footer={null}
        centered
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Kits Required
            </label>
            <Input
              placeholder="Enter number or type of kits required"
              value={boqForm.kits_required}
              onChange={(e) =>
                setBoqForm({ ...boqForm, kits_required: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Requirements
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Describe any extra requirements"
              value={boqForm.additional_requirements}
              onChange={(e) =>
                setBoqForm({
                  ...boqForm,
                  additional_requirements: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <Input.TextArea
              rows={3}
              placeholder="Add any remarks for BOQ"
              value={boqForm.Remarks}
              onChange={(e) =>
                setBoqForm({ ...boqForm, Remarks: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsBoqModalOpen(false)}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button
              onClick={handleBoqSubmit}
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit BOQ"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
