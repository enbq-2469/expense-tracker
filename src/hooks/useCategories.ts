"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { CategoryDTO } from "@/types";

export function useCategories() {
  const [data, setData] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<CategoryDTO[]>("/api/v1/categories");
      setData(result);
    } catch {
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createCategory = useCallback(
    async (payload: { name: string; type: "INCOME" | "EXPENSE" }) => {
      await apiClient.post("/api/v1/categories", payload);
      await fetch();
    },
    [fetch],
  );

  const updateCategory = useCallback(
    async (id: string, payload: { name: string }) => {
      await apiClient.put(`/api/v1/categories/${id}`, payload);
      await fetch();
    },
    [fetch],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await apiClient.delete(`/api/v1/categories/${id}`);
      await fetch();
    },
    [fetch],
  );

  return {
    data,
    loading,
    error,
    refetch: fetch,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
