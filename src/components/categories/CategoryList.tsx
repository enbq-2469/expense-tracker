"use client";

import { useState } from "react";
import { CategoryDTO } from "@/types";
import { CategoryItem } from "./CategoryItem";
import { CategoryModal } from "./CategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/hooks/useCategories";

export function CategoryList() {
  const { data, loading, error, refetch, deleteCategory } = useCategories();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const incomeCategories = data.filter((c: CategoryDTO) => c.type === "INCOME");
  const expenseCategories = data.filter((c: CategoryDTO) => c.type === "EXPENSE");

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteCategory(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 text-sm">
        Không thể tải danh mục.{" "}
        <button onClick={refetch} className="underline">
          Thử lại
        </button>
      </div>
    );
  }

  function renderSection(title: string, items: CategoryDTO[]) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-400 text-center">
            Chưa có danh mục nào
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((c) => (
              <CategoryItem
                key={c.id}
                category={c}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
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
          Thêm danh mục
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Đang tải...</div>
      )}

      {!loading && (
        <div className="space-y-6">
          {renderSection("Thu nhập", incomeCategories)}
          {renderSection("Chi tiêu", expenseCategories)}
        </div>
      )}

      {/* Add modal */}
      <CategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={refetch}
      />

      {/* Edit modal */}
      <CategoryModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={refetch}
        category={editTarget ?? undefined}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Các giao dịch liên quan sẽ không bị xóa.`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
