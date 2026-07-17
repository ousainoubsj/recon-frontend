export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1128] p-6 text-sm text-slate-400">
          Settings content will go here.
        </div>

        <div className="rounded-2xl border border-[#232D47] bg-[#070F1C]/40 p-4 text-sm text-slate-400">
          Sidebar content will go here.
        </div>
      </div>
    </div>
  )
}
