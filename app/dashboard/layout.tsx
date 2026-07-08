import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
