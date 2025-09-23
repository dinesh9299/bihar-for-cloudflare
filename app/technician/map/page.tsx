"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_MAPS_CONFIG } from "@/lib/google-maps-config";
import axios from "axios";
import Script from "next/script";
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPinPlus,
  X,
  Filter,
  Crosshair,
  MapIcon,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// Google Maps types
declare global {
  interface Window {
    google: any;
    googleMapsLoaded?: boolean;
    initMap?: () => void;
  }
}

interface CameraDetail {
  id: number;
  type: string;
  serialNumber: string;
  poleLocation: string;
  distanceBetweenCameras: string;
  direction: string;
  gpsLatitude: string;
  gpsLongitude: string;
}

interface Survey {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  surveyName: string;
  surveyPurpose: string;
  workStatus: string;
  notes: string;
  locationDetails: string | null;
  cameraDetails: CameraDetail[];
  division?: {
    id: number;
    documentId: string;
    name: string;
  };
  depot?: {
    id: number;
    documentId: string;
    name: string;
  };
  bus_station?: {
    id: number;
    documentId: string;
    name: string;
    address: string | null;
    latitude: string;
    longitude: string;
  };
  bus_stand?: {
    id: number;
    documentId: string;
    name: string;
  };
}

export default function MapPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const { toast } = useToast();
  const router = useRouter();

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps || !mapRef.current || mapLoaded) {
      console.log("Map initialization skipped:", {
        google: !!window.google,
        maps: !!window.google?.maps,
        mapRef: !!mapRef.current,
        mapLoaded,
      });
      return;
    }

    console.log("Initializing Google Maps");
    const map = new window.google.maps.Map(
      mapRef.current,
      GOOGLE_MAPS_CONFIG.mapOptions
    );
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    getCurrentLocation(map);
    setMapLoaded(true);
    setIsLoading(false);
    toast({
      title: "Map Loaded",
      description: "Google Maps has been successfully loaded",
    });
  }, [mapLoaded, toast]);

  // Handle Google Maps script loading
  const handleGoogleMapsLoad = useCallback(() => {
    console.log("Google Maps script loaded successfully");
    window.googleMapsLoaded = true;
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("tokenExpiration");
    const currentTime = Date.now();

    if (!token || (expirationTime && currentTime > parseInt(expirationTime))) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });
      router.push("/");
      return;
    }
  }, []);

  // Handle Google Maps script error
  const handleGoogleMapsError = useCallback(() => {
    console.error("Failed to load Google Maps script");
    toast({
      title: "Map Loading Error",
      description:
        "Failed to load Google Maps. Please check your internet connection or API key.",
      variant: "destructive",
    });
    setIsLoading(false);
  }, [toast]);

  // Set up global initMap callback
  useEffect(() => {
    window.initMap = () => {
      console.log("initMap callback triggered");
      handleGoogleMapsLoad();
    };

    return () => {
      window.initMap = undefined;
    };
  }, [handleGoogleMapsLoad]);

  // Retry mechanism for map initialization
  useEffect(() => {
    if (!mapLoaded && window.google && window.google.maps) {
      initializeMap();
    }

    if (!mapLoaded && !window.google) {
      const retry = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log("Retry mechanism: Google Maps loaded");
          initializeMap();
          clearInterval(retry);
        }
      }, 500);

      return () => clearInterval(retry);
    }
  }, [mapLoaded, initializeMap]);

  // Get current location
  const getCurrentLocation = useCallback(
    (map: any) => {
      if (
        !window.google ||
        !window.google.maps ||
        !navigator.geolocation ||
        userLocation
      ) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(pos);

          const userMarker = new window.google.maps.Marker({
            position: pos,
            map: map,
            title: "Your Location",
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" strokeWidth="4"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                  <circle cx="20" cy="20" r="4" fill="#3B82F6"/>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            },
          });

          markersRef.current.push(userMarker);

          toast({
            title: "Location Found",
            description: "Your current location has been marked on the map",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive",
          });
        }
      );
    },
    [userLocation, toast]
  );

  // Add markers to map
  const addMarkersToMap = useCallback(
    (map: any) => {
      if (!window.google || !window.google.maps) {
        console.warn("Google Maps API not loaded, cannot add markers");
        return;
      }

      const existingMarkers = new Map(
        markersRef.current.map((marker) => [
          `${marker.getPosition().lat()}:${marker.getPosition().lng()}`,
          marker,
        ])
      );

      markersRef.current.forEach((marker) => {
        const key = `${marker.getPosition().lat()}:${marker
          .getPosition()
          .lng()}`;
        if (
          !filteredSurveys.some(
            (survey) =>
              survey.cameraDetails[0] &&
              parseFloat(survey.cameraDetails[0].gpsLatitude) ===
                marker.getPosition().lat() &&
              parseFloat(survey.cameraDetails[0].gpsLongitude) ===
                marker.getPosition().lng()
          )
        ) {
          marker.setMap(null);
          existingMarkers.delete(key);
        }
      });

      filteredSurveys.forEach((survey) => {
        const station = survey.bus_station;

        if (
          !station ||
          !station.latitude ||
          !station.longitude ||
          isNaN(parseFloat(station.latitude)) ||
          isNaN(parseFloat(station.longitude))
        ) {
          console.warn(`Invalid coordinates for survey ${survey.surveyName}`);
          return;
        }

        const coordinates = {
          lat: parseFloat(station.latitude),
          lng: parseFloat(station.longitude),
        };
        const key = `${coordinates.lat}:${coordinates.lng}`;

        if (!existingMarkers.has(key)) {
          const marker = new window.google.maps.Marker({
            position: coordinates,
            map: map,
            title: survey.surveyName,
            icon: {
              url: getMarkerIcon(
                mapWorkStatusToFilter(
                  survey.workStatus.toLowerCase().replace(" ", "-")
                )
              ),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            },
          });

          marker.addListener("click", () => {
            setSelectedSurvey(survey);
            infoWindowRef.current.setContent(`
        <div style="max-width: 300px; padding: 12px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
            ${survey.surveyName}
          </h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            ${station.address || "No address"}
          </p>
        </div>
      `);
            infoWindowRef.current.open(map, marker);
            map.panTo(coordinates);
            map.setZoom(15);
          });

          markersRef.current.push(marker);
        }
      });
    },
    [filteredSurveys]
  );

  // Fetch surveys
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await api.get("/surveys?populate=*");

        const surveysData = response.data.data.map((survey: any) => ({
          id: survey.id,
          documentId: survey.documentId,
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt,
          publishedAt: survey.publishedAt,
          surveyName: survey.surveyName || "Unnamed Survey",
          surveyPurpose: survey.surveyPurpose || "N/A",
          workStatus: survey.workStatus || "pending",
          notes: survey.notes || "N/A",
          locationDetails: survey.locationDetails || "No address",
          cameraDetails: survey.cameraDetails || [],
          division: survey.division,
          depot: survey.depot,
          bus_station: survey.bus_station, // ✅ include bus station
          bus_stand: survey.bus_stand,
        }));

        setSurveys(surveysData);
        setFilteredSurveys(surveysData);
      } catch (error) {
        console.error("Error fetching surveys:", error);
        toast({
          title: "Error",
          description: "Failed to load survey data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [toast]);

  // Update markers when filtered surveys or map changes
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      addMarkersToMap(mapInstanceRef.current);
    }
  }, [addMarkersToMap, mapLoaded]);

  // Filter surveys based on status and search
  useEffect(() => {
    let filtered = [...surveys];

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (survey) =>
          mapWorkStatusToFilter(
            survey.workStatus.toLowerCase().replace(" ", "-")
          ) === filterStatus
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (survey) =>
          survey.surveyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (survey.locationDetails || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSurveys(filtered);
  }, [surveys, filterStatus, searchQuery]);

  // Center map on location
  const centerOnLocation = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  // Go to user location
  const goToMyLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(15);
      setSelectedSurvey(null);
      setSidebarOpen(false);
      toast({
        title: "Location Centered",
        description: "Map centered on your current location",
      });
    } else {
      setSelectedSurvey(null);

      getCurrentLocation(mapInstanceRef.current);
    }
  };

  const mapWorkStatusToFilter = (
    status: string
  ): "completed" | "in-progress" | "pending" => {
    switch (status) {
      case "survey-completed":
      case "completed":
        return "completed";
      case "in-progress":
      case "survey-initiated":
        return "in-progress";
      case "pending-approval":
      case "ready-for-installation":
      case "pending":
        return "pending";
      default:
        return "pending";
    }
  };

  const getMarkerIcon = (status: "completed" | "in-progress" | "pending") => {
    const colors = {
      completed: "#10B981",
      "in-progress": "#F59E0B",
      pending: "#EF4444",
    };

    const color = colors[status];

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" strokeWidth="4"/>
        <circle cx="20" cy="20" r="6" fill="white"/>
      </svg>
    `)}`;
  };

  const getStatusBadgeColor = (
    status: "completed" | "in-progress" | "pending"
  ) => {
    switch (status) {
      case "completed":
        return "#dcfce7; color: #166534";
      case "in-progress":
        return "#fef3c7; color: #92400e";
      case "pending":
        return "#fee2e2; color: #991b1b";
      default:
        return "#f3f4f6; color: #374151";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="h-full bg-white/90 backdrop-blur-md border-r border-white/20 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Survey Map</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ModernCard className="p-3">
            <div className="flex items-center">
              <div className="bg-green-100 p-1 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-500">Completed</p>
                <p className="text-lg font-bold text-gray-900">
                  {
                    surveys.filter(
                      (s) =>
                        mapWorkStatusToFilter(
                          s.workStatus.toLowerCase().replace(" ", "-")
                        ) === "completed"
                    ).length
                  }
                </p>
              </div>
            </div>
          </ModernCard>
          <ModernCard className="p-3">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-1 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-500">In Progress</p>
                <p className="text-lg font-bold text-gray-900">
                  {
                    surveys.filter(
                      (s) =>
                        mapWorkStatusToFilter(
                          s.workStatus.toLowerCase().replace(" ", "-")
                        ) === "in-progress"
                    ).length
                  }
                </p>
              </div>
            </div>
          </ModernCard>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <PillButton
              onClick={goToMyLocation}
              size="sm"
              className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Navigation className="w-3 h-3 mr-1" />
              My Location
            </PillButton>
            <PillButton
              size="sm"
              className="bg-green-50 text-green-700 hover:bg-green-100"
            >
              <Layers className="w-3 h-3 mr-1" />
              Layers
            </PillButton>
          </div>
        </div>

        <div className="text-xs text-gray-600 text-center py-2 bg-gray-50 rounded-lg">
          Showing {filteredSurveys.length} of {surveys.length} locations
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Survey Locations
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredSurveys.map((survey) => {
              const StatusIcon = getStatusIcon(
                survey.workStatus.toLowerCase().replace(" ", "-")
              );
              const station = survey.bus_station;
              const distance =
                userLocation && station?.latitude && station?.longitude
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      parseFloat(station.latitude),
                      parseFloat(station.longitude)
                    )
                  : null;

              return (
                <ModernCard
                  key={survey.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedSurvey?.id === survey.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSurvey(survey);
                    const station = survey.bus_station;
                    if (station?.latitude && station?.longitude) {
                      centerOnLocation(
                        parseFloat(station.latitude),
                        parseFloat(station.longitude)
                      );
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {survey.surveyName}
                    </h4>
                    <StatusIcon
                      className={`w-4 h-4 ${getStatusColor(
                        survey.workStatus.toLowerCase().replace(" ", "-")
                      )} flex-shrink-0`}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {survey.bus_station?.address || "No address"}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {survey.bus_station?.latitude &&
                    survey.bus_station?.longitude
                      ? `Lat: ${parseFloat(survey.bus_station.latitude).toFixed(
                          6
                        )}, Lng: ${parseFloat(
                          survey.bus_station.longitude
                        ).toFixed(6)}`
                      : "Coordinates: N/A"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Camera className="w-3 h-3 mr-1" />
                      {survey.cameraDetails.length} cameras
                    </div>
                    {distance && <div>{distance.toFixed(1)} km</div>}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {survey.division?.name || "N/A"} •{" "}
                    {survey.depot?.name || "N/A"}
                  </div>
                  <div className="mt-2">
                    <StatusIndicator
                      status={mapWorkStatusToFilter(
                        survey.workStatus.toLowerCase().replace(" ", "-")
                      )}
                      size="sm"
                    />
                  </div>
                </ModernCard>
              );
            })}
            {filteredSurveys.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No locations found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${
          GOOGLE_MAPS_CONFIG.apiKey
        }&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(",")}&callback=initMap`}
        strategy="afterInteractive"
        onLoad={handleGoogleMapsLoad}
        onReady={handleGoogleMapsLoad}
        onError={handleGoogleMapsError}
      />

      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-2 right-4 z-50 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg border border-white/20"
      >
        <MapPinPlus className={`w-5 h-5 ${sidebarOpen ? "hidden" : ""}`} />
      </button>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-80">
          <SidebarContent />
        </div>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="flex-1 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="w-80 max-w-sm">
              <SidebarContent />
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: "100%" }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit animate-pulse mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading Google Maps
                </h3>
                <p className="text-gray-600">
                  Please wait while we load the interactive map...
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-10">
            <ModernCard className="p-3 bg-white/95 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Your Location</span>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>

      {selectedSurvey && (
        <div className="border-t border-white/20 bg-white/90 backdrop-blur-md">
          <ModernCard className="m-2 md:m-4 p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                {selectedSurvey.surveyName}
              </h3>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <StatusIndicator
                    status={mapWorkStatusToFilter(
                      selectedSurvey.workStatus.toLowerCase().replace(" ", "-")
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Cameras
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {selectedSurvey.cameraDetails.length} installed
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Camera Type
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {selectedSurvey.cameraDetails[0]?.type || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {new Date(selectedSurvey.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Address
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {selectedSurvey.bus_station?.address || "No address"}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Division & Depot
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {selectedSurvey.division?.name || "N/A"} •{" "}
                  {selectedSurvey.depot?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Coordinates
                </label>
                <p className="mt-1 text-xs md:text-sm text-gray-900">
                  {selectedSurvey.bus_station?.latitude &&
                  selectedSurvey.bus_station?.longitude
                    ? `${parseFloat(
                        selectedSurvey.bus_station.latitude
                      ).toFixed(6)}, ${parseFloat(
                        selectedSurvey.bus_station.longitude
                      ).toFixed(6)}`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PillButton
                size="sm"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <MapIcon className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm">View Details</span>
              </PillButton>
              <PillButton
                size="sm"
                className="bg-green-50 text-green-700 hover:bg-green-100"
              >
                <Navigation className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm">Navigate</span>
              </PillButton>
              <PillButton
                size="sm"
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                <Crosshair className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm hidden sm:inline">
                  Street View
                </span>
                <span className="text-xs md:text-sm sm:hidden">Street</span>
              </PillButton>
              <PillButton
                size="sm"
                className="bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                <Camera className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm">Cameras</span>
              </PillButton>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "in-progress":
      return "text-blue-600";
    case "pending":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "in-progress":
      return Clock;
    case "pending":
      return AlertTriangle;
    default:
      return MapPin;
  }
};

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
