"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { apiClient, ApiError } from "@/lib/api-client";
import { TransactionDTO, CategoryDTO, CategoryType } from "@/types";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  transaction?: TransactionDTO; // if provided → edit mode
}

const TYPE_OPTIONS = [
  { value: "INCOME", label: "Thu nhập" },
  { value: "EXPENSE", label: "Chi tiêu" },
];

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
}: TransactionModalProps) {
  const isEdit = !!transaction;
  const [date, setDate] = useState(transaction?.date ?? todayIso());
  const [note, setNote] = useState(transaction?.note ?? "");
  const [amountStr, setAmountStr] = useState(
    transaction ? String(transaction.amountVnd) : ""
  );
  const [type, setType] = useState<CategoryType>(transaction?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(transaction?.category.id ?? "");
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch categories when type changes
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    apiClient
      .get<CategoryDTO[]>("/api/v1/categories", { type })
      .then((res) => {
        if (cancelled) return;
        setCategories(res);
        // Reset category selection if selected category doesn't match the new type
        setCategoryId((prev) => {
          if (!prev) return prev;
          const still = res.find((c) => c.id === prev);
          return still ? prev : "";
        });
      })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, [type, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDate(transaction?.date ?? todayIso());
      setNote(transaction?.note ?? "");
      setAmountStr(transaction ? String(transaction.amountVnd) : "");
      setType(transaction?.type ?? "EXPENSE");
      setCategoryId(transaction?.category.id ?? "");
      setErrors({});
      setServerError("");
      setShowPreview(false);
    }
  }, [isOpen, transaction]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = "Vui lòng chọn ngày";
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      newErrors.amountVnd = "Số tiền phải lớn hơn 0";
    }
    if (!type) newErrors.type = "Vui lòng chọn loại";
    if (!categoryId) newErrors.categoryId = "Vui lòng chọn danh mục";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        date,
        note,
        amountVnd: parseInt(amountStr, 10),
        type,
        categoryId,
      };

      if (isEdit) {
        await apiClient.put(`/api/v1/transactions/${transaction!.id}`, payload);
      } else {
        await apiClient.post("/api/v1/transactions", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Ngày"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
          max={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              Ghi chú
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showPreview ? "Chỉnh sửa" : "Xem trước"}
            </button>
          </div>
          {showPreview ? (
            <div className="min-h-[80px] p-3 rounded-lg border border-gray-200 bg-gray-50">
              <MarkdownRenderer source={note} />
            </div>
          ) : (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Hỗ trợ Markdown..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          )}
        </div>

        <Input
          label="Số tiền (₫)"
          type="number"
          min="1"
          step="1"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          error={errors.amountVnd}
          required
          placeholder="35000"
        />

        <Select
          label="Loại"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          error={errors.type}
          required
        />

        <Select
          label="Danh mục"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
          placeholder="Chọn danh mục..."
          required
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} fullWidth>
            Hủy
          </Button>
          <Button type="submit" loading={loading} fullWidth>
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
