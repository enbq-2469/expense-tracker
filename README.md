# 💰 Expense Tracker

Ứng dụng quản lý tài chính cá nhân — theo dõi thu nhập và chi tiêu theo danh mục, với biểu đồ thống kê trực quan.

---

## Tính năng

- **Xác thực**: Đăng ký / đăng nhập bằng email + mật khẩu; phiên đăng nhập lưu trong HttpOnly cookie (JWT)
- **Quản lý giao dịch**: Thêm, sửa, xoá (soft-delete) giao dịch thu nhập / chi tiêu; ghi chú hỗ trợ **Markdown**
- **Tổng quan (Dashboard)**:
  - Biểu đồ tròn thu nhập & chi tiêu theo danh mục — lọc theo 1 tháng / 3 tháng / 6 tháng / 1 năm
  - Biểu đồ cột 12 tháng — so sánh tổng thu & tổng chi theo từng tháng trong năm, kèm bộ lọc năm
- **Quản lý danh mục**: Tạo, đổi tên, xoá danh mục Thu nhập và Chi tiêu; 15 danh mục mặc định được tạo sẵn khi đăng ký
- **Responsive**: Giao diện tương thích mobile (bottom nav) và desktop (sidebar)

---

## Tech Stack

| Thành phần | Công nghệ                              |
| ---------- | -------------------------------------- |
| Framework  | Next.js 14 (App Router)                |
| Language   | TypeScript 5                           |
| Styling    | Tailwind CSS v3                        |
| Database   | PostgreSQL 16                          |
| ORM        | Prisma v5                              |
| Auth       | JWT (`jose`) + bcryptjs                |
| Charts     | Recharts v2                            |
| Markdown   | markdown-it v14 + isomorphic-dompurify |
| Validation | Zod v3                                 |

---

## Yêu cầu

- Node.js ≥ 18
- Docker + Docker Compose (để chạy PostgreSQL local)
- npm

---

## Cài đặt & Chạy local

### 1. Clone và cài dependencies

```bash
git clone <repo-url>
cd expense-tracker
npm install --legacy-peer-deps
```

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Chỉnh sửa `.env` nếu cần (mặc định đã khớp với `docker-compose.yml`):

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/expense_tracker"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Để sinh JWT secret ngẫu nhiên:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Khởi động PostgreSQL

```bash
docker compose up -d
```

### 4. Chạy migrations & seed dữ liệu danh mục

```bash
npm run prisma:migrate
```

Lệnh này áp dụng 2 migrations:

- `20260330000001_init_schema` — tạo toàn bộ bảng
- `20260330000002_seed_system_categories` — seed 15 danh mục mặc định (5 thu nhập + 10 chi tiêu)

### 5. Khởi động dev server

```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Lệnh                         | Mô tả                           |
| ---------------------------- | ------------------------------- |
| `npm run dev`                | Chạy dev server (Next.js)       |
| `npm run build`              | Build production                |
| `npm run start`              | Chạy production build           |
| `npm run lint`               | Kiểm tra ESLint                 |
| `npm run prisma:migrate`     | Áp dụng migrations (production) |
| `npm run prisma:migrate:dev` | Tạo migration mới (development) |
| `npm run prisma:generate`    | Tái sinh Prisma Client          |
| `npm run prisma:studio`      | Mở Prisma Studio                |

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/           # Trang đăng ký, đăng nhập
│   ├── (dashboard)/      # Trang home, import, settings (cần đăng nhập)
│   └── api/v1/           # Route handlers (auth, transactions, categories, dashboard)
├── components/
│   ├── auth/             # SignUpForm, LoginForm
│   ├── categories/       # CategoryList, CategoryModal, CategoryItem
│   ├── charts/           # PeriodSelector, ExpensePieChart, ChartLegend,
│   │                     # MonthlyBarChart, YearSelector
│   ├── transactions/     # TransactionList, TransactionModal, TransactionRow
│   └── ui/               # Button, Input, Select, Modal, NavBar, Skeleton, ...
├── hooks/                # useTransactions, useCategories, useDashboard, useMonthlyChart
├── lib/                  # db, auth, markdown, currency, api-client, validations
└── types/                # TypeScript interfaces
```

---

## API Endpoints

| Method | Endpoint                    | Mô tả                                          |
| ------ | --------------------------- | ---------------------------------------------- |
| POST   | `/api/v1/auth/register`     | Đăng ký tài khoản                              |
| POST   | `/api/v1/auth/login`        | Đăng nhập                                      |
| POST   | `/api/v1/auth/logout`       | Đăng xuất                                      |
| POST   | `/api/v1/auth/refresh`      | Làm mới access token                           |
| GET    | `/api/v1/transactions`      | Danh sách giao dịch (phân trang, lọc)          |
| POST   | `/api/v1/transactions`      | Tạo giao dịch                                  |
| PUT    | `/api/v1/transactions/:id`  | Sửa giao dịch                                  |
| DELETE | `/api/v1/transactions/:id`  | Xoá mềm giao dịch                              |
| GET    | `/api/v1/categories`        | Danh sách danh mục                             |
| POST   | `/api/v1/categories`        | Tạo danh mục                                   |
| PUT    | `/api/v1/categories/:id`    | Đổi tên danh mục                               |
| DELETE | `/api/v1/categories/:id`    | Xoá danh mục                                   |
| GET    | `/api/v1/dashboard/summary` | Tổng hợp thu/chi theo kỳ (pie chart)           |
| GET    | `/api/v1/dashboard/monthly` | Tổng hợp thu/chi 12 tháng theo năm (bar chart) |

---

## Danh mục mặc định

Mỗi tài khoản mới được khởi tạo với 15 danh mục:

**Thu nhập (5):** Lương, Thưởng, Đầu tư, Kinh doanh, Thu nhập khác

**Chi tiêu (10):** Ăn uống, Đi lại, Nhà ở, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Hóa đơn & Tiện ích, Tiết kiệm, Chi phí khác
