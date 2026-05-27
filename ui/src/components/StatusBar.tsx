import { cn } from '@/lib/utils'

type Status = 'ready' | 'running' | 'ok' | 'error'

interface StatusBarProps {
  status:  Status
  cursorLine: number
  cursorCol:  number
  resource:   string
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  ready:   { label: '● Ready',      color: 'text-muted-foreground' },
  running: { label: '● Executing…', color: 'text-yellow-400' },
  ok:      { label: '● OK',         color: 'text-green-400' },
  error:   { label: '● Error',      color: 'text-red-400' },
}

export function StatusBar({ status, cursorLine, cursorCol, resource }: StatusBarProps) {
  const { label, color } = statusConfig[status]

  return (
    <div className="flex items-center justify-between h-6 px-3 bg-blue-700 shrink-0 text-[11px] text-blue-100">
      <div className="flex items-center gap-3">
        <span className={cn('font-medium', color)}>{label}</span>
        <span className="opacity-70">|</span>
        <span>Ln {cursorLine}, Col {cursorCol}</span>
      </div>
      <div className="flex items-center gap-3 opacity-80">
        <span>{resource}</span>
        <span>|</span>
        <span>Lua 5.4</span>
        <span>|</span>
        <span>Client-side</span>
        <span>|</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
