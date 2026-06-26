interface MonthYearSelectProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export function MonthYearSelect({ month, year, onMonthChange, onYearChange }: MonthYearSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        aria-label="Month"
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className={selectClassName}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {new Date(2000, m - 1).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      <select
        aria-label="Year"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className={selectClassName}
      >
        {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
