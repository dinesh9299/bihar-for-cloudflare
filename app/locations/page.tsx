"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { ModernSidebar } from "@/components/layout/modern-sidebar";
import { ModernHeader } from "@/components/layout/modern-header";
import { ModernCard } from "@/components/ui/modern-card";
import { PillButton } from "@/components/ui/pill-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building,
  Bus,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Division {
  id: string;
  name: string;
  code: string;
  region: string;
  depots: number;
  status: "active" | "inactive";
  description?: string;
  documentId: string;
}

interface Depot {
  id: string;
  name: string;
  code: string;
  division: string;
  address: string;
  busStations: number;
  status: "active" | "inactive";
  contactPerson?: string;
  phone?: string;
  documentId: string;
}

interface BusStation {
  id: string;
  name: string;
  depot: string;
  division: string;
  address: string;
  latitude: number;
  longitude: number;
  busStands: number;
  status: "active" | "inactive";
  facilities?: string[];
  documentId: string;
}

interface BusStand {
  id: string;
  name: string;
  platformNumber: string;
  busStation: string;
  depot: string;
  division: string;
  capacity: number;
  status: "active" | "inactive";
  type?: string;
  documentId: string;
}

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("divisions");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  // Sample data
  const [divisions, setDivisions] = useState<Division[]>([]);

  const fetchdivisions = async () => {
    const response = await axios.get("http://localhost:1337/api/divisions");

    setDivisions(response.data.data);
  };

  const [depots, setDepots] = useState<Depot[]>([]);

  const fetchdepots = async () => {
    const response = await axios.get(
      "http://localhost:1337/api/depots?populate=*"
    );
    // Map division to division.id for each depot
    const depotsWithDivisionId = response.data.data.map((depot: any) => ({
      ...depot,
      division: depot.division?.id?.toString() || "",
    }));
    setDepots(depotsWithDivisionId);
  };

  useEffect(() => {
    fetchdivisions();
    fetchdepots();
  }, []);

  const [busStations, setBusStations] = useState<BusStation[]>([]);

  const fetchbusstations = async () => {
    const response = await axios.get(
      "http://localhost:1337/api/bus-stations?populate=*"
    );
    const busStationsWithIds = response.data.data.map((station: any) => ({
      ...station,
      division: station.division?.id?.toString() || "",
      depot: station.depot?.id?.toString() || "",
    }));
    setBusStations(busStationsWithIds);
  };

  useEffect(() => {
    fetchbusstations();
  }, []);

  const [busStands, setBusStands] = useState<BusStand[]>([]);

  const fetchbusstands = async () => {
    const response = await axios.get(
      "http://localhost:1337/api/bus-stands?populate=*"
    );
    const busStandWithIds = response.data.data.map((stand: any) => {
      const mappedStand = {
        ...stand,
        division: stand.division?.id?.toString() || "",
        depot: stand.depot?.id?.toString() || "",
        busStation: stand.station?.id?.toString() || "", // Replace with correct field name
      };
      // console.log("Mapped Bus Stand:", JSON.stringify(mappedStand, null, 2));
      return mappedStand;
    });
    setBusStands(busStandWithIds);
  };
  useEffect(() => {
    fetchbusstands();
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    region: "",
    division: "",
    depot: "",
    busStation: "",
    address: "",
    latitude: "",
    longitude: "",
    platformNumber: "",
    capacity: "",
    description: "",
    contactPerson: "",
    phone: "",
    facilities: [] as string[],
    type: "",
  });

  const handleAdd = (type: string) => {
    console.log("formdata", formData);

    try {
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Name is required",
        });
        return;
      }

      const newId = Date.now().toString();

      switch (type) {
        case "divisions":
          if (!formData.code || !formData.region) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Code and region are required",
            });
            return;
          }

          // const newDivision: Division = {
          //   id: newId,
          //   name: formData.name,
          //   code: formData.code,
          //   region: formData.region,
          //   depots: 0,
          //   status: "active",
          //   description: formData.description,
          // };
          // setDivisions([...divisions, newDivision]);

          const payload = {
            data: {
              name: formData.name,
              code: formData.code,
              region: formData.region,
              description: formData.description,
            },
          };

          const res = axios
            .post("http://localhost:1337/api/divisions", payload, {
              headers: { "Content-Type": "application/json" },
            })
            .then((res) => {
              if (res.status === 201) {
                fetchdivisions();
              }
            })
            .catch((err) => {
              console.error(err);
            });

          toast({
            variant: "success",
            title: "Division Created",
            description: `${formData.name} has been successfully created`,
          });
          break;

        case "depots":
          if (!formData.code || !formData.division) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Code and division are required",
            });
            return;
          }

          console.log("formdata", formData);
          // const newDepot: Depot = {
          //   id: newId,
          //   name: formData.name,
          //   code: formData.code,
          //   division: formData.division,
          //   address: formData.address,
          //   busStations: 0,
          //   status: "active",
          //   contactPerson: formData.contactPerson,
          //   phone: formData.phone,
          // };
          // setDepots([...depots, newDepot]);

          const depotpayload = {
            data: {
              name: formData.name,
              code: formData.code,
              division: formData.division,
              address: formData.address,
              contactPerson: formData.contactPerson,
              phone: formData.phone,
              state: "inactive",
            },
          };

          const depotres = axios
            .post("http://localhost:1337/api/depots", depotpayload, {
              headers: { "Content-Type": "application/json" },
            })
            .then((depotres) => {
              if (depotres.status === 201) {
                fetchdepots();
              }

              console.log("res", depotres);
            })
            .catch((err) => {
              console.error(err);
            });

          toast({
            variant: "success",
            title: "Depot Created",
            description: `${formData.name} has been successfully created`,
          });
          break;

        case "bus-stations":
          if (!formData.division || !formData.depot || !formData.name) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Name, division, and depot are required",
            });
            return;
          }
          if (!Array.isArray(formData.facilities)) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Facilities must be a valid list",
            });
            return;
          }

          const busstationspayload = {
            data: {
              name: formData.name,
              depot: formData.depot,
              division: formData.division,
              address: formData.address,
              latitude: Number.parseFloat(formData.latitude) || 0,
              longitude: Number.parseFloat(formData.longitude) || 0,
              facilities: formData.facilities,
            },
          };

          const busstationsres = axios
            .post(
              "http://localhost:1337/api/bus-stations",
              busstationspayload,
              {
                headers: { "Content-Type": "application/json" },
              }
            )
            .then((busstationsres) => {
              if (busstationsres.status === 201) {
                fetchbusstations();
                resetForm(); // Reset form after successful creation
              }
              console.log("res", busstationsres);
            })
            .catch((err) => {
              console.error(err);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create bus station",
              });
            });

          toast({
            variant: "success",
            title: "Bus Station Created",
            description: `${formData.name} has been successfully created`,
          });
          setIsAddDialogOpen(false);
          break;

        case "bus-stands":
          if (
            !formData.name ||
            !formData.platformNumber ||
            !formData.division ||
            !formData.depot ||
            !formData.busStation
          ) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description:
                "Name, platform number, division, depot, and bus station are required",
            });
            return;
          }

          const busStationId = Number.parseInt(formData.busStation);
          if (!busStationId || isNaN(busStationId)) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Invalid bus station selected",
            });
            return;
          }

          const busstandpayload = {
            data: {
              name: formData.name,
              platformNumber: formData.platformNumber,
              bus_stations: busStationId, // Use station
              depot: Number.parseInt(formData.depot) || 0,
              divisions: Number.parseInt(formData.division) || 0,
              capacity: Number.parseInt(formData.capacity) || 0,
              type: formData.type || "",
            },
          };

          console.log(
            "Bus Stand Payload:",
            JSON.stringify(busstandpayload, null, 2)
          );

          const busstandres = axios
            .post("http://localhost:1337/api/bus-stands", busstandpayload, {
              headers: { "Content-Type": "application/json" },
            })
            .then((busstandres) => {
              if (busstandres.status === 201) {
                fetchbusstands();
                resetForm();
                setIsAddDialogOpen(false);
              }
              console.log("Response:", busstandres.data);
            })
            .catch((err) => {
              console.error("Error:", err.response?.data || err.message);
              toast({
                variant: "destructive",
                title: "Error",
                description:
                  err.response?.data?.error?.message ||
                  "Failed to create bus stand",
              });
            });

          toast({
            variant: "success",
            title: "Bus Stand Created",
            description: `${formData.name} has been successfully created`,
          });
          break;
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create item. Please try again.",
      });
    }
  };

  const handleEdit = (item: any) => {
    let divisionId = item.division;
    let depotId = item.depot;

    if (typeof divisionId === "object" && divisionId?.id) {
      divisionId = divisionId.id.toString();
    }
    if (typeof depotId === "object" && depotId?.id) {
      depotId = depotId.id.toString();
    }
    if (
      typeof depotId === "string" &&
      depotId &&
      !depots.find((d) => d.id === depotId)
    ) {
      const foundDepot = depots.find((d) => d.name === depotId);
      if (foundDepot) depotId = foundDepot.id;
    }

    setEditingItem(item);
    setFormData({
      ...item,
      division: divisionId || "",
      depot: depotId || "",
      busStation: item.busStation || "",
      latitude: item.latitude?.toString() || "",
      longitude: item.longitude?.toString() || "",
      capacity: item.capacity?.toString() || "",
      facilities: Array.isArray(item.facilities)
        ? item.facilities
        : item.facilities && typeof item.facilities === "object"
        ? Object.entries(item.facilities)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
        : [], // Ensure facilities is string[]
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdate = (type: string) => {
    try {
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Name is required",
        });
        return;
      }

      switch (type) {
        case "divisions":
          setDivisions(
            divisions.map((div) =>
              div.id === editingItem.id ? { ...div, ...formData } : div
            )
          );

          console.log("foemdata", editingItem);

          const payload = {
            data: {
              name: formData.name,
              code: formData.code,
              region: formData.region,
              description: formData.description,
            },
          };

          const res = axios
            .put(
              `http://localhost:1337/api/divisions/${editingItem.documentId}`,
              payload,
              {
                headers: { "Content-Type": "application/json" },
              }
            )
            .then((res) => {
              console.log("res", res);
              toast({
                variant: "success",
                title: "Division Updated",
                description: `${formData.name} has been successfully updated`,
              });
              // if (res.status === 201) {
              // }
            })
            .catch((err) => {
              console.error(err);
            });

          break;

        case "depots":
          setDepots(
            depots.map((depot) =>
              depot.id === editingItem.id ? { ...depot, ...formData } : depot
            )
          );

          const depotpayload = {
            data: {
              name: formData.name,
              code: formData.code,
              division: formData.division,
              address: formData.address,
              contactPerson: formData.contactPerson,
              phone: formData.phone,
              state: "inactive",
            },
          };

          const depotres = axios
            .put(
              `http://localhost:1337/api/depots/${editingItem.documentId}`,
              depotpayload,
              {
                headers: { "Content-Type": "application/json" },
              }
            )
            .then((depotres) => {
              if (depotres.status === 200) {
                fetchdepots();
              }

              console.log("res", depotres);
            })
            .catch((err) => {
              console.error(err);
            });
          toast({
            variant: "success",
            title: "Depot Updated",
            description: `${formData.name} has been successfully updated`,
          });
          break;

        case "bus-stations":
          setBusStations(
            busStations.map((station) =>
              station.id === editingItem.id
                ? {
                    ...station,
                    ...formData,
                    latitude:
                      Number.parseFloat(formData.latitude) || station.latitude,
                    longitude:
                      Number.parseFloat(formData.longitude) ||
                      station.longitude,
                  }
                : station
            )
          );

          const busstationspayload = {
            data: {
              name: formData.name,
              depot: formData.depot,
              division: formData.division,
              address: formData.address,
              latitude: Number.parseFloat(formData.latitude) || 0,
              longitude: Number.parseFloat(formData.longitude) || 0,
              facilities: formData.facilities,
            },
          };

          const busstationsres = axios
            .put(
              `http://localhost:1337/api/bus-stations/${editingItem.documentId}`,
              busstationspayload,
              {
                headers: { "Content-Type": "application/json" },
              }
            )
            .then((busstationsres) => {
              if (busstationsres.status === 200) {
                fetchbusstations();
              }

              console.log("res", busstationsres);
            })
            .catch((err) => {
              console.error(err);
            });

          toast({
            variant: "success",
            title: "Bus Station Updated",
            description: `${formData.name} has been successfully updated`,
          });
          break;

        case "bus-stands":
          setBusStands(
            busStands.map((stand) =>
              stand.id === editingItem.id
                ? {
                    ...stand,
                    ...formData,
                    capacity:
                      Number.parseInt(formData.capacity) || stand.capacity,
                  }
                : stand
            )
          );

          const busStationId = Number.parseInt(formData.busStation);
          if (!busStationId || isNaN(busStationId)) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Invalid bus station selected",
            });
            return;
          }

          const busStandpayload = {
            data: {
              name: formData.name,
              platformNumber: formData.platformNumber,
              station: busStationId, // Replace with correct field name
              depot: Number.parseInt(formData.depot) || 0,
              division: Number.parseInt(formData.division) || 0,
              capacity: Number.parseInt(formData.capacity) || 0,
              type: formData.type || "",
            },
          };

          const busStandres = axios
            .put(
              `http://localhost:1337/api/bus-stands/${editingItem.documentId}`,
              busStandpayload,
              {
                headers: { "Content-Type": "application/json" },
              }
            )
            .then((busStandres) => {
              if (busStandres.status === 200) {
                fetchbusstands();
              }
              console.log("res", busStandres);
            })
            .catch((err) => {
              console.error(err);
              toast({
                variant: "destructive",
                title: "Error",
                description:
                  err.response?.data?.error?.message ||
                  "Failed to update bus stand",
              });
            });

          toast({
            variant: "success",
            title: "Bus Stand Updated",
            description: `${formData.name} has been successfully updated`,
          });
          break;
      }

      setIsAddDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update item. Please try again.",
      });
    }
  };

  const handleDelete = (id: string, type: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}${id}"?`)) {
      try {
        switch (type) {
          case "division":
            axios.delete(`http://localhost:1337/api/divisions/${id}`);
            setDivisions(divisions.filter((div) => div.documentId !== id));
            break;
          case "depot":
            axios.delete(`http://localhost:1337/api/depots/${id}`);
            setDepots(depots.filter((depot) => depot.id !== id));
            break;
          case "bus-station":
            axios.delete(`http://localhost:1337/api/bus-stations/${id}`);
            setBusStations(busStations.filter((station) => station.id !== id));
            break;
          case "bus-stand":
            axios.delete(`http://localhost:1337/api/bus-stands/${id}`);
            setBusStands(busStands.filter((stand) => stand.id !== id));
            break;
        }

        toast({
          variant: "success",
          title: "Item Deleted",
          description: `${name} has been successfully deleted`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete item. Please try again.",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      region: "",
      division: "",
      depot: "",
      busStation: "",
      address: "",
      latitude: "",
      longitude: "",
      platformNumber: "",
      capacity: "",
      description: "",
      contactPerson: "",
      phone: "",
      facilities: [], // Always reset to empty array
      type: "",
    });
  };

  const getStatusBadge = (status: string) => (
    <Badge
      className={
        status === "active"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-red-100 text-red-800 border-red-200"
      }
    >
      {status}
    </Badge>
  );

  const addFacility = (facility: string) => {
    if (facility) {
      setFormData((prev) => ({
        ...prev,
        facilities: Array.isArray(prev.facilities)
          ? [...prev.facilities.filter((f) => f !== facility), facility]
          : [facility],
      }));
    }
  };

  const removeFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: Array.isArray(prev.facilities)
        ? prev.facilities.filter((f) => f !== facility)
        : [],
    }));
  };

  const renderAddForm = () => {
    switch (activeTab) {
      case "divisions":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Division Name *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter division name"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Division Code *
                </Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Enter division code"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Region *
              </Label>
              <Select
                value={formData.region}
                onValueChange={(value) =>
                  setFormData({ ...formData, region: value })
                }
              >
                <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Western">Western</SelectItem>
                  <SelectItem value="Eastern">Eastern</SelectItem>
                  <SelectItem value="Northern">Northern</SelectItem>
                  <SelectItem value="Southern">Southern</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter division description"
                className="min-h-[100px] bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base resize-none"
              />
            </div>
          </div>
        );

      case "depots":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Depot Name *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter depot name"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Depot Code *
                </Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Enter depot code"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Division *
              </Label>
              <Select
                value={formData.division}
                onValueChange={(value) =>
                  setFormData({ ...formData, division: value })
                }
              >
                <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter depot address"
                className="min-h-[80px] bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Contact Person
                </Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  placeholder="Enter contact person name"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
            </div>
          </div>
        );

      case "bus-stations":
        console.log("formData:", formData); // Debug
        console.log("formData.facilities:", formData.facilities); // Debug
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Bus Station Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter bus station name"
                className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Division *
                </Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) =>
                    setFormData({ ...formData, division: value, depot: "" })
                  }
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.length > 0 ? (
                      divisions.map((div) => (
                        <SelectItem key={div.id} value={div.id.toString()}>
                          {div.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        No divisions available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Depot *
                </Label>
                <Select
                  value={formData.depot}
                  onValueChange={(value) =>
                    setFormData({ ...formData, depot: value })
                  }
                  disabled={!formData.division}
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select depot" />
                  </SelectTrigger>
                  <SelectContent>
                    {depots.filter(
                      (depot) => depot.division === formData.division
                    ).length > 0 ? (
                      depots
                        .filter((depot) => depot.division === formData.division)
                        .map((depot) => (
                          <SelectItem
                            key={depot.id}
                            value={depot.id.toString()}
                          >
                            {depot.name}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        {formData.division
                          ? "No depots available for this division"
                          : "Select a division first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter bus station address"
                className="min-h-[80px] bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="Enter latitude"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="Enter longitude"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Facilities
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.isArray(formData.facilities) &&
                formData.facilities.length > 0 ? (
                  formData.facilities.map((facility) => (
                    <Badge
                      key={facility}
                      className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs">
                    No facilities selected
                  </div>
                )}
              </div>
              <Select onValueChange={addFacility}>
                <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                  <SelectValue placeholder="Add facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Waiting Area">Waiting Area</SelectItem>
                  <SelectItem value="Restrooms">Restrooms</SelectItem>
                  <SelectItem value="Food Court">Food Court</SelectItem>
                  <SelectItem value="Parking">Parking</SelectItem>
                  <SelectItem value="ATM">ATM</SelectItem>
                  <SelectItem value="Medical Aid">Medical Aid</SelectItem>
                  <SelectItem value="Information Desk">
                    Information Desk
                  </SelectItem>
                  <SelectItem value="WiFi">WiFi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "bus-stands":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Bus Stand Name *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter bus stand name"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Platform Number *
                </Label>
                <Input
                  value={formData.platformNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, platformNumber: e.target.value })
                  }
                  placeholder="Enter platform number"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Division *
                </Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      division: value,
                      depot: "", // Reset depot when division changes
                      busStation: "", // Reset bus station when division changes
                    })
                  }
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.length > 0 ? (
                      divisions.map((div) => (
                        <SelectItem key={div.id} value={div.id.toString()}>
                          {div.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        No divisions available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Depot *
                </Label>
                <Select
                  value={formData.depot}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      depot: value,
                      busStation: "", // Reset bus station when depot changes
                    })
                  }
                  disabled={!formData.division} // Disable if no division selected
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select depot" />
                  </SelectTrigger>
                  <SelectContent>
                    {depots.filter(
                      (depot) => depot.division === formData.division
                    ).length > 0 ? (
                      depots
                        .filter((depot) => depot.division === formData.division)
                        .map((depot) => (
                          <SelectItem
                            key={depot.id}
                            value={depot.id.toString()}
                          >
                            {depot.name}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        {formData.division
                          ? "No depots available for this division"
                          : "Select a division first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Bus Station *
                </Label>
                <Select
                  value={formData.busStation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, busStation: value })
                  }
                  disabled={!formData.depot} // Disable if no depot selected
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select bus station" />
                  </SelectTrigger>
                  <SelectContent>
                    {busStations.filter(
                      (station) => station.depot === formData.depot
                    ).length > 0 ? (
                      busStations
                        .filter((station) => station.depot === formData.depot)
                        .map((station) => (
                          <SelectItem
                            key={station.id}
                            value={station.id.toString()}
                          >
                            {station.name}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-gray-500">
                        {formData.depot
                          ? "No bus stations available for this depot"
                          : "Select a depot first"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Capacity
                </Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="Enter bus capacity"
                  className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Service Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl text-base">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Long Distance">Long Distance</SelectItem>
                    <SelectItem value="City Service">City Service</SelectItem>
                    <SelectItem value="Express Service">
                      Express Service
                    </SelectItem>
                    <SelectItem value="Local Service">Local Service</SelectItem>
                    <SelectItem value="Intercity">Intercity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="flex h-screen">
        <ModernSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ModernHeader
            title="Location Management"
            subtitle="Manage divisions, depots, bus stations, and bus stands"
            showGPS={false}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ModernCard>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/50 backdrop-blur-sm h-12">
                      <TabsTrigger
                        value="divisions"
                        className="text-sm font-medium"
                      >
                        Divisions
                      </TabsTrigger>
                      <TabsTrigger
                        value="depots"
                        className="text-sm font-medium"
                      >
                        Depots
                      </TabsTrigger>
                      <TabsTrigger
                        value="bus-stations"
                        className="text-sm font-medium"
                      >
                        Bus Stations
                      </TabsTrigger>
                      <TabsTrigger
                        value="bus-stands"
                        className="text-sm font-medium"
                      >
                        Bus Stands
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 h-12 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl"
                        />
                      </div>

                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <PillButton
                            variant="accent"
                            onClick={() => setEditingItem(null)}
                            className="h-12 px-6"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add {activeTab.replace("-", " ")}
                          </PillButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-white/30">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                              {editingItem ? "Edit" : "Add"}{" "}
                              {activeTab.replace("-", " ")}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            {renderAddForm()}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30 mt-6">
                              <PillButton
                                variant="secondary"
                                onClick={() => {
                                  setIsAddDialogOpen(false);
                                  setEditingItem(null);
                                  resetForm();
                                }}
                                className="h-12 px-6"
                              >
                                Cancel
                              </PillButton>
                              <PillButton
                                variant="accent"
                                onClick={() =>
                                  editingItem
                                    ? handleUpdate(activeTab)
                                    : handleAdd(activeTab)
                                }
                                className="h-12 px-6"
                              >
                                {editingItem ? "Update" : "Add"}
                              </PillButton>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <TabsContent value="divisions" className="space-y-4">
                    {divisions.map((division, index) => (
                      <motion.div
                        key={division.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/70 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {division.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Code: {division.code} • Region: {division.region}{" "}
                              • {division.depots} depots
                            </p>
                            {division.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {division.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(division.status)}
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(division)}
                          >
                            <Edit className="w-4 h-4" />
                          </PillButton>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                division.documentId,
                                "division",
                                division.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </PillButton>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="depots" className="space-y-4">
                    {depots.map((depot, index) => (
                      <motion.div
                        key={depot.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/70 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-2xl">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {depot.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Code: {depot.code} • Division: {depot.division} •{" "}
                              {depot.busStations} bus stations
                            </p>
                            <p className="text-xs text-gray-500">
                              {depot.address}
                            </p>
                            {depot.contactPerson && (
                              <p className="text-xs text-gray-500">
                                Contact: {depot.contactPerson}{" "}
                                {depot.phone && `• ${depot.phone}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(depot.status)}
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(depot)}
                          >
                            <Edit className="w-4 h-4" />
                          </PillButton>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                depot.documentId,
                                "depot",
                                depot.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </PillButton>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="bus-stations" className="space-y-4">
                    {busStations.map((station, index) => (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/70 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-2xl">
                            <Bus className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {station.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Depot: {station.depot} • Division:{" "}
                              {station.division} • {station.busStands} bus
                              stands
                            </p>
                            <p className="text-xs text-gray-500">
                              {station.address} • GPS:{" "}
                              {station.latitude.toFixed(4)},{" "}
                              {station.longitude.toFixed(4)}
                            </p>
                            {station.facilities &&
                              Object.entries(station.facilities)
                                .filter(([_, value]) => value === true) // keep only enabled
                                .map(([key]) => key) // get only names
                                .slice(0, 3).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.entries(station.facilities)
                                    .filter(([_, value]) => value === true)
                                    .map(([key]) => key)
                                    .slice(0, 3)
                                    .map((facility, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                                      >
                                        {facility}
                                      </Badge>
                                    ))}
                                  {Object.entries(station.facilities)
                                    .filter(([_, value]) => value === true)
                                    .map(([key]) => key).length > 3 && (
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                      +
                                      {Object.entries(
                                        station.facilities
                                      ).filter(([_, value]) => value === true)
                                        .length - 3}{" "}
                                      more
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(station.status)}
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(station)}
                          >
                            <Edit className="w-4 h-4" />
                          </PillButton>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                station.documentId,
                                "bus-station",
                                station.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </PillButton>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="bus-stands" className="space-y-4">
                    {busStands.map((stand, index) => (
                      <motion.div
                        key={stand.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/70 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-2xl">
                            <Navigation className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {stand.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Platform: {stand.platformNumber} • Station:{" "}
                              {stand.busStation} • Capacity: {stand.capacity}
                            </p>
                            <p className="text-xs text-gray-500">
                              {stand.depot} • {stand.division}
                            </p>
                            {stand.type && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs mt-1">
                                {stand.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(stand.status)}
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(stand)}
                          >
                            <Edit className="w-4 h-4" />
                          </PillButton>
                          <PillButton
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                stand.documentId,
                                "bus-stand",
                                stand.name
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </PillButton>
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>
                </Tabs>
              </ModernCard>
            </motion.div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
