"use client";

import { TransactionDTO } from "@/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { formatVnd } from "@/lib/currency";

interface TransactionRowProps {
  transaction: TransactionDTO;
  onEdit: (t: TransactionDTO) => void;
  onDelete: (t: TransactionDTO) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";

  const dateFormatted = new Date(transaction.date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {dateFormatted}
      </td>

      {/* Note */}
      <td className="px-4 py-3 text-sm max-w-xs">
        <div className="line-clamp-2">
          <MarkdownRenderer source={transaction.note} />
        </div>
      </td>

      {/* Amount */}
      <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${isIncome ? "text-income" : "text-expense"}`}>
        {isIncome ? "+" : "−"} {formatVnd(transaction.amountVnd)}
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isIncome
              ? "bg-income-light text-income-dark"
              : "bg-expense-light text-expense-dark"
          }`}
        >
          {isIncome ? "Thu nhập" : "Chi tiêu"}
        </span>
      </td>

      {/* Category */}
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {transaction.category.name}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(transaction)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label={`Sửa giao dịch ${transaction.note || transaction.amountVnd}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label={`Xóa giao dịch ${transaction.note || transaction.amountVnd}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
