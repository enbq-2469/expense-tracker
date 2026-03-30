export type CategoryType = "INCOME" | "EXPENSE";

export type PeriodOption = "1m" | "3m" | "6m" | "1y";

export interface UserPublic {
  id: string;
  email: string;
  createdAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  type: CategoryType;
  isSystemDerived: boolean;
  createdAt: string;
}

export interface TransactionCategoryRef {
  id: string;
  name: string;
}

export interface TransactionDTO {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  note: string;
  amountVnd: number;
  type: CategoryType;
  category: TransactionCategoryRef;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResponse {
  data: TransactionDTO[];
  meta: TransactionListMeta;
}

export interface CategoryChartData {
  categoryId: string;
  categoryName: string;
  amountVnd: number;
  percentage: number;
}

export interface ChartGroup {
  totalVnd: number;
  byCategory: CategoryChartData[];
}

export interface DashboardSummary {
  period: PeriodOption;
  dateRange: {
    from: string;
    to: string;
  };
  income: ChartGroup;
  expense: ChartGroup;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  linkedTransactionsCount?: number;
}

export interface MonthlyDataPoint {
  month: number; // 1–12
  incomeVnd: number;
  expenseVnd: number;
}

export interface MonthlyChartResponse {
  year: number;
  availableYears: number[];
  months: MonthlyDataPoint[]; // always 12 entries
}

export interface DeleteCategoryResponse {
  message: string;
  id: string;
  linkedTransactionsCount: number;
}
