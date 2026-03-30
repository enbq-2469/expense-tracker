import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  DashboardSummary,
  PeriodOption,
  CategoryChartData,
  ChartGroup,
} from "@/types";

interface GroupByRow {
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  _sum: { amountVnd: number | null };
}

function getPeriodDateRange(period: PeriodOption): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  const from = new Date();
  from.setHours(0, 0, 0, 0);

  switch (period) {
    case "1m":
      from.setMonth(from.getMonth() - 1);
      break;
    case "3m":
      from.setMonth(from.getMonth() - 3);
      break;
    case "6m":
      from.setMonth(from.getMonth() - 6);
      break;
    case "1y":
      from.setFullYear(from.getFullYear() - 1);
      break;
  }

  return { from, to };
}

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period") as PeriodOption | null;
  const validPeriods: PeriodOption[] = ["1m", "3m", "6m", "1y"];
  const period: PeriodOption = validPeriods.includes(
    periodParam as PeriodOption,
  )
    ? (periodParam as PeriodOption)
    : "1m";

  const { from, to } = getPeriodDateRange(period);

  // Aggregate transactions grouped by type + category
  const rawRows = await prisma.transaction.groupBy({
    by: ["type", "categoryId"],
    where: {
      userId,
      deletedAt: null,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: { amountVnd: true },
  });
  const rows: GroupByRow[] = rawRows as GroupByRow[];

  // Fetch category names for all referenced categoryIds
  const categoryIds = [...new Set(rows.map((r: GroupByRow) => r.categoryId))];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap: Map<string, string> = new Map(
    categories.map(
      (c: { id: string; name: string }) => [c.id, c.name] as [string, string],
    ),
  );

  // Separate into income and expense
  const incomeRows = rows.filter((r: GroupByRow) => r.type === "INCOME");
  const expenseRows = rows.filter((r: GroupByRow) => r.type === "EXPENSE");

  function buildChartGroup(groupRows: GroupByRow[]): ChartGroup {
    const totalVnd = groupRows.reduce(
      (sum: number, r: GroupByRow) => sum + (r._sum.amountVnd ?? 0),
      0,
    );
    const byCategory: CategoryChartData[] = groupRows.map((r: GroupByRow) => {
      const amountVnd = r._sum.amountVnd ?? 0;
      return {
        categoryId: r.categoryId,
        categoryName: (categoryMap.get(r.categoryId) as string) ?? "Không rõ",
        amountVnd,
        percentage: totalVnd > 0 ? Math.round((amountVnd / totalVnd) * 100) : 0,
      };
    });
    return { totalVnd, byCategory };
  }

  const result: DashboardSummary = {
    period,
    dateRange: {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    },
    income: buildChartGroup(incomeRows),
    expense: buildChartGroup(expenseRows),
  };

  return NextResponse.json(result);
}
