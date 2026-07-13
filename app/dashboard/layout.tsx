import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050F20]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
