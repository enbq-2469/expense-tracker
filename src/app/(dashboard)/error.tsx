"use client";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="text-4xl mb-3">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
      <p className="text-gray-500 mb-4 text-sm">Không thể tải trang này. Vui lòng thử lại.</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
