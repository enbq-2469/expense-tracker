import type { Metadata } from "next";
import { TransactionList } from "@/components/transactions/TransactionList";

export const metadata: Metadata = {
  title: "Quản lý giao dịch",
};

export default function ImportPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý giao dịch</h1>
      <TransactionList />
    </div>
  );
}
