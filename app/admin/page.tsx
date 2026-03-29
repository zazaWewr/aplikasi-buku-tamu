import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin-dashboard'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: guests, error } = await supabase
    .from('guestbook')
    .select('*')
    .order('waktu', { ascending: false })

  return <AdminDashboard initialGuests={guests ?? []} error={error?.message} />
}
