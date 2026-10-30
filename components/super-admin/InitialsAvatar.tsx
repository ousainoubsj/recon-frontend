export default function InitialsAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-500 text-xs font-medium uppercase text-white"
    >
      {name.slice(0, 2)}
    </span>
  )
}
