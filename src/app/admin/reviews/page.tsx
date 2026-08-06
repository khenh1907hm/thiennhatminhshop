"use client";

const mockReviews = [
  { id: "REV-1", product: "Biến tần Siemens 5kW", author: "Lê Văn A", rating: 5, comment: "Sản phẩm tốt, giao hàng nhanh chóng.", date: "15/10/2023", status: "Đã duyệt" },
  { id: "REV-2", product: "Pin Lithium LFP 100Ah", author: "Trần B", rating: 2, comment: "Hàng bị móp méo hộp khi nhận.", date: "14/10/2023", status: "Chờ duyệt" },
  { id: "REV-3", product: "Tấm pin Mono 450W", author: "Nguyễn C", rating: 4, comment: "Hiệu suất ổn định, nhân viên tư vấn nhiệt tình.", date: "10/10/2023", status: "Đã duyệt" },
];

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Đánh giá sản phẩm (Reviews)</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kiểm duyệt và phản hồi các bình luận của khách hàng.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-outline uppercase tracking-wider">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {mockReviews.map((review) => (
                <tr key={review.id} className={`hover:bg-surface-container-low/60 transition-colors ${review.status === "Chờ duyệt" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface line-clamp-1">{review.product}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{review.date}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">{review.author}</td>
                  <td className="px-6 py-4">
                    <div className="flex text-amber-500 text-[14px]">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined">
                          {i < review.rating ? "star" : "star_border"}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 max-w-xs">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      review.status === "Đã duyệt" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {review.status === "Chờ duyệt" ? (
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md text-xs font-bold transition-colors">Duyệt</button>
                        <button className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-md text-xs font-bold transition-colors">Ẩn</button>
                      </div>
                    ) : (
                      <button className="text-primary text-sm font-semibold hover:underline">Phản hồi</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
