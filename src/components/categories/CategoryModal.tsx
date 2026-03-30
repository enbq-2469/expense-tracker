"use client";

import { useState, useEffect } from "react";
import { CategoryDTO, CategoryType } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: CategoryDTO;
}

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const isEditing = !!category;
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [errors, setErrors] = useState<{ name?: string; type?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? "");
      setType(category?.type ?? "EXPENSE");
      setErrors({});
    }
  }, [isOpen, category]);

  function validate() {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Tên danh mục không được để trống";
    if (name.trim().length > 100) errs.name = "Tên danh mục tối đa 100 ký tự";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      if (isEditing && category) {
        await apiClient.put(`/api/v1/categories/${category.id}`, { name: name.trim() });
      } else {
        await apiClient.post("/api/v1/categories", { name: name.trim(), type });
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "CATEGORY_EXISTS") {
        setErrors({ name: "Danh mục này đã tồn tại" });
      } else {
        setErrors({ general: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {errors.general}
          </div>
        )}

        {!isEditing && (
          <Select
            label="Loại"
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            options={[
              { value: "EXPENSE", label: "Chi tiêu" },
              { value: "INCOME", label: "Thu nhập" },
            ]}
          />
        )}

        {isEditing && category && (
          <div className="text-sm text-gray-500">
            Loại:{" "}
            <span className="font-medium">
              {category.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}
            </span>
          </div>
        )}

        <Input
          label="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Ăn uống, Lương..."
          error={errors.name}
          required
          maxLength={100}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? "Lưu thay đổi" : "Thêm danh mục"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
