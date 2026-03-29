import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, instansi } = body

    if (!nama || !instansi) {
      return NextResponse.json({ error: 'Nama dan instansi wajib diisi' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('guestbook')
      .insert({
        nama: nama.trim(),
        instansi: instansi.trim(),
        waktu: new Date().toISOString(),
      })

    if (error) {
      console.error('[v0] Supabase insert error:', error)
      return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[v0] Unexpected error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('waktu', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[v0] Unexpected error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
