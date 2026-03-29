'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode, Users, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [formUrl, setFormUrl] = useState('')

  useEffect(() => {
    const url = `${window.location.origin}/tamu`
    setFormUrl(url)
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
    }
  }, [])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'qr-buku-tamu.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Buku Tamu Digital</span>
          </div>
          <a href="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="w-4 h-4" />
              Admin
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center space-y-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-2">
            <ClipboardCheck className="w-4 h-4" />
            Sistem Kunjungan Modern
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground text-balance leading-tight">
            Scan QR Code untuk<br />
            <span className="text-primary">Isi Buku Tamu</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto text-pretty">
            Arahkan kamera ponsel ke QR code di bawah ini untuk mengisi buku tamu kunjungan secara digital.
          </p>
        </div>

        {/* QR Card */}
        <div className="mt-12 animate-fade-in">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 flex flex-col items-center gap-6 w-fit mx-auto">
            {/* Decorative corners */}
            <div className="relative">
              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              <div className="bg-white rounded-2xl p-4 shadow-inner">
                <canvas ref={canvasRef} className="rounded-xl block" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Buku Tamu Digital</p>
              <p className="text-xs text-muted-foreground font-mono break-all max-w-[260px]">{formUrl}</p>
            </div>

            <Button
              onClick={handleDownload}
              className="gap-2 w-full"
            >
              <Download className="w-4 h-4" />
              Unduh QR Code
            </Button>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-16 max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Scan QR Code',
              desc: 'Arahkan kamera ponsel ke QR code yang tersedia di meja penerimaan tamu.',
            },
            {
              step: '02',
              title: 'Isi Formulir',
              desc: 'Lengkapi data nama dan instansi/asal instansi Anda pada formulir digital.',
            },
            {
              step: '03',
              title: 'Selesai',
              desc: 'Data kunjungan Anda tersimpan otomatis dan dapat dilihat oleh admin.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-card rounded-2xl border border-border p-6 text-left animate-fade-in"
            >
              <span className="text-4xl font-black text-primary/20 font-mono">{item.step}</span>
              <h3 className="font-bold text-foreground mt-2 mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Buku Tamu Digital. Semua hak dilindungi.
      </footer>
    </main>
  )
}
