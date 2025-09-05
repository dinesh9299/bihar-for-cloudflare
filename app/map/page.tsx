"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ModernSidebar } from "@/components/layout/modern-sidebar"
import { ModernHeader } from "@/components/layout/modern-header"
import { PageLayout } from "@/components/layout/page-layout"
import { ModernCard } from "@/components/ui/modern-card"
import { PillButton } from "@/components/ui/pill-button"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapIcon,
  Crosshair,
  Filter,
} from "lucide-react"

// Google Maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface Survey {
  id: number
  location: string
  coordinates: { lat: number; lng: number }
  status: "completed" | "in-progress" | "pending"
  cameras: number
  lastUpdated: string
  address: string
  division: string
  depot: string
  cameraType: string
}

const mockSurveys: Survey[] = [
  {
    id: 1,
    location: "Pune Central Bus Station",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    status: "completed",
    cameras: 4,
    lastUpdated: "2024-01-15",
    address: "Pune Central, Maharashtra 411001",
    division: "Pune",
    depot: "Central",
    cameraType: "Bullet",
  },
  {
    id: 2,
    location: "Mumbai Dadar Bus Stop",
    coordinates: { lat: 19.0176, lng: 72.8562 },
    status: "in-progress",
    cameras: 2,
    lastUpdated: "2024-01-14",
    address: "Dadar West, Mumbai, Maharashtra 400028",
    division: "Mumbai",
    depot: "Dadar",
    cameraType: "Dome",
  },
  {
    id: 3,
    location: "Nashik Road Bus Stand",
    coordinates: { lat: 19.9975, lng: 73.7898 },
    status: "pending",
    cameras: 0,
    lastUpdated: "2024-01-13",
    address: "Nashik Road, Nashik, Maharashtra 422101",
    division: "Nashik",
    depot: "Road",
    cameraType: "PTZ",
  },
  {
    id: 4,
    location: "Kolhapur ST Stand",
    coordinates: { lat: 16.705, lng: 74.2433 },
    status: "completed",
    cameras: 5,
    lastUpdated: "2024-01-12",
    address: "ST Stand Road, Kolhapur, Maharashtra 416001",
    division: "Kolhapur",
    depot: "Main",
    cameraType: "Bullet",
  },
  {
    id: 5,
    location: "Aurangabad CBS",
    coordinates: { lat: 19.8762, lng: 75.3433 },
    status: "in-progress",
    cameras: 6,
    lastUpdated: "2024-01-11",
    address: "Central Bus Stand, Aurangabad, Maharashtra 431001",
    division: "Aurangabad",
    depot: "Central",
    cameraType: "Dome",
  },
]

