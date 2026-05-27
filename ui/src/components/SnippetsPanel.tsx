import { X } from 'lucide-react'
import { SNIPPETS } from '@/lib/snippets'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SnippetsPanelProps {
  open: boolean
  onClose: () => void
  onInsert: (code: string) => void
}

export function SnippetsPanel({ open, onClose, onInsert }: SnippetsPanelProps) {
  return (
    <div className={cn(
      'absolute top-11 right-0 bottom-6 w-56 bg-[hsl(220_13%_11%)] border-l border-border flex flex-col z-10 transition-all duration-150',
      open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-9 px-3 bg-[hsl(220_13%_13%)] border-b border-border shrink-0">
        <span className="text-xs font-semibold text-foreground">Code Snippets</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Snippet list */}
      <ScrollArea className="flex-1">
        <div className="p-1.5 flex flex-col gap-0.5">
          {SNIPPETS.map(snip => (
            <button
              key={snip.key}
              className="flex flex-col items-start px-3 py-2.5 rounded-md text-left hover:bg-accent transition-colors border border-transparent hover:border-border"
              onClick={() => { onInsert(snip.code); onClose() }}
            >
              <span className="text-xs font-medium text-foreground">{snip.name}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{snip.desc}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
