-- Seed master Income categories (5)
INSERT INTO "system_categories" ("id", "name", "name_en", "type", "sort_order", "created_at") VALUES
    (gen_random_uuid(), 'Lương',         'Salary',             'INCOME', 1, now()),
    (gen_random_uuid(), 'Thưởng',        'Bonus',              'INCOME', 2, now()),
    (gen_random_uuid(), 'Đầu tư',        'Investment Returns', 'INCOME', 3, now()),
    (gen_random_uuid(), 'Kinh doanh',    'Business Income',    'INCOME', 4, now()),
    (gen_random_uuid(), 'Thu nhập khác', 'Other Income',       'INCOME', 5, now());

-- Seed master Expense categories (10)
INSERT INTO "system_categories" ("id", "name", "name_en", "type", "sort_order", "created_at") VALUES
    (gen_random_uuid(), 'Ăn uống',           'Food & Drink',       'EXPENSE',  1, now()),
    (gen_random_uuid(), 'Đi lại',            'Transportation',     'EXPENSE',  2, now()),
    (gen_random_uuid(), 'Nhà ở',             'Housing & Rent',     'EXPENSE',  3, now()),
    (gen_random_uuid(), 'Mua sắm',           'Shopping',           'EXPENSE',  4, now()),
    (gen_random_uuid(), 'Giải trí',          'Entertainment',      'EXPENSE',  5, now()),
    (gen_random_uuid(), 'Sức khỏe',          'Health & Medical',   'EXPENSE',  6, now()),
    (gen_random_uuid(), 'Giáo dục',          'Education',          'EXPENSE',  7, now()),
    (gen_random_uuid(), 'Hóa đơn & Tiện ích','Bills & Utilities',  'EXPENSE',  8, now()),
    (gen_random_uuid(), 'Tiết kiệm',         'Savings',            'EXPENSE',  9, now()),
    (gen_random_uuid(), 'Chi phí khác',      'Other Expenses',     'EXPENSE', 10, now());
