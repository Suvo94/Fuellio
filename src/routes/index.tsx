import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useIdentity } from '../lib/identity-context'
import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import {
  Fuel,
  Car,
  Bike,
  PlusCircle,
  History,
  BarChart2,
  LogOut,
  Pencil,
  Trash2,
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler
)

export const Route = createFileRoute('/')({
  component: App,
})

type VehicleType = 'car' | 'bike'
type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric'

interface Vehicle {
  id: number
  name: string
  vehicleType: VehicleType
  fuelType: FuelType
  createdAt: string
}

interface Fillup {
  id: number
  vehicleId: number
  fillupDate: string
  fillupTime: string
  fuelPrice: string
  amountPaid: string
  fuelQuantity: string
  odometerReading: string
  notes: string | null
  vehicleName: string
  vehicleType: VehicleType
  fuelType: FuelType
  distance: number | null
  mileage: number | null
}

const FUEL_UNIT: Record<FuelType, string> = {
  petrol: 'L', diesel: 'L', cng: 'kg', electric: 'kWh',
}

const MILEAGE_UNIT: Record<FuelType, string> = {
  petrol: 'km/L', diesel: 'km/L', cng: 'km/kg', electric: 'km/kWh',
}

function App() {
  const { user, ready, logout } = useIdentity()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'add' | 'history' | 'stats'>('add')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fillups, setFillups] = useState<Fillup[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [loadingFillups, setLoadingFillups] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !user) navigate({ to: '/login' })
  }, [ready, user, navigate])

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true)
    const res = await fetch('/api/vehicles')
    if (res.ok) setVehicles(await res.json())
    setLoadingVehicles(false)
  }, [])

  const fetchFillups = useCallback(async (filters?: { vehicleId?: string; dateFrom?: string; dateTo?: string }) => {
    setLoadingFillups(true)
    const params = new URLSearchParams()
    if (filters?.vehicleId) params.set('vehicleId', filters.vehicleId)
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.set('dateTo', filters.dateTo)
    const res = await fetch(`/api/fillups?${params}`)
    if (res.ok) setFillups(await res.json())
    setLoadingFillups(false)
  }, [])

  useEffect(() => {
    if (user) {
      fetchVehicles()
      fetchFillups()
    }
  }, [user, fetchVehicles, fetchFillups])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Fuel className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Fuellio</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1">
            {([
              { key: 'add', label: 'Add Fill-up', icon: PlusCircle },
              { key: 'history', label: 'History', icon: History },
              { key: 'stats', label: 'Statistics', icon: BarChart2 },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {tab === 'add' && (
          <AddSection
            vehicles={vehicles}
            loadingVehicles={loadingVehicles}
            onVehicleAdded={fetchVehicles}
            onFillupAdded={() => fetchFillups()}
            onVehicleDeleted={fetchVehicles}
          />
        )}
        {tab === 'history' && (
          <HistorySection
            vehicles={vehicles}
            fillups={fillups}
            loadingFillups={loadingFillups}
            onFilter={fetchFillups}
            onFillupDeleted={() => fetchFillups()}
            onFillupUpdated={() => fetchFillups()}
          />
        )}
        {tab === 'stats' && (
          <StatsSection vehicles={vehicles} fillups={fillups} loadingFillups={loadingFillups} />
        )}
      </main>
    </div>
  )
}

// ─── Add Section ─────────────────────────────────────────────────────────────

function AddSection({
  vehicles,
  loadingVehicles,
  onVehicleAdded,
  onFillupAdded,
  onVehicleDeleted,
}: {
  vehicles: Vehicle[]
  loadingVehicles: boolean
  onVehicleAdded: () => void
  onFillupAdded: () => void
  onVehicleDeleted: () => void
}) {
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleName, setVehicleName] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')
  const [fuelType, setFuelType] = useState<FuelType>('petrol')
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleSuccess, setVehicleSuccess] = useState(false)

  // Fillup form
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [fillupDate, setFillupDate] = useState(new Date().toISOString().split('T')[0])
  const [fillupTime, setFillupTime] = useState(new Date().toTimeString().slice(0, 5))
  const [fuelPrice, setFuelPrice] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [odometerReading, setOdometerReading] = useState('')
  const [notes, setNotes] = useState('')
  const [fillupLoading, setFillupLoading] = useState(false)
  const [fillupSuccess, setFillupSuccess] = useState(false)
  const [fillupError, setFillupError] = useState('')

  const fuelQuantity = fuelPrice && amountPaid
    ? (parseFloat(amountPaid) / parseFloat(fuelPrice)).toFixed(3)
    : ''

  const selectedVehicle = vehicles.find((v) => v.id === parseInt(selectedVehicleId))

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setVehicleLoading(true)
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: vehicleName, vehicleType, fuelType }),
    })
    setVehicleLoading(false)
    if (res.ok) {
      setVehicleSuccess(true)
      setVehicleName('')
      setShowVehicleForm(false)
      onVehicleAdded()
      setTimeout(() => setVehicleSuccess(false), 3000)
    }
  }

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Delete this vehicle and all its fill-up records?')) return
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    onVehicleDeleted()
  }

  const handleAddFillup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFillupError('')
    if (!selectedVehicleId) { setFillupError('Please select a vehicle.'); return }
    setFillupLoading(true)
    const res = await fetch('/api/fillups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: parseInt(selectedVehicleId),
        fillupDate,
        fillupTime,
        fuelPrice: parseFloat(fuelPrice),
        amountPaid: parseFloat(amountPaid),
        fuelQuantity: parseFloat(fuelQuantity),
        odometerReading: parseFloat(odometerReading),
        notes,
      }),
    })
    setFillupLoading(false)
    if (res.ok) {
      setFillupSuccess(true)
      setFuelPrice('')
      setAmountPaid('')
      setOdometerReading('')
      setNotes('')
      onFillupAdded()
      setTimeout(() => setFillupSuccess(false), 3000)
    } else {
      const d = await res.json()
      setFillupError(d.error || 'Failed to save fill-up.')
    }
  }

  return (
    <div className="space-y-6">
      {/* My Vehicles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Vehicles</h2>
          <button
            onClick={() => setShowVehicleForm(!showVehicleForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {vehicleSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm mb-3">
            <CheckCircle className="w-4 h-4" /> Vehicle added successfully!
          </div>
        )}

        {showVehicleForm && (
          <form onSubmit={handleAddVehicle} className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Name</label>
              <input
                type="text"
                required
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="e.g. Honda City, Pulsar 150"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <div className="flex gap-2">
                  {(['car', 'bike'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setVehicleType(t)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        vehicleType === t
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {t === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={vehicleLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {vehicleLoading ? 'Saving…' : 'Save Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => setShowVehicleForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loadingVehicles ? (
          <div className="text-sm text-gray-400 py-4 text-center">Loading vehicles…</div>
        ) : vehicles.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">No vehicles yet. Add one to get started.</div>
        ) : (
          <div className="space-y-2">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    {v.vehicleType === 'car'
                      ? <Car className="w-5 h-5 text-orange-600" />
                      : <Bike className="w-5 h-5 text-orange-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{v.vehicleType} · {v.fuelType}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteVehicle(v.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Delete vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Fill-up Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Fill-up</h2>

        {fillupSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-sm mb-4">
            <CheckCircle className="w-4 h-4" /> Fill-up recorded successfully!
          </div>
        )}
        {fillupError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            <AlertCircle className="w-4 h-4" /> {fillupError}
          </div>
        )}

        {vehicles.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Add a vehicle first to log fill-ups.</p>
        ) : (
          <form onSubmit={handleAddFillup} className="space-y-4">
            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <div className="relative">
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                >
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.fuelType})</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={fillupDate}
                  onChange={(e) => setFillupDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={fillupTime}
                  onChange={(e) => setFillupTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Fuel Price & Amount Paid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Price (per {selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : 'unit'})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Calculated quantity */}
            {fuelQuantity && (
              <div className="bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-700">
                <span className="font-medium">Fuel quantity: </span>
                {fuelQuantity} {selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : ''}
              </div>
            )}

            {/* Odometer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading (km)</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                placeholder="e.g. 12450.5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Full tank, partial fill, etc."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={fillupLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {fillupLoading ? 'Saving…' : 'Save Fill-up'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── History Section ──────────────────────────────────────────────────────────

function HistorySection({
  vehicles,
  fillups,
  loadingFillups,
  onFilter,
  onFillupDeleted,
  onFillupUpdated,
}: {
  vehicles: Vehicle[]
  fillups: Fillup[]
  loadingFillups: boolean
  onFilter: (filters?: { vehicleId?: string; dateFrom?: string; dateTo?: string }) => void
  onFillupDeleted: () => void
  onFillupUpdated: () => void
}) {
  const [filterVehicleId, setFilterVehicleId] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [editingFillup, setEditingFillup] = useState<Fillup | null>(null)

  const applyFilters = () => {
    onFilter({
      vehicleId: filterVehicleId || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    })
  }

  const clearFilters = () => {
    setFilterVehicleId('')
    setFilterDateFrom('')
    setFilterDateTo('')
    onFilter()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fill-up record?')) return
    await fetch(`/api/fillups/${id}`, { method: 'DELETE' })
    onFillupDeleted()
  }

  const hasFilters = filterVehicleId || filterDateFrom || filterDateTo

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-800">Filter Records</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vehicle</label>
            <div className="relative">
              <select
                value={filterVehicleId}
                onChange={(e) => setFilterVehicleId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
              >
                <option value="">All vehicles</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={applyFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Records */}
      {loadingFillups ? (
        <div className="text-center py-12 text-gray-400">Loading records…</div>
      ) : fillups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No fill-up records found.</div>
      ) : (
        <div className="space-y-3">
          {fillups.map((f) => (
            <FillupCard
              key={f.id}
              fillup={f}
              onEdit={() => setEditingFillup(f)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </div>
      )}

      {editingFillup && (
        <EditModal
          fillup={editingFillup}
          vehicles={vehicles}
          onClose={() => setEditingFillup(null)}
          onSaved={() => { setEditingFillup(null); onFillupUpdated() }}
        />
      )}
    </div>
  )
}

function FillupCard({ fillup: f, onEdit, onDelete }: { fillup: Fillup; onEdit: () => void; onDelete: () => void }) {
  const unit = FUEL_UNIT[f.fuelType]
  const mUnit = MILEAGE_UNIT[f.fuelType]
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{f.vehicleName}</p>
          <p className="text-xs text-gray-400">{f.fillupDate} · {f.fillupTime}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Amount Paid" value={`₹${parseFloat(f.amountPaid).toFixed(2)}`} />
        <Stat label="Qty" value={`${parseFloat(f.fuelQuantity).toFixed(2)} ${unit}`} />
        <Stat label="Odometer" value={`${parseFloat(f.odometerReading).toFixed(0)} km`} />
        <Stat label="Price/Unit" value={`₹${parseFloat(f.fuelPrice).toFixed(2)}/${unit}`} />
        {f.distance !== null && <Stat label="Distance" value={`${f.distance.toFixed(1)} km`} accent />}
        {f.mileage !== null && <Stat label="Mileage" value={`${f.mileage.toFixed(2)} ${mUnit}`} accent />}
      </div>
      {f.notes && <p className="text-xs text-gray-400 mt-2 italic">"{f.notes}"</p>}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${accent ? 'bg-orange-50' : 'bg-gray-50'}`}>
      <p className={`text-xs ${accent ? 'text-orange-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-orange-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function EditModal({
  fillup,
  vehicles,
  onClose,
  onSaved,
}: {
  fillup: Fillup
  vehicles: Vehicle[]
  onClose: () => void
  onSaved: () => void
}) {
  const [vehicleId, setVehicleId] = useState(String(fillup.vehicleId))
  const [fillupDate, setFillupDate] = useState(fillup.fillupDate)
  const [fillupTime, setFillupTime] = useState(fillup.fillupTime)
  const [fuelPrice, setFuelPrice] = useState(fillup.fuelPrice)
  const [amountPaid, setAmountPaid] = useState(fillup.amountPaid)
  const [odometerReading, setOdometerReading] = useState(fillup.odometerReading)
  const [notes, setNotes] = useState(fillup.notes || '')
  const [loading, setLoading] = useState(false)

  const fuelQuantity = fuelPrice && amountPaid
    ? (parseFloat(amountPaid) / parseFloat(fuelPrice)).toFixed(3)
    : ''

  const selectedVehicle = vehicles.find((v) => v.id === parseInt(vehicleId))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/fillups/${fillup.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: parseInt(vehicleId),
        fillupDate,
        fillupTime,
        fuelPrice: parseFloat(fuelPrice),
        amountPaid: parseFloat(amountPaid),
        fuelQuantity: parseFloat(fuelQuantity),
        odometerReading: parseFloat(odometerReading),
        notes,
      }),
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Edit Fill-up</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" required value={fillupDate} onChange={(e) => setFillupDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
              <input type="time" required value={fillupTime} onChange={(e) => setFillupTime(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price/Unit</label>
              <input type="number" required min="0" step="0.01" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount Paid</label>
              <input type="number" required min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          {fuelQuantity && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
              Qty: {fuelQuantity} {selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : ''}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Odometer (km)</label>
            <input type="number" required min="0" step="0.1" value={odometerReading} onChange={(e) => setOdometerReading(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 rounded-lg">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection({
  vehicles,
  fillups,
  loadingFillups,
}: {
  vehicles: Vehicle[]
  fillups: Fillup[]
  loadingFillups: boolean
}) {
  const [filterVehicleId, setFilterVehicleId] = useState('')

  const filteredFillups = filterVehicleId
    ? fillups.filter((f) => f.vehicleId === parseInt(filterVehicleId))
    : fillups

  // Summary stats
  const totalSpend = filteredFillups.reduce((s, f) => s + parseFloat(f.amountPaid), 0)
  const totalQty = filteredFillups.reduce((s, f) => s + parseFloat(f.fuelQuantity), 0)
  const totalDistance = filteredFillups.reduce((s, f) => s + (f.distance ?? 0), 0)
  const avgMileage = filteredFillups.filter((f) => f.mileage !== null).length
    ? filteredFillups.filter((f) => f.mileage !== null).reduce((s, f) => s + f.mileage!, 0) /
      filteredFillups.filter((f) => f.mileage !== null).length
    : null

  // Group by month for charts
  const byMonth: Record<string, { spend: number; qty: number; count: number }> = {}
  filteredFillups.forEach((f) => {
    const month = f.fillupDate.slice(0, 7) // YYYY-MM
    if (!byMonth[month]) byMonth[month] = { spend: 0, qty: 0, count: 0 }
    byMonth[month].spend += parseFloat(f.amountPaid)
    byMonth[month].qty += parseFloat(f.fuelQuantity)
    byMonth[month].count += 1
  })
  const months = Object.keys(byMonth).sort()
  const spendData = months.map((m) => byMonth[m].spend)
  const qtyData = months.map((m) => byMonth[m].qty)

  // Mileage trend
  const mileageData = filteredFillups
    .filter((f) => f.mileage !== null)
    .map((f) => ({ date: f.fillupDate, mileage: f.mileage! }))
    .reverse()

  const selectedVehicle = vehicles.find((v) => v.id === parseInt(filterVehicleId))
  const mUnit = selectedVehicle ? MILEAGE_UNIT[selectedVehicle.fuelType] : 'km/L'
  const unit = selectedVehicle ? FUEL_UNIT[selectedVehicle.fuelType] : 'L'

  if (loadingFillups) return <div className="text-center py-12 text-gray-400">Loading statistics…</div>

  return (
    <div className="space-y-6">
      {/* Vehicle filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Vehicle</label>
        <div className="relative max-w-xs">
          <select
            value={filterVehicleId}
            onChange={(e) => setFilterVehicleId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
          >
            <option value="">All vehicles</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {filteredFillups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No data to display. Add some fill-up records first.</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Spend" value={`₹${totalSpend.toFixed(0)}`} color="orange" />
            <SummaryCard label="Total Fuel" value={`${totalQty.toFixed(1)} ${unit}`} color="blue" />
            <SummaryCard label="Distance" value={`${totalDistance.toFixed(0)} km`} color="emerald" />
            <SummaryCard
              label="Avg Mileage"
              value={avgMileage ? `${avgMileage.toFixed(1)} ${mUnit}` : '—'}
              color="violet"
            />
          </div>

          {/* Monthly Spend chart */}
          {months.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Spend (₹)</h3>
              <Bar
                data={{
                  labels: months,
                  datasets: [{
                    label: 'Spend (₹)',
                    data: spendData,
                    backgroundColor: 'rgba(249, 115, 22, 0.75)',
                    borderRadius: 6,
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
              />
            </div>
          )}

          {/* Mileage trend */}
          {mileageData.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Mileage Trend ({mUnit})</h3>
              <Line
                data={{
                  labels: mileageData.map((d) => d.date),
                  datasets: [{
                    label: `Mileage (${mUnit})`,
                    data: mileageData.map((d) => +d.mileage.toFixed(2)),
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(249, 115, 22)',
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }}
              />
            </div>
          )}

          {/* Monthly quantity chart */}
          {months.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Fuel Quantity ({unit})</h3>
              <Bar
                data={{
                  labels: months,
                  datasets: [{
                    label: `Fuel (${unit})`,
                    data: qtyData,
                    backgroundColor: 'rgba(59, 130, 246, 0.75)',
                    borderRadius: 6,
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
