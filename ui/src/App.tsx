import { useState, useCallback, useEffect, useRef } from 'react'
import { Header } from '@/components/Header'
import { Editor } from '@/components/Editor'
import { Toolbar } from '@/components/Toolbar'
import { OutputConsole, type Execution } from '@/components/OutputConsole'
import { SnippetsPanel } from '@/components/SnippetsPanel'
import { StatusBar } from '@/components/StatusBar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { RESOURCE, nuiFetch, sendClose } from '@/lib/nui'
import { cn } from '@/lib/utils'

type Status = 'ready' | 'running' | 'ok' | 'error'

export default function App() {
  const [visible,       setVisible]       = useState(false)
  const [code,          setCode]          = useState('')
  const [executions,    setExecutions]    = useState<Execution[]>([])
  const [execCount,     setExecCount]     = useState(0)
  const [isRunning,     setIsRunning]     = useState(false)
  const [status,        setStatus]        = useState<Status>('ready')
  const [snippetsOpen,  setSnippetsOpen]  = useState(false)
  const [cursorLine,    setCursorLine]    = useState(1)
  const [cursorCol,     setCursorCol]     = useState(1)

  // History
  const history      = useRef<string[]>([])
  const historyIdx   = useRef(-1)

  // Drag state
  const panelRef     = useRef<HTMLDivElement>(null)
  const dragStart    = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  // ── NUI message handler ──────────────────────────────────────
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const { action, result, isError } = e.data ?? {}
      if (action === 'open')  { setVisible(true) }
      if (action === 'close') { setVisible(false) }
      if (action === 'result') {
        setExecutions(prev => prev.map(ex =>
          ex.status === 'pending' && ex.id === execCount
            ? { ...ex, result: result ?? '', isError, status: isError ? 'error' : 'success' }
            : ex
        ))
        setIsRunning(false)
        setStatus(isError ? 'error' : 'ok')
        setTimeout(() => setStatus('ready'), 3000)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [execCount])

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
      if (e.altKey && e.key === 'ArrowUp')   historyPrev()
      if (e.altKey && e.key === 'ArrowDown') historyNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // ── Heartbeat ────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      nuiFetch('heartbeat').catch(() => {})
    }, 800)
    return () => clearInterval(id)
  }, [visible])

  // ── Execute ──────────────────────────────────────────────────
  const handleExecute = useCallback(() => {
    const trimmed = code.trim()
    if (!trimmed || isRunning) return

    // History
    if (history.current[0] !== trimmed) {
      history.current.unshift(trimmed)
      if (history.current.length > 50) history.current.pop()
    }
    historyIdx.current = -1

    const id = execCount + 1
    setExecCount(id)

    const entry: Execution = {
      id, code: trimmed, result: '', isError: false,
      status: 'pending', timestamp: new Date(),
    }
    setExecutions(prev => [...prev, entry])
    setIsRunning(true)
    setStatus('running')

    const timeout = setTimeout(() => {
      setExecutions(prev => prev.map(ex =>
        ex.id === id && ex.status === 'pending'
          ? { ...ex, result: '✖ Timeout (10s) — no response from server.', isError: true, status: 'error' }
          : ex
      ))
      setIsRunning(false)
      setStatus('error')
      setTimeout(() => setStatus('ready'), 3000)
    }, 10000)

    nuiFetch('execute', { code: trimmed, id })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout)
        setExecutions(prev => prev.map(ex =>
          ex.id === id
            ? { ...ex, result: data.result ?? '✓ Done', isError: !!data.isError, status: data.isError ? 'error' : 'success' }
            : ex
        ))
        setIsRunning(false)
        setStatus(data.isError ? 'error' : 'ok')
        setTimeout(() => setStatus('ready'), 3000)
      })
      .catch(() => {
        clearTimeout(timeout)
        setExecutions(prev => prev.map(ex =>
          ex.id === id
            ? { ...ex, result: `✖ NUI fetch failed.\nURL: https://${RESOURCE}/execute`, isError: true, status: 'error' }
            : ex
        ))
        setIsRunning(false)
        setStatus('error')
        setTimeout(() => setStatus('ready'), 3000)
      })
  }, [code, execCount, isRunning])

  // ── Close ────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setVisible(false)
    setSnippetsOpen(false)
    sendClose()
  }, [])

  // ── History ──────────────────────────────────────────────────
  const historyPrev = useCallback(() => {
    if (!history.current.length) return
    historyIdx.current = Math.min(historyIdx.current + 1, history.current.length - 1)
    setCode(history.current[historyIdx.current])
  }, [])

  const historyNext = useCallback(() => {
    if (historyIdx.current <= 0) { historyIdx.current = -1; setCode(''); return }
    historyIdx.current--
    setCode(history.current[historyIdx.current])
  }, [])

  // ── Drag ────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    panel.style.transform = 'none'
    panel.style.left = rect.left + 'px'
    panel.style.top  = rect.top  + 'px'
    dragStart.current = { mx: e.clientX, my: e.clientY, px: rect.left, py: rect.top }
    e.preventDefault()
  }, [])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const ds = dragStart.current
      const panel = panelRef.current
      if (!ds || !panel) return
      let x = ds.px + e.clientX - ds.mx
      let y = ds.py + e.clientY - ds.my
      x = Math.max(0, Math.min(x, window.innerWidth  - panel.offsetWidth))
      y = Math.max(0, Math.min(y, window.innerHeight - panel.offsetHeight))
      panel.style.left = x + 'px'
      panel.style.top  = y + 'px'
    }
    function onUp() { dragStart.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── Section header height config ──────────────────────────────
  const EDITOR_SECTION_HEADER = 26

  return (
    <TooltipProvider delayDuration={600}>
      <div className={cn(
        'fixed inset-0 transition-opacity duration-150 pointer-events-none',
        visible ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Panel */}
        <div
          ref={panelRef}
          className={cn(
            'absolute pointer-events-auto flex flex-col rounded-xl overflow-hidden border border-border',
            'shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.8),0_4px_24px_rgba(0,0,0,0.6)]',
            'bg-[hsl(var(--exec-panel))]',
            !visible && 'pointer-events-none'
          )}
          style={{
            width: 'min(920px, 90vw)',
            height: 'min(680px, 90vh)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Header
            snippetsOpen={snippetsOpen}
            onSnippetsToggle={() => setSnippetsOpen(v => !v)}
            onClose={handleClose}
            onMouseDown={handleDragStart}
          />

          {/* Editor section header */}
          <div
            className="flex items-center justify-between px-4 bg-[hsl(220_13%_10%)] border-b border-border shrink-0"
            style={{ height: EDITOR_SECTION_HEADER }}
          >
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">Editor</span>
            <span className="text-[10px] text-muted-foreground/40">
              Ctrl+Enter — execute &nbsp;|&nbsp; Ctrl+L — clear
            </span>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Editor
              value={code}
              onChange={setCode}
              onExecute={handleExecute}
              onClear={() => setCode('')}
              onCursorChange={(line, col) => { setCursorLine(line); setCursorCol(col) }}
            />
          </div>

          <Toolbar
            isRunning={isRunning}
            onExecute={handleExecute}
            onClearEditor={() => setCode('')}
            onClearOutput={() => { setExecutions([]); setExecCount(0) }}
            onHistoryPrev={historyPrev}
            onHistoryNext={historyNext}
            canHistoryPrev={history.current.length > 0}
            canHistoryNext={historyIdx.current > 0}
          />

          <OutputConsole executions={executions} execCount={execCount} />

          <StatusBar
            status={status}
            cursorLine={cursorLine}
            cursorCol={cursorCol}
            resource={RESOURCE}
          />

          {/* Snippets overlay panel */}
          <SnippetsPanel
            open={snippetsOpen}
            onClose={() => setSnippetsOpen(false)}
            onInsert={setCode}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
