import type { Metadata } from "next";
import { CategoryList } from "@/components/categories/CategoryList";

export const metadata: Metadata = {
  title: "Danh mục",
};

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý danh mục</h1>
      <CategoryList />
    </div>
  );
}
