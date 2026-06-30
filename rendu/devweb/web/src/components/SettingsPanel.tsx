import { BoxSelector } from './BoxSelector'

type SettingsPanelProps = {
  onClose: () => void
  temperature: number
  onTemperatureChange: (value: number) => void
  topP: number
  onTopPChange: (value: number) => void
  maxTokens: number
  onMaxTokensChange: (value: number) => void
  modelName: string
}

export function SettingsPanel({
  onClose,
  temperature,
  onTemperatureChange,
  topP,
  onTopPChange,
  maxTokens,
  onMaxTokensChange,
  modelName,
}: SettingsPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex justify-end">
      <button
        type="button"
        aria-label="Fermer les réglages"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex h-full w-[360px] max-w-[90vw] animate-[dc-rise_0.2s_ease] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div className="text-[15px] font-semibold text-[var(--text)]">Paramètres d'inférence</div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-[30px] items-center justify-center rounded-lg text-[16px] text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <BoxSelector
            label="Température"
            valueLabel={temperature.toFixed(2)}
            min={0}
            max={1.5}
            step={0.15}
            value={temperature}
            onChange={onTemperatureChange}
            hint="Plus bas = réponses déterministes, adapté à l'analyse financière."
            formatValue={value => value.toFixed(2)}
          />

          <BoxSelector
            label="Top-p"
            valueLabel={topP.toFixed(2)}
            min={0.1}
            max={1}
            step={0.1}
            value={topP}
            onChange={onTopPChange}
            formatValue={value => value.toFixed(2)}
          />

          <BoxSelector
            label="Tokens maximum"
            valueLabel={String(maxTokens)}
            min={256}
            max={4096}
            step={256}
            value={maxTokens}
            onChange={onMaxTokensChange}
          />

          <div className="border-t border-[var(--border)] pt-5">
            <div className="mb-3 font-['Geist_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-3)]">
              Endpoint
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 font-['Geist_Mono',monospace] text-[12px] leading-[1.6] text-[var(--text-2)]">
              POST /api/chat
              <br />
              host: localhost:11434
              <br />
              model: {modelName}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
