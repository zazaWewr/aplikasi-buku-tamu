'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2, QrCode, User, Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  instansi: z.string().min(2, 'Instansi minimal 2 karakter').max(150, 'Instansi terlalu panjang'),
})

type FormData = z.infer<typeof schema>

export default function TamuPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tamu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Gagal menyimpan data')
      }
      setSubmitted(true)
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
            <QrCode className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Buku Tamu Digital</h1>
          <p className="text-muted-foreground mt-1 text-sm">Silakan lengkapi data kunjungan Anda</p>
        </div>

        {!submitted ? (
          <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-semibold text-foreground">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nama"
                    {...register('nama')}
                    placeholder="Masukkan nama lengkap Anda"
                    className="pl-10 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/30"
                    disabled={loading}
                  />
                </div>
                {errors.nama && (
                  <p className="text-destructive text-xs mt-1">{errors.nama.message}</p>
                )}
              </div>

              {/* Instansi */}
              <div className="space-y-2">
                <Label htmlFor="instansi" className="text-sm font-semibold text-foreground">
                  Instansi / Asal
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="instansi"
                    {...register('instansi')}
                    placeholder="Contoh: PT. Maju Bersama"
                    className="pl-10 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/30"
                    disabled={loading}
                  />
                </div>
                {errors.instansi && (
                  <p className="text-destructive text-xs mt-1">{errors.instansi.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold gap-2 text-base mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Kirim Data Kunjungan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
              Data Anda akan tersimpan secara aman dan hanya digunakan untuk keperluan pencatatan kunjungan.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border shadow-xl p-10 text-center animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Terima Kasih!</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
              Data kunjungan Anda telah berhasil disimpan. Selamat datang!
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="rounded-xl h-11 px-6"
            >
              Isi Lagi
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
