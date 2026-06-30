import { exampleQuestions } from '../data'

type WelcomeScreenProps = {
  modelName: string
  onPickExample: (text: string) => void
}

export function WelcomeScreen({ modelName, onPickExample }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col items-center px-6 pb-6 pt-16 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-[var(--ink)] font-['Geist_Mono',monospace] text-[28px] text-[var(--on-ink)]">
        ϕ
      </div>
      <div className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--text)]">{modelName}</div>
      <div className="mt-2 max-w-[440px] text-[15px] leading-[1.5] text-[var(--text-2)]">
        Assistant d'analyse financière et business. Posez une question ou choisissez un exemple.
      </div>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {exampleQuestions.map(example => (
          <button
            key={example.tag}
            type="button"
            onClick={() => onPickExample(example.text)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow)] transition-colors hover:border-[var(--border-strong)]"
          >
            <div className="mb-2 font-['Geist_Mono',monospace] text-[11px] font-medium tracking-[0.02em] text-[var(--accent-text)]">
              {example.tag}
            </div>
            <div className="text-sm leading-[1.45] text-[var(--text)]">{example.text}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
