"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  TransactionDTO,
  TransactionListResponse,
  TransactionListMeta,
} from "@/types";

interface UseTransactionsOptions {
  page?: number;
  pageSize?: number;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { page = 1, pageSize = 20, type, categoryId } = options;
  const [data, setData] = useState<TransactionDTO[]>([]);
  const [meta, setMeta] = useState<TransactionListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<TransactionListResponse>(
        "/api/v1/transactions",
        { page, pageSize, type, categoryId },
      );
      setData(res.data);
      setMeta(res.meta);
    } catch {
      setError("Không thể tải danh sách giao dịch.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, type, categoryId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createTransaction = useCallback(
    async (payload: {
      date: string;
      note: string;
      amountVnd: number;
      type: "INCOME" | "EXPENSE";
      categoryId: string;
    }) => {
      await apiClient.post("/api/v1/transactions", payload);
      await fetch();
    },
    [fetch],
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      payload: Partial<{
        date: string;
        note: string;
        amountVnd: number;
        type: "INCOME" | "EXPENSE";
        categoryId: string;
      }>,
    ) => {
      await apiClient.put(`/api/v1/transactions/${id}`, payload);
      await fetch();
    },
    [fetch],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await apiClient.delete(`/api/v1/transactions/${id}`);
      await fetch();
    },
    [fetch],
  );

  return {
    data,
    meta,
    loading,
    error,
    refetch: fetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
