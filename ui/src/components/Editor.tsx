import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'

const luaLanguage = StreamLanguage.define(lua)

interface EditorProps {
  value: string
  onChange: (val: string) => void
  onExecute: () => void
  onClear: () => void
  onCursorChange: (line: number, col: number) => void
}

export function Editor({ value, onChange, onExecute, onClear, onCursorChange }: EditorProps) {
  const extraKeys = keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => { onExecute(); return true },
    },
    {
      key: 'Ctrl-l',
      run: () => { onClear(); return true },
    },
    {
      key: 'Escape',
      run: () => false,
    },
    ...defaultKeymap,
    indentWithTab,
  ])

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={oneDark}
      extensions={[luaLanguage, extraKeys]}
      className="h-full text-[13px]"
      basicSetup={{
        lineNumbers:       true,
        foldGutter:        false,
        dropCursor:        true,
        allowMultipleSelections: false,
        indentOnInput:     true,
        bracketMatching:   true,
        closeBrackets:     true,
        autocompletion:    false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
      }}
      onStatistics={(stats) => {
        onCursorChange(stats.line.number, stats.selection.main.head)
      }}
    />
  )
}
