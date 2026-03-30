import { z } from "zod";

const CategoryTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ (YYYY-MM-DD)"),
  note: z.string().max(2000, "Ghi chú tối đa 2000 ký tự").default(""),
  amountVnd: z
    .number({ invalid_type_error: "Số tiền phải là số nguyên" })
    .int("Số tiền phải là số nguyên")
    .positive("Số tiền phải lớn hơn 0"),
  type: CategoryTypeEnum,
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
