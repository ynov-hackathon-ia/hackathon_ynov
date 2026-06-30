type BoxSelectorProps = {
  label: string
  valueLabel: string
  hint?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function BoxSelector({
  label,
  valueLabel,
  hint,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
}: BoxSelectorProps) {
  const boxes = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step)
  const activeIndex = Math.round((value - min) / step)

  return (
    <div className="mb-7">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-[var(--text)]">{label}</span>
        <span className="font-['Geist_Mono',monospace] text-[13px] text-[var(--accent-text)]">{valueLabel}</span>
      </div>

      <div className="flex gap-1">
        {boxes.map((boxValue, index) => {
          const isActive = index <= activeIndex
          return (
            <button
              key={boxValue}
              type="button"
              onClick={() => onChange(boxValue)}
              aria-label={formatValue ? formatValue(boxValue) : `${boxValue}`}
              aria-pressed={isActive}
              className={`h-7 flex-1 rounded-md border transition-colors ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)]'
                  : 'border-[var(--border)] bg-transparent hover:border-[var(--border-strong)]'
              }`}
            />
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between px-0.5 font-['Geist_Mono',monospace] text-[11px] text-[var(--text-3)]">
        <span>{formatValue ? formatValue(min) : `${min}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}`}</span>
      </div>

      {hint ? <div className="mt-2 text-[12px] leading-[1.4] text-[var(--text-3)]">{hint}</div> : null}
    </div>
  )
}
