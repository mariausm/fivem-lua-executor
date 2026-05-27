import { Zap, Code2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface HeaderProps {
  snippetsOpen: boolean
  onSnippetsToggle: () => void
  onClose: () => void
  onMouseDown: (e: React.MouseEvent) => void
}

export function Header({ snippetsOpen, onSnippetsToggle, onClose, onMouseDown }: HeaderProps) {
  return (
    <div
      className="flex items-center justify-between h-11 px-4 bg-[hsl(220_13%_13%)] border-b border-border select-none cursor-grab active:cursor-grabbing shrink-0"
      onMouseDown={onMouseDown}
    >
      {/* Left */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30">
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">Lua Executor</span>
        <Badge variant="blue" className="text-[10px] tracking-widest">DEV</Badge>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={snippetsOpen ? 'outline' : 'ghost'}
              size="sm"
              className={`gap-1.5 text-xs h-7 ${snippetsOpen ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' : 'text-muted-foreground'}`}
              onClick={(e) => { e.stopPropagation(); onSnippetsToggle() }}
            >
              <Code2 className="w-3.5 h-3.5" />
              Snippets
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle snippets panel</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); onClose() }}
            >
              <X className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close (Esc)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
