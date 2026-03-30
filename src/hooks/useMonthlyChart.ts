"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { MonthlyChartResponse } from "@/types";

export function useMonthlyChart(year: number) {
  const [data, setData] = useState<MonthlyChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<MonthlyChartResponse>(
        "/api/v1/dashboard/monthly",
        { year },
      );
      setData(result);
    } catch {
      setError("Không thể tải dữ liệu biểu đồ tháng.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
