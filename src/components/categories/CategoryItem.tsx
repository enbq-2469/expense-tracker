"use client";

import { CategoryDTO } from "@/types";

interface CategoryItemProps {
  category: CategoryDTO;
  onEdit: (category: CategoryDTO) => void;
  onDelete: (category: CategoryDTO) => void;
}

export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${
            category.type === "INCOME"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {category.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
        </span>
        <span className="text-sm text-gray-900 truncate">{category.name}</span>
        {category.isSystemDerived && (
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 flex-shrink-0">
            Hệ thống
          </span>
        )}
      </div>

      {!category.isSystemDerived && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors min-h-touch"
            title="Chỉnh sửa"
            aria-label={`Chỉnh sửa danh mục ${category.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors min-h-touch"
            title="Xóa"
            aria-label={`Xóa danh mục ${category.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
