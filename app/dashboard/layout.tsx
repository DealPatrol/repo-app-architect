export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {children}
    </main>
  )
}
