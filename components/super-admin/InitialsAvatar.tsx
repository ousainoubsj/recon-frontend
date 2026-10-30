import Image from 'next/image'
import { cn } from '@/lib/utils'

// Shows the photo when there is one, otherwise the first two letters of the name.
export default function InitialsAvatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  if (image) {
    return <Image src={image} alt="" width={64} height={64} className={cn('h-8 w-8 shrink-0 rounded-full object-cover', className)} />
  }
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-500 text-xs font-medium uppercase text-white',
        className,
      )}
    >
      {name.slice(0, 2)}
    </span>
  )
}
