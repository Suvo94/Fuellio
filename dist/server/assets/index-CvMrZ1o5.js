import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { u as useIdentity } from "./router-CQWpJNqZ.js";
import { useState, useEffect, useCallback } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Fuel, LogOut, PlusCircle, History, BarChart2, CheckCircle, Car, Bike, Trash2, AlertCircle, ChevronDown, Filter, X, Pencil } from "lucide-react";
import "@netlify/identity";
import "chart.js";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "drizzle-orm";
const FUEL_UNIT = {
  petrol: "L",
  diesel: "L",
  cng: "kg",
  electric: "kWh"
};
const MILEAGE_UNIT = {
  petrol: "km/L",
  diesel: "km/L",
  cng: "km/kg",
  electric: "km/kWh"
};
function App() {
  const {
    user,
    ready,
    logout
  } = useIdentity();
  const navigate = useNavigate();
  const [tab, setTab] = useState("add");
  const [vehicles, setVehicles] = useState([]);
  const [fillups, setFillups] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingFillups, setLoadingFillups] = useState(true);
  useEffect(() => {
    if (ready && !user) navigate({
      to: "/login"
    });
  }, [ready, user, navigate]);
  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    const res = await fetch("/api/vehicles");
    if (res.ok) setVehicles(await res.json());
    setLoadingVehicles(false);
  }, []);
  const fetchFillups = useCallback(async (filters) => {
    setLoadingFillups(true);
    const params = new URLSearchParams();
    if (filters?.vehicleId) params.set("vehicleId", filters.vehicleId);
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters?.dateTo) params.set("dateTo", filters.dateTo);
    const res = await fetch(`/api/fillups?${params}`);
    if (res.ok) setFillups(await res.json());
    setLoadingFillups(false);
  }, []);
  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchFillups();
    }
  }, [user, fetchVehicles, fetchFillups]);
  const handleLogout = async () => {
    await logout();
    navigate({
      to: "/login"
    });
  };
  if (!ready || !user) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-orange-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Loading…" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-30", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx(Fuel, { className: "w-4 h-4 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900 text-lg", children: "Fuellio" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500 hidden sm:block", children: user.email }),
        /* @__PURE__ */ jsxs("button", { onClick: handleLogout, className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:block", children: "Sign out" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4", children: /* @__PURE__ */ jsx("nav", { className: "flex gap-1", children: [{
      key: "add",
      label: "Add Fill-up",
      icon: PlusCircle
    }, {
      key: "history",
      label: "History",
      icon: History
    }, {
      key: "stats",
      label: "Statistics",
      icon: BarChart2
    }].map(({
      key,
      label,
      icon: Icon
    }) => /* @__PURE__ */ jsxs("button", { onClick: () => setTab(key), className: `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`, children: [
      /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
      label
    ] }, key)) }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 max-w-5xl mx-auto w-full px-4 py-6", children: [
      tab === "add" && /* @__PURE__ */ jsx(AddSection, { vehicles, loadingVehicles, onVehicleAdded: fetchVehicles, onFillupAdded: () => fetchFillups(), onVehicleDeleted: fetchVehicles }),
      tab === "history" && /* @__PURE__ */ jsx(HistorySection, { vehicles, fillups, loadingFillups, onFilter: fetchFillups, onFillupDeleted: () => fetchFillups(), onFillupUpdated: () => fetchFillups() }),
      tab === "stats" && /* @__PURE__ */ jsx(StatsSection, { vehicles, fillups, loadingFillups })
    ] })
  ] });
}
function AddSection({
  vehicles,
  loadingVehicles,
  onVehicleAdded,
  onFillupAdded,
  onVehicleDeleted
}) {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [fuelType, setFuelType] = useState("petrol");
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleSuccess, setVehicleSuccess] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [fillupDate, setFillupDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [fillupTime, setFillupTime] = useState((/* @__PURE__ */ new Date()).toTimeString().slice(0, 5));
  const [fuelPrice, setFuelPrice] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [odometerReading, setOdometerReading] = useState("");
  const [notes, setNotes] = useState("");
  const [fillupLoading, setFillupLoading] = useState(false);
  const [fillupSuccess, setFillupSuccess] = useState(false);
  const [fillupError, setFillupError] = useState("");
  const fuelQuantity = fuelPrice && amountPaid ? (parseFloat(amountPaid) / parseFloat(fuelPrice)).toFixed(3) : "";
  const selectedVehicle = vehicles.find((v) => v.id === parseInt(selectedVehicleId));
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleLoading(true);
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: vehicleName,
        vehicleType,
        fuelType
      })
    });
    setVehicleLoading(false);
    if (res.ok) {
      setVehicleSuccess(true);
      setVehicleName("");
      setShowVehicleForm(false);
      onVehicleAdded();
      setTimeout(() => setVehicleSuccess(false), 3e3);
    }
  };
  const handleDeleteVehicle = async (id) => {
    if (!confirm("Delete this vehicle and all its fill-up records?")) return;
    await fetch(`/api/vehicles/${id}`, {
      method: "DELETE"
    });
    onVehicleDeleted();
  };
  const handleAddFillup = async (e) => {
    e.preventDefault();
    setFillupError("");
    if (!selectedVehicleId) {
      setFillupError("Please select a vehicle.");
      return;
    }
    setFillupLoading(true);
    const res = await fetch("/api/fillups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vehicleId: parseInt(selectedVehicleId),
        fillupDate,
        fillupTime,
        fuelPrice: parseFloat(fuelPrice),
        amountPaid: parseFloat(amountPaid),
        fuelQuantity: parseFloat(fuelQuantity),
        odometerReading: parseFloat(odometerReading),
        notes
      })
    });
    setFillupLoading(false);
    if (res.ok) {
      setFillupSuccess(true);
      setFuelPrice("");
      setAmountPaid("");
      setOdometerReading("");
      setNotes("");
      onFillupAdded();
      setTimeout(() => setFillupSuccess(false), 3e3);
    } else {
      const d = await res.json();
      setFillupError(d.error || "Failed to save fill-up.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "My Vehicles" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowVehicleForm(!showVehicleForm), className: "flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700", children: [
          /* @__PURE__ */ jsx(PlusCircle, { className: "w-4 h-4" }),
          "Add Vehicle"
        ] })
      ] }),
      vehicleSuccess && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm mb-3", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
        " Vehicle added successfully!"
      ] }),
      showVehicleForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleAddVehicle, className: "bg-orange-50 rounded-xl p-4 mb-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Vehicle Name" }),
          /* @__PURE__ */ jsx("input", { type: "text", required: true, value: vehicleName, onChange: (e) => setVehicleName(e.target.value), placeholder: "e.g. Honda City, Pulsar 150", className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Type" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["car", "bike"].map((t) => /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setVehicleType(t), className: `flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${vehicleType === t ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`, children: [
              t === "car" ? /* @__PURE__ */ jsx(Car, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Bike, { className: "w-3 h-3" }),
              t.charAt(0).toUpperCase() + t.slice(1)
            ] }, t)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Fuel Type" }),
            /* @__PURE__ */ jsxs("select", { value: fuelType, onChange: (e) => setFuelType(e.target.value), className: "w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400", children: [
              /* @__PURE__ */ jsx("option", { value: "petrol", children: "Petrol" }),
              /* @__PURE__ */ jsx("option", { value: "diesel", children: "Diesel" }),
              /* @__PURE__ */ jsx("option", { value: "cng", children: "CNG" }),
              /* @__PURE__ */ jsx("option", { value: "electric", children: "Electric" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: vehicleLoading, className: "bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60", children: vehicleLoading ? "Saving…" : "Save Vehicle" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowVehicleForm(false), className: "text-sm text-gray-500 hover:text-gray-700 px-3 py-2", children: "Cancel" })
        ] })
      ] }),
      loadingVehicles ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 py-4 text-center", children: "Loading vehicles…" }) : vehicles.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400 py-4 text-center", children: "No vehicles yet. Add one to get started." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: vehicles.map((v) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center", children: v.vehicleType === "car" ? /* @__PURE__ */ jsx(Car, { className: "w-5 h-5 text-orange-600" }) : /* @__PURE__ */ jsx(Bike, { className: "w-5 h-5 text-orange-600" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900", children: v.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 capitalize", children: [
              v.vehicleType,
              " · ",
              v.fuelType
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteVehicle(v.id), className: "text-gray-300 hover:text-red-500 transition-colors p-1", title: "Delete vehicle", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
      ] }, v.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Add Fill-up" }),
      fillupSuccess && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm mb-4", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
        " Fill-up recorded successfully!"
      ] }),
      fillupError && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm mb-4", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }),
        " ",
        fillupError
      ] }),
      vehicles.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 py-4 text-center", children: "Add a vehicle first to log fill-ups." }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleAddFillup, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vehicle" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs("select", { required: true, value: selectedVehicleId, onChange: (e) => setSelectedVehicleId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select vehicle…" }),
              vehicles.map((v) => /* @__PURE__ */ jsxs("option", { value: v.id, children: [
                v.name,
                " (",
                v.fuelType,
                ")"
              ] }, v.id))
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }),
            /* @__PURE__ */ jsx("input", { type: "date", required: true, value: fillupDate, onChange: (e) => setFillupDate(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Time" }),
            /* @__PURE__ */ jsx("input", { type: "time", required: true, value: fillupTime, onChange: (e) => setFillupTime(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
              "Fuel Price (per ",
              selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : "unit",
              ")"
            ] }),
            /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.01", value: fuelPrice, onChange: (e) => setFuelPrice(e.target.value), placeholder: "0.00", className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Amount Paid (₹)" }),
            /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.01", value: amountPaid, onChange: (e) => setAmountPaid(e.target.value), placeholder: "0.00", className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
          ] })
        ] }),
        fuelQuantity && /* @__PURE__ */ jsxs("div", { className: "bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-700", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Fuel quantity: " }),
          fuelQuantity,
          " ",
          selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : ""
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Odometer Reading (km)" }),
          /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.1", value: odometerReading, onChange: (e) => setOdometerReading(e.target.value), placeholder: "e.g. 12450.5", className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes (optional)" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Full tank, partial fill, etc.", className: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: fillupLoading, className: "w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors", children: fillupLoading ? "Saving…" : "Save Fill-up" })
      ] })
    ] })
  ] });
}
function HistorySection({
  vehicles,
  fillups,
  loadingFillups,
  onFilter,
  onFillupDeleted,
  onFillupUpdated
}) {
  const [filterVehicleId, setFilterVehicleId] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [editingFillup, setEditingFillup] = useState(null);
  const applyFilters = () => {
    onFilter({
      vehicleId: filterVehicleId || void 0,
      dateFrom: filterDateFrom || void 0,
      dateTo: filterDateTo || void 0
    });
  };
  const clearFilters = () => {
    setFilterVehicleId("");
    setFilterDateFrom("");
    setFilterDateTo("");
    onFilter();
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this fill-up record?")) return;
    await fetch(`/api/fillups/${id}`, {
      method: "DELETE"
    });
    onFillupDeleted();
  };
  const hasFilters = filterVehicleId || filterDateFrom || filterDateTo;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-gray-500" }),
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-800", children: "Filter Records" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Vehicle" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs("select", { value: filterVehicleId, onChange: (e) => setFilterVehicleId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All vehicles" }),
              vehicles.map((v) => /* @__PURE__ */ jsx("option", { value: v.id, children: v.name }, v.id))
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "From Date" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: filterDateFrom, onChange: (e) => setFilterDateFrom(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "To Date" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: filterDateTo, onChange: (e) => setFilterDateTo(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: applyFilters, className: "bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg", children: "Apply" }),
        hasFilters && /* @__PURE__ */ jsxs("button", { onClick: clearFilters, className: "flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5", children: [
          /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" }),
          " Clear"
        ] })
      ] })
    ] }),
    loadingFillups ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-400", children: "Loading records…" }) : fillups.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-400", children: "No fill-up records found." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: fillups.map((f) => /* @__PURE__ */ jsx(FillupCard, { fillup: f, onEdit: () => setEditingFillup(f), onDelete: () => handleDelete(f.id) }, f.id)) }),
    editingFillup && /* @__PURE__ */ jsx(EditModal, { fillup: editingFillup, vehicles, onClose: () => setEditingFillup(null), onSaved: () => {
      setEditingFillup(null);
      onFillupUpdated();
    } })
  ] });
}
function FillupCard({
  fillup: f,
  onEdit,
  onDelete
}) {
  const unit = FUEL_UNIT[f.fuelType];
  const mUnit = MILEAGE_UNIT[f.fuelType];
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: f.vehicleName }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
          f.fillupDate,
          " · ",
          f.fillupTime
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("button", { onClick: onEdit, className: "p-1.5 text-gray-400 hover:text-orange-500 transition-colors", title: "Edit", children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx("button", { onClick: onDelete, className: "p-1.5 text-gray-400 hover:text-red-500 transition-colors", title: "Delete", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Amount Paid", value: `₹${parseFloat(f.amountPaid).toFixed(2)}` }),
      /* @__PURE__ */ jsx(Stat, { label: "Qty", value: `${parseFloat(f.fuelQuantity).toFixed(2)} ${unit}` }),
      /* @__PURE__ */ jsx(Stat, { label: "Odometer", value: `${parseFloat(f.odometerReading).toFixed(0)} km` }),
      /* @__PURE__ */ jsx(Stat, { label: "Price/Unit", value: `₹${parseFloat(f.fuelPrice).toFixed(2)}/${unit}` }),
      f.distance !== null && /* @__PURE__ */ jsx(Stat, { label: "Distance", value: `${f.distance.toFixed(1)} km`, accent: true }),
      f.mileage !== null && /* @__PURE__ */ jsx(Stat, { label: "Mileage", value: `${f.mileage.toFixed(2)} ${mUnit}`, accent: true })
    ] }),
    f.notes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-2 italic", children: [
      '"',
      f.notes,
      '"'
    ] })
  ] });
}
function Stat({
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-lg px-3 py-2 ${accent ? "bg-orange-50" : "bg-gray-50"}`, children: [
    /* @__PURE__ */ jsx("p", { className: `text-xs ${accent ? "text-orange-500" : "text-gray-400"}`, children: label }),
    /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold ${accent ? "text-orange-700" : "text-gray-900"}`, children: value })
  ] });
}
function EditModal({
  fillup,
  vehicles,
  onClose,
  onSaved
}) {
  const [vehicleId, setVehicleId] = useState(String(fillup.vehicleId));
  const [fillupDate, setFillupDate] = useState(fillup.fillupDate);
  const [fillupTime, setFillupTime] = useState(fillup.fillupTime);
  const [fuelPrice, setFuelPrice] = useState(fillup.fuelPrice);
  const [amountPaid, setAmountPaid] = useState(fillup.amountPaid);
  const [odometerReading, setOdometerReading] = useState(fillup.odometerReading);
  const [notes, setNotes] = useState(fillup.notes || "");
  const [loading, setLoading] = useState(false);
  const fuelQuantity = fuelPrice && amountPaid ? (parseFloat(amountPaid) / parseFloat(fuelPrice)).toFixed(3) : "";
  const selectedVehicle = vehicles.find((v) => v.id === parseInt(vehicleId));
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/fillups/${fillup.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vehicleId: parseInt(vehicleId),
        fillupDate,
        fillupTime,
        fuelPrice: parseFloat(fuelPrice),
        amountPaid: parseFloat(amountPaid),
        fuelQuantity: parseFloat(fuelQuantity),
        odometerReading: parseFloat(odometerReading),
        notes
      })
    });
    setLoading(false);
    onSaved();
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-md p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Edit Fill-up" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Vehicle" }),
        /* @__PURE__ */ jsx("select", { value: vehicleId, onChange: (e) => setVehicleId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400", children: vehicles.map((v) => /* @__PURE__ */ jsx("option", { value: v.id, children: v.name }, v.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Date" }),
          /* @__PURE__ */ jsx("input", { type: "date", required: true, value: fillupDate, onChange: (e) => setFillupDate(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Time" }),
          /* @__PURE__ */ jsx("input", { type: "time", required: true, value: fillupTime, onChange: (e) => setFillupTime(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Price/Unit" }),
          /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.01", value: fuelPrice, onChange: (e) => setFuelPrice(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Amount Paid" }),
          /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.01", value: amountPaid, onChange: (e) => setAmountPaid(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
        ] })
      ] }),
      fuelQuantity && /* @__PURE__ */ jsxs("p", { className: "text-xs text-orange-600 bg-orange-50 rounded px-2 py-1", children: [
        "Qty: ",
        fuelQuantity,
        " ",
        selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : ""
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Odometer (km)" }),
        /* @__PURE__ */ jsx("input", { type: "number", required: true, min: "0", step: "0.1", value: odometerReading, onChange: (e) => setOdometerReading(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Notes" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: notes, onChange: (e) => setNotes(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 rounded-lg", children: loading ? "Saving…" : "Save Changes" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg", children: "Cancel" })
      ] })
    ] })
  ] }) });
}
function StatsSection({
  vehicles,
  fillups,
  loadingFillups
}) {
  const [filterVehicleId, setFilterVehicleId] = useState("");
  const filteredFillups = filterVehicleId ? fillups.filter((f) => f.vehicleId === parseInt(filterVehicleId)) : fillups;
  const totalSpend = filteredFillups.reduce((s, f) => s + parseFloat(f.amountPaid), 0);
  const totalQty = filteredFillups.reduce((s, f) => s + parseFloat(f.fuelQuantity), 0);
  const totalDistance = filteredFillups.reduce((s, f) => s + (f.distance ?? 0), 0);
  const avgMileage = filteredFillups.filter((f) => f.mileage !== null).length ? filteredFillups.filter((f) => f.mileage !== null).reduce((s, f) => s + f.mileage, 0) / filteredFillups.filter((f) => f.mileage !== null).length : null;
  const byMonth = {};
  filteredFillups.forEach((f) => {
    const month = f.fillupDate.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = {
      spend: 0,
      qty: 0,
      count: 0
    };
    byMonth[month].spend += parseFloat(f.amountPaid);
    byMonth[month].qty += parseFloat(f.fuelQuantity);
    byMonth[month].count += 1;
  });
  const months = Object.keys(byMonth).sort();
  const spendData = months.map((m) => byMonth[m].spend);
  const qtyData = months.map((m) => byMonth[m].qty);
  const mileageData = filteredFillups.filter((f) => f.mileage !== null).map((f) => ({
    date: f.fillupDate,
    mileage: f.mileage
  })).reverse();
  const selectedVehicle = vehicles.find((v) => v.id === parseInt(filterVehicleId));
  const mUnit = selectedVehicle ? MILEAGE_UNIT[selectedVehicle.fuelType] : "km/L";
  const unit = selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : "L";
  if (loadingFillups) return /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-400", children: "Loading statistics…" });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter by Vehicle" }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-xs", children: [
        /* @__PURE__ */ jsxs("select", { value: filterVehicleId, onChange: (e) => setFilterVehicleId(e.target.value), className: "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "All vehicles" }),
          vehicles.map((v) => /* @__PURE__ */ jsx("option", { value: v.id, children: v.name }, v.id))
        ] }),
        /* @__PURE__ */ jsx(ChevronDown, { className: "w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" })
      ] })
    ] }),
    filteredFillups.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-400", children: "No data to display. Add some fill-up records first." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx(SummaryCard, { label: "Total Spend", value: `₹${totalSpend.toFixed(0)}`, color: "orange" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "Total Fuel", value: `${totalQty.toFixed(1)} ${unit}`, color: "blue" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "Distance", value: `${totalDistance.toFixed(0)} km`, color: "emerald" }),
        /* @__PURE__ */ jsx(SummaryCard, { label: "Avg Mileage", value: avgMileage ? `${avgMileage.toFixed(1)} ${mUnit}` : "—", color: "violet" })
      ] }),
      months.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Monthly Spend (₹)" }),
        /* @__PURE__ */ jsx(Bar, { data: {
          labels: months,
          datasets: [{
            label: "Spend (₹)",
            data: spendData,
            backgroundColor: "rgba(249, 115, 22, 0.75)",
            borderRadius: 6
          }]
        }, options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        } })
      ] }),
      mileageData.length > 1 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-gray-900 mb-4", children: [
          "Mileage Trend (",
          mUnit,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Line, { data: {
          labels: mileageData.map((d) => d.date),
          datasets: [{
            label: `Mileage (${mUnit})`,
            data: mileageData.map((d) => +d.mileage.toFixed(2)),
            borderColor: "rgb(249, 115, 22)",
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(249, 115, 22)"
          }]
        }, options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        } })
      ] }),
      months.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-gray-900 mb-4", children: [
          "Monthly Fuel Quantity (",
          unit,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Bar, { data: {
          labels: months,
          datasets: [{
            label: `Fuel (${unit})`,
            data: qtyData,
            backgroundColor: "rgba(59, 130, 246, 0.75)",
            borderRadius: 6
          }]
        }, options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        } })
      ] })
    ] })
  ] });
}
function SummaryCard({
  label,
  value,
  color
}) {
  const colors = {
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700"
  };
  return /* @__PURE__ */ jsxs("div", { className: `rounded-2xl p-5 ${colors[color]}`, children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-medium opacity-70 mb-1", children: label }),
    /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: value })
  ] });
}
export {
  App as component
};
