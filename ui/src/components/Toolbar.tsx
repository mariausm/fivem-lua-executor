import { Play, Trash2, Terminal, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ToolbarProps {
  isRunning: boolean
  onExecute: () => void
  onClearEditor: () => void
  onClearOutput: () => void
  onHistoryPrev: () => void
  onHistoryNext: () => void
  canHistoryPrev: boolean
  canHistoryNext: boolean
}

export function Toolbar({
  isRunning, onExecute, onClearEditor, onClearOutput,
  onHistoryPrev, onHistoryNext, canHistoryPrev, canHistoryNext,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 h-10 px-3 bg-[hsl(220_13%_12%)] border-t border-b border-border shrink-0">
      {/* Execute */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="run"
            size="sm"
            className="h-7 gap-2 px-3"
            onClick={onExecute}
            disabled={isRunning}
          >
            {isRunning
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Play className="w-3.5 h-3.5 fill-current" />
            }
            {isRunning ? 'Running…' : 'Execute'}
            <kbd className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-blue-900/50 border border-blue-700/50 rounded text-blue-200">
              Ctrl+↵
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Execute code (Ctrl+Enter)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Clear editor */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={onClearEditor}>
            <Trash2 className="w-3.5 h-3.5" />
            Clear Editor
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear editor (Ctrl+L)</TooltipContent>
      </Tooltip>

      {/* Clear output */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={onClearOutput}>
            <Terminal className="w-3.5 h-3.5" />
            Clear Output
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear output log</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      {/* History */}
      <div className="flex items-center gap-0.5">
        <span className="text-[11px] text-muted-foreground mr-1">History</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHistoryPrev} disabled={!canHistoryPrev}>
              <ChevronUp className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous (Alt+↑)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHistoryNext} disabled={!canHistoryNext}>
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next (Alt+↓)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
