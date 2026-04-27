import Link from 'next/link'
import { Layers } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AppLogoProps {
  href?: string
  className?: string
  markClassName?: string
  textClassName?: string
}

export function AppLogo({
  href = '/',
  className,
  markClassName,
  textClassName,
}: AppLogoProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shadow-sm',
          markClassName,
        )}
      >
        <Layers className="h-5 w-5 text-background" />
      </div>
      <span className={cn('font-semibold text-lg tracking-tight', textClassName)}>
        CodeVault
      </span>
    </Link>
  )
}