export default function MapPage() {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys)
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>(mockSurveys)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  const { toast } = useToast()

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: { lat: 19.076, lng: 72.8777 }, // Maharashtra center
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#dbeafe" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [{ color: "#fef7ed" }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      mapInstanceRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // Add markers for survey locations
      addMarkersToMap(map)

      // Get current location
      getCurrentLocation(map)

      setMapLoaded(true)
      toast({
        title: "Map Loaded",
        description: "Google Maps has been successfully loaded",
      })
    }
  }, [toast])

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBK9BuZ3-muEkjTT-KDZD14RAG37do1T3k&libraries=places,geometry&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = initializeMap
      document.head.appendChild(script)

      script.onerror = () => {
        toast({
          title: "Map Loading Error",
          description: "Failed to load Google Maps. Please check your internet connection.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } else {
      initializeMap()
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
    }
  }, [initializeMap])

  // Add markers to map
  const addMarkersToMap = (map: any) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    filteredSurveys.forEach((survey) => {
      const marker = new window.google.maps.Marker({
        position: survey.coordinates,
        map: map,
        title: survey.location,
        icon: {
          url: getMarkerIcon(survey.status),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
      })

      marker.addListener("click", () => {
        setSelectedSurvey(survey)

        const content = `
          <div style="max-width: 300px; padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${survey.location}</h3>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${survey.address}</p>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                📹 ${survey.cameras} cameras
              </span>
              <span style="background: ${getStatusBadgeColor(survey.status)}; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${survey.status.charAt(0).toUpperCase() + survey.status.slice(1).replace("-", " ")}
              </span>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">${survey.division} • ${survey.depot} • ${survey.cameraType}</p>
          </div>
        `

        infoWindowRef.current.setContent(content)
        infoWindowRef.current.open(map, marker)

        // Center map on marker
        map.panTo(survey.coordinates)
        map.setZoom(15)
      })

      markersRef.current.push(marker)
    })
  }

  // Update markers when filtered surveys change
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      addMarkersToMap(mapInstanceRef.current)
    }
  }, [filteredSurveys, mapLoaded])

  const getMarkerIcon = (status: string) => {
    const colors = {
      completed: "#10B981",
      "in-progress": "#F59E0B",
      pending: "#EF4444",
    }

    const color = colors[status as keyof typeof colors] || "#6B7280"

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" strokeWidth="4"/>
        <circle cx="20" cy="20" r="6" fill="white"/>
      </svg>
    `)}`
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#dcfce7; color: #166534"
      case "in-progress":
        return "#fef3c7; color: #92400e"
      case "pending":
        return "#fee2e2; color: #991b1b"
      default:
        return "#f3f4f6; color: #374151"
    }
  }

  // Get current location
  const getCurrentLocation = (map: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          setUserLocation(pos)

          // Add current location marker
          new window.google.maps.Marker({
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
          })

          toast({
            title: "Location Found",
            description: "Your current location has been marked on the map",
          })
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive",
          })
        },
      )
    }
  }

  // Center map on location
  const centerOnLocation = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng })
      mapInstanceRef.current.setZoom(15)
    }
  }

  // Go to user location
  const goToMyLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation)
      mapInstanceRef.current.setZoom(15)
      toast({
        title: "Location Centered",
        description: "Map centered on your current location",
      })
    } else {
      getCurrentLocation(mapInstanceRef.current)
    }
  }

  // Filter surveys based on status and search
  useEffect(() => {
    let filtered = surveys

    if (filterStatus !== "all") {
      filtered = filtered.filter((survey) => survey.status === filterStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (survey) =>
          survey.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          survey.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          survey.division.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredSurveys(filtered)
  }, [surveys, filterStatus, searchQuery])

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in-progress":
        return "text-blue-600"
      case "pending":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle
      case "in-progress":
        return Clock
      case "pending":
        return AlertTriangle
      default:
        return MapPin
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex h-screen">
          <ModernSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <ModernHeader title="Survey Map" subtitle="Loading interactive map..." showGPS={false} />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map data...</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="Survey Map View"
            subtitle="Interactive Google Maps with CCTV survey locations"
            showGPS={true}
            gpsStatus={userLocation ? "connected" : "disconnected"}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 bg-white/70 backdrop-blur-md border-r border-white/20 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <ModernCard className="p-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-500">Completed</p>
                        <p className="text-lg font-bold text-gray-900">
                          {surveys.filter((s) => s.status === "completed").length}
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
                          {surveys.filter((s) => s.status === "in-progress").length}
                        </p>
                      </div>
                    </div>
                  </ModernCard>
                </div>

                {/* Controls */}
                <div className="space-y-3">
                  {/* Search */}
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

                  {/* Filter */}
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

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <PillButton
                      onClick={goToMyLocation}
                      size="sm"
                      className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      My Location
                    </PillButton>
                    <PillButton size="sm" className="bg-green-50 text-green-700 hover:bg-green-100">
                      <Layers className="w-3 h-3 mr-1" />
                      Layers
                    </PillButton>
                  </div>
                </div>

                {/* Results count */}
                <div className="text-xs text-gray-600 text-center py-2 bg-gray-50 rounded-lg">
                  Showing {filteredSurveys.length} of {surveys.length} locations
                </div>

                {/* Location List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Survey Locations</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredSurveys.map((survey) => {
                      const StatusIcon = getStatusIcon(survey.status)
                      const distance = userLocation
                        ? calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            survey.coordinates.lat,
                            survey.coordinates.lng,
                          )
                        : null

                      return (
                        <ModernCard
                          key={survey.id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            selectedSurvey?.id === survey.id ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => {
                            setSelectedSurvey(survey)
                            centerOnLocation(survey.coordinates.lat, survey.coordinates.lng)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{survey.location}</h4>
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(survey.status)} flex-shrink-0`} />
                          </div>

                          <p className="text-xs text-gray-600 mb-2">{survey.address}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Camera className="w-3 h-3 mr-1" />
                              {survey.cameras} cameras
                            </div>
                            {distance && <div>{distance.toFixed(1)} km</div>}
                          </div>

                          <div className="text-xs text-gray-500">
                            {survey.division} • {survey.depot}
                          </div>

                          <div className="mt-2">
                            <StatusIndicator status={survey.status} size="sm" />
                          </div>
                        </ModernCard>
                      )
                    })}

                    {filteredSurveys.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No locations found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" style={{ minHeight: "100%" }} />

              {!mapLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit animate-pulse mb-4">
                      <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Google Maps</h3>
                    <p className="text-gray-600">Please wait while we load the interactive map...</p>
                  </div>
                </div>
              )}

              {/* Legend */}
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

          {/* Selected Survey Details - Bottom Panel */}
          {selectedSurvey && (
            <div className="border-t border-white/20 bg-white/70 backdrop-blur-md">
              <ModernCard className="m-4 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedSurvey.location}</h3>
                  <button onClick={() => setSelectedSurvey(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusIndicator status={selectedSurvey.status} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Cameras</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSurvey.cameras} installed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Camera Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSurvey.cameraType}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSurvey.lastUpdated}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSurvey.address}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Division & Depot</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedSurvey.division} • {selectedSurvey.depot}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PillButton size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    <MapIcon className="w-4 h-4 mr-2" />
                    View Details
                  </PillButton>
                  <PillButton size="sm" className="bg-green-50 text-green-700 hover:bg-green-100">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </PillButton>
                  <PillButton size="sm" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                    <Crosshair className="w-4 h-4 mr-2" />
                    Street View
                  </PillButton>
                  <PillButton size="sm" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                    <Camera className="w-4 h-4 mr-2" />
                    View Cameras
                  </PillButton>
                </div>
              </ModernCard>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
