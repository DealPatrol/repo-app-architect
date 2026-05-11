import { getCurrentUser } from '@/lib/auth'
import { DashboardHeader } from '@/components/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    user = await getCurrentUser()
  } catch {
    // DB unavailable — render unauthenticated state
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Grid background */}
      <div className="fixed inset-0 -z-10 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} 
        />
      </div>
      {/* Glowing orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed top-40 right-1/4 w-72 h-72 bg-orange-500/3 rounded-full blur-3xl -z-10" />
      
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>
    </div>
  )
}
