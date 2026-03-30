import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { MonthlyChartResponse, MonthlyDataPoint } from "@/types";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const currentYear = new Date().getFullYear();

  let year: number;
  if (yearParam === null) {
    year = currentYear;
  } else {
    year = parseInt(yearParam, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "`year` must be a valid 4-digit calendar year",
        },
        { status: 400 },
      );
    }
  }

  // Aggregate income and expense totals per month using raw SQL
  // generate_series guarantees all 12 months are returned
  const rows = await prisma.$queryRaw<
    { month: number; incomeVnd: bigint; expenseVnd: bigint }[]
  >`
    WITH months AS (
      SELECT generate_series(1, 12) AS month
    )
    SELECT
      m.month,
      COALESCE(SUM(CASE WHEN t.type = 'INCOME'  THEN t.amount_vnd END), 0) AS "incomeVnd",
      COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount_vnd END), 0) AS "expenseVnd"
    FROM months m
    LEFT JOIN transactions t
      ON  EXTRACT(MONTH FROM t.date) = m.month
      AND EXTRACT(YEAR  FROM t.date) = ${year}
      AND t.user_id    = ${userId}
      AND t.deleted_at IS NULL
    GROUP BY m.month
    ORDER BY m.month
  `;

  // Fetch distinct years that have transactions
  const yearRows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year
    FROM transactions
    WHERE user_id = ${userId} AND deleted_at IS NULL
    ORDER BY year ASC
  `;

  const availableYears: number[] = yearRows.map(
    (r: { year: number }) => r.year,
  );
  if (!availableYears.includes(currentYear)) {
    availableYears.push(currentYear);
    availableYears.sort((a, b) => a - b);
  }

  const months: MonthlyDataPoint[] = rows.map(
    (r: { month: number; incomeVnd: bigint; expenseVnd: bigint }) => ({
      month: Number(r.month),
      incomeVnd: Number(r.incomeVnd),
      expenseVnd: Number(r.expenseVnd),
    }),
  );

  const result: MonthlyChartResponse = { year, availableYears, months };
  return NextResponse.json(result);
}
