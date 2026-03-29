'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Download,
  QrCode,
  Calendar,
  Building2,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Guest {
  id: number
  nama: string
  instansi: string
  waktu: string
}

interface Props {
  initialGuests: Guest[]
  error?: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDateGroup(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hari Ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function downloadCSV(guests: Guest[]) {
  const header = 'No,Nama,Instansi,Tanggal,Waktu\n'
  const rows = guests
    .map((g, i) => `${i + 1},"${g.nama}","${g.instansi}","${formatDate(g.waktu)}","${formatTime(g.waktu)}"`)
    .join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `buku-tamu-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard({ initialGuests, error }: Props) {
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [guests, setGuests] = useState<Guest[]>(initialGuests)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/tamu')
      const body = await res.json()
      if (body.data) setGuests(body.data)
    } finally {
      setRefreshing(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return guests
    const q = search.toLowerCase()
    return guests.filter(
      (g) =>
        g.nama.toLowerCase().includes(q) ||
        g.instansi.toLowerCase().includes(q)
    )
  }, [guests, search])

  // Stats
  const today = new Date().toDateString()
  const todayCount = guests.filter((g) => new Date(g.waktu).toDateString() === today).length
  const uniqueInstansi = new Set(guests.map((g) => g.instansi)).size

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Guest[]> = {}
    filtered.forEach((g) => {
      const key = formatDateGroup(g.waktu)
      if (!map[key]) map[key] = []
      map[key].push(g)
    })
    return map
  }, [filtered])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </a>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground">Dashboard Admin</span>
              <p className="text-xs text-muted-foreground">Buku Tamu Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => downloadCSV(filtered)}
              disabled={filtered.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-primary" />}
            label="Total Tamu"
            value={guests.length}
            bg="bg-primary/10"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-green-600" />}
            label="Kunjungan Hari Ini"
            value={todayCount}
            bg="bg-green-50 dark:bg-green-950/30"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            label="Instansi Unik"
            value={uniqueInstansi}
            bg="bg-orange-50 dark:bg-orange-950/30"
          />
        </div>

        {/* Search & Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-foreground text-lg">Data Kunjungan</h2>
              <p className="text-sm text-muted-foreground">{filtered.length} data ditemukan</p>
            </div>
            <div className="sm:ml-auto relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau instansi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl"
              />
            </div>
          </div>

          {error ? (
            <div className="p-12 text-center text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                {search ? 'Tidak ada hasil yang cocok' : 'Belum ada data kunjungan'}
              </p>
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">No</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instansi</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((guest, idx) => (
                      <tr
                        key={guest.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                              {guest.nama.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground text-sm">{guest.nama}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            {guest.instansi}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="gap-1 font-mono text-xs">
                            <Calendar className="w-3 h-3" />
                            {formatDate(guest.waktu)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(guest.waktu)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {Object.entries(grouped).map(([dateLabel, dayGuests]) => (
                  <div key={dateLabel}>
                    <div className="px-5 py-2.5 bg-muted/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</p>
                    </div>
                    {dayGuests.map((guest) => (
                      <div key={guest.id} className="px-5 py-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {guest.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{guest.nama}</p>
                          <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {guest.instansi}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(guest.waktu)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-extrabold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}
