"use client";

interface YearSelectorProps {
  value: number;
  availableYears: number[];
  onChange: (year: number) => void;
}

export function YearSelector({ value, availableYears, onChange }: YearSelectorProps) {
  const years = [...availableYears].sort((a, b) => b - a); // descending

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="year-selector"
        className="text-sm font-medium text-gray-600 whitespace-nowrap"
      >
        Năm thống kê
      </label>
      <select
        id="year-selector"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="min-h-[36px] rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
