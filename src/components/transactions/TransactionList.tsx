"use client";

import { useState } from "react";
import { TransactionDTO } from "@/types";
import { TransactionRow } from "./TransactionRow";
import { TransactionModal } from "./TransactionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useTransactions } from "@/hooks/useTransactions";

export function TransactionList() {
  const { data, meta, loading, error, refetch, deleteTransaction } =
    useTransactions();
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Group transactions by date
  const grouped: Record<string, TransactionDTO[]> = {};
  data.forEach((t: TransactionDTO) => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function formatGroupDate(iso: string) {
    return new Date(iso).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTransaction(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 text-sm">
        Không thể tải danh sách giao dịch. <button onClick={refetch} className="underline">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Thêm giao dịch
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Chưa có giao dịch nào</p>
          <p className="text-sm">Nhấn &ldquo;Thêm giao dịch&rdquo; để bắt đầu</p>
        </div>
      )}

      {/* Transaction table */}
      {!loading && data.length > 0 && (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="text-sm font-medium text-gray-500 mb-2 px-1 capitalize">
                {formatGroupDate(date)}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ngày</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ghi chú</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Số tiền</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Loại</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Danh mục</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[date].map((t) => (
                        <TransactionRow
                          key={t.id}
                          transaction={t}
                          onEdit={setEditTarget}
                          onDelete={setDeleteTarget}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-gray-500">
            Trang {meta.page} / {meta.totalPages} ({meta.total} giao dịch)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ← Trước
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              Sau →
            </Button>
          </div>
        </div>
      )}

      {/* Add modal */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={refetch}
      />

      {/* Edit modal */}
      <TransactionModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={refetch}
        transaction={editTarget ?? undefined}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa giao dịch"
        message="Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
