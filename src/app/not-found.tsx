import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang không tồn tại</h1>
      <p className="text-gray-500 mb-6">Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Link
        href="/home"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
