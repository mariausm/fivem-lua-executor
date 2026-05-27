import { useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Execution {
  id:        number
  code:      string
  result:    string
  isError:   boolean
  status:    'pending' | 'success' | 'error'
  timestamp: Date
}

interface OutputConsoleProps {
  executions: Execution[]
  execCount:  number
}

function CodePreview({ code }: { code: string }) {
  const lines = code.split('\n').slice(0, 2).join(' ↵ ')
  const preview = lines.length > 80 ? lines.slice(0, 80) + '…' : lines
  return (
    <div className="font-code text-[11px] text-muted-foreground/60 mb-1 border-l-2 border-border pl-2 truncate">
      » {preview}
    </div>
  )
}

function ExecutionEntry({ exec }: { exec: Execution }) {
  const ts = exec.timestamp.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <div className={cn('py-2.5 px-4 border-b border-border/50 last:border-0 group', {
      'bg-green-500/5': exec.status === 'success',
      'bg-red-500/5':   exec.status === 'error',
      'bg-yellow-500/5 animate-pulse': exec.status === 'pending',
    })}>
      {exec.code && <CodePreview code={exec.code} />}

      <div className="flex items-start gap-2">
        <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5 font-code">{ts}</span>

        {exec.status === 'pending' && <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />}
        {exec.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />}
        {exec.status === 'error'   && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}

        <pre className={cn('text-[12px] font-code whitespace-pre-wrap break-all leading-relaxed flex-1', {
          'text-muted-foreground': exec.status === 'pending',
          'text-green-300':        exec.status === 'success',
          'text-red-400':          exec.status === 'error',
        })}>
          {exec.status === 'pending' ? 'Executing…' : exec.result}
        </pre>
      </div>
    </div>
  )
}

export function OutputConsole({ executions, execCount }: OutputConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [executions])

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Section header */}
      <div className="flex items-center justify-between h-6 px-4 bg-[hsl(220_13%_10%)] border-b border-border shrink-0">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">Output</span>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
          {execCount} {execCount === 1 ? 'run' : 'runs'}
        </span>
      </div>

      {/* Output list */}
      <ScrollArea className="flex-1 bg-[hsl(var(--exec-output))]">
        {executions.length === 0 ? (
          <div className="px-4 py-4 text-[12px] font-code text-muted-foreground/40">
            -- LuaExecutor ready. Press{' '}
            <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border rounded">Ctrl+Enter</kbd>
            {' '}to execute.
          </div>
        ) : (
          executions.map(exec => <ExecutionEntry key={exec.id} exec={exec} />)
        )}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  )
}
