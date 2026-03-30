import { z } from "zod";

const CategoryTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục tối đa 100 ký tự")
    .trim(),
  type: CategoryTypeEnum,
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục tối đa 100 ký tự")
    .trim(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
