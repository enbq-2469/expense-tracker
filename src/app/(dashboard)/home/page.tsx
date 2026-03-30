"use client";

import { useState } from "react";
import { PeriodOption } from "@/types";
import { PeriodSelector } from "@/components/charts/PeriodSelector";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { useDashboard } from "@/hooks/useDashboard";
import { formatVnd } from "@/lib/currency";

export default function HomePage() {
  const [period, setPeriod] = useState<PeriodOption>("1m");
  const { data, loading, error } = useDashboard(period);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      {!loading && data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Thu nhập
              </p>
              <p className="text-xl font-bold text-income">
                {formatVnd(data.income.totalVnd)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Chi tiêu
              </p>
              <p className="text-xl font-bold text-expense">
                {formatVnd(data.expense.totalVnd)}
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Số dư
            </p>
            <p
              className={`text-2xl font-bold ${
                data.income.totalVnd - data.expense.totalVnd >= 0
                  ? "text-income"
                  : "text-expense"
              }`}
            >
              {formatVnd(data.income.totalVnd - data.expense.totalVnd)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Từ {data.dateRange.from} đến {data.dateRange.to}
            </p>
          </div>

          {/* Pie charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Thu nhập theo danh mục</h2>
              <ExpensePieChart
                data={data.income.byCategory}
                totalVnd={data.income.totalVnd}
                title="Thu nhập"
                colorClass="text-income"
              />
              <ChartLegend data={data.income.byCategory} totalVnd={data.income.totalVnd} />
            </div>

            {/* Expense chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Chi tiêu theo danh mục</h2>
              <ExpensePieChart
                data={data.expense.byCategory}
                totalVnd={data.expense.totalVnd}
                title="Chi tiêu"
                colorClass="text-expense"
              />
              <ChartLegend data={data.expense.byCategory} totalVnd={data.expense.totalVnd} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
