"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";
import { useSession } from "next-auth/react";
import { formatPrice, applyPromotion, type PromoLike } from "@/lib/formatPrice";
import { parseAddressOption, parseAddressOptions, type AddressOption } from "@/lib/address";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showNotification } = useNotification();
  const { data: session } = useSession();

  // Mode: 'cart' | 'checkout'
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart");

  // Guest vs Member state
  const [isGuest, setIsGuest] = useState(true);
  const [checkoutSettings, setCheckoutSettings] = useState({ allowGuestCheckout: true, pricesIncludeTax: true, taxName: "VAT", taxRate: 10 });
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);

  // Guest Customer Form Fields (Bắt buộc điền đầy đủ thông tin)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "TP. Hồ Chí Minh",
    district: "",
    ward: "",
    addressDetail: "",
    note: "",
    paymentMethod: "cod",
    provinceCode: "",
    districtCode: "",
    wardCode: ""
  });

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoLike | null>(null);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    fetch('/api/settings/checkout').then((res) => res.json()).then((data) => setCheckoutSettings((current) => ({ ...current, ...data }))).catch(() => {});
    if (session?.user) {
      setIsGuest(false);
      setCustomerInfo(prev => ({
        ...prev,
        fullName: session?.user?.name || prev.fullName,
        email: session?.user?.email || prev.email,
      }));
      // Thêm phần fetch API profile để lấy address/phone nếu cần
      fetch('/api/user/profile').then(res => res.json()).then(data => {
        if (data.phone || data.address) {
          setCustomerInfo(prev => ({
            ...prev,
            phone: data.phone || prev.phone,
            addressDetail: data.address?.split(",")[0]?.trim() || prev.addressDetail,
          }));
        }
      }).catch(e => {});
    }
  }, [session]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((response) => response.json())
      .then((data) => setProvinces(parseAddressOptions(data)))
      .catch(() => showNotification("Không thể tải danh sách tỉnh/thành phố", "error"));
  }, [showNotification]);

  useEffect(() => {
    if (!customerInfo.provinceCode) return;
    fetch(`https://provinces.open-api.vn/api/p/${customerInfo.provinceCode}?depth=2`)
      .then((response) => response.json())
      .then((data) => setDistricts(parseAddressOption(data).districts || []))
      .catch(() => showNotification("Không thể tải danh sách quận/huyện", "error"));
  }, [customerInfo.provinceCode, showNotification]);

  useEffect(() => {
    if (!customerInfo.districtCode) return;
    fetch(`https://provinces.open-api.vn/api/d/${customerInfo.districtCode}?depth=2`)
      .then((response) => response.json())
      .then((data) => setWards(parseAddressOption(data).wards || []))
      .catch(() => showNotification("Không thể tải danh sách phường/xã", "error"));
  }, [customerInfo.districtCode, showNotification]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.product.numericPrice || Number(item.product.price) || 0) * item.quantity, 0);
  const priced = applyPromotion(subtotal, appliedPromo);
  const discountAmount = priced.originalPrice != null ? subtotal - priced.price : 0;
  const taxable = priced.price;
  const vat = checkoutSettings.pricesIncludeTax ? 0 : taxable * (Number(checkoutSettings.taxRate) / 100);
  const total = taxable + vat;

  const formatCurrency = (val: number) => formatPrice(val);

  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      setPromoMsg(null);
      return;
    }
    setValidatingPromo(true);
    setPromoMsg(null);
    try {
      const res = await fetch(`/api/promotions/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mã không hợp lệ");
      setAppliedPromo({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      setPromoCode(data.code);
      setPromoMsg(`Đã áp dụng mã ${data.code}`);
      showNotification(`Áp dụng mã ${data.code} thành công`, "success");
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMsg(err.message || "Mã không hợp lệ");
      showNotification(err.message || "Mã không hợp lệ", "error");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    showNotification(`Đã xóa ${productName} khỏi giỏ hàng.`, "info");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest && !checkoutSettings.allowGuestCheckout) {
      showNotification("Cửa hàng yêu cầu đăng nhập trước khi đặt hàng.", "error");
      return;
    }
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.addressDetail) {
      showNotification("Vui lòng điền đầy đủ thông tin giao hàng bắt buộc!", "error");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.fullName,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          shippingAddress: `${customerInfo.addressDetail}, ${customerInfo.ward}, ${customerInfo.district}, ${customerInfo.province}`,
          note: customerInfo.note,
          paymentMethod: customerInfo.paymentMethod,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.numericPrice || Number(item.product.price) || 0
          })),
          totalAmount: total
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra khi đặt hàng");

      setOrderSuccessId(data.order.orderNumber);
      clearCart();
      showNotification("Đặt hàng thành công!", "success");
    } catch (error: any) {
      console.error(error);
      showNotification(error.message, "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface relative">
      <Header />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 w-full flex-grow">
        {/* Order Success View */}
        {orderSuccessId ? (
          <div className="max-w-2xl mx-auto bg-surface rounded-3xl p-8 border border-outline-variant shadow-xl text-center space-y-6 my-12">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-600 mx-auto">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">Đặt hàng thành công</span>
              <h1 className="text-3xl font-bold text-on-surface font-headline mt-1">Mã đơn: #{orderSuccessId}</h1>
              <p className="text-sm text-on-surface-variant mt-2">
                Cảm ơn <span className="font-semibold text-on-surface">{customerInfo.fullName}</span>! Đội ngũ kỹ sư Thiên Nhật Minh Eco sẽ liên hệ qua SĐT <span className="font-semibold text-on-surface">{customerInfo.phone}</span> để xác nhận lịch giao hàng.
              </p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl text-left border border-outline-variant space-y-2 text-xs">
              <p className="font-semibold text-on-surface">Thông tin nhận hàng:</p>
              <p className="text-on-surface-variant">Địa chỉ: {customerInfo.addressDetail}, {customerInfo.ward}, {customerInfo.district}, {customerInfo.province}</p>
              <p className="text-on-surface-variant">Hình thức thanh toán: {customerInfo.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản QR Bank"}</p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Trở về Trang Chủ
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-outline-variant pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">
                  {checkoutStep === "cart" ? "GIỎ HÀNG THIẾT BỊ" : "XÁC NHẬN & THANH TOÁN"}
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  {checkoutStep === "cart"
                    ? "Kiểm tra danh sách sản phẩm trước khi tiến hành thanh toán"
                    : "Điền thông tin nhận hàng (Có thể mua không cần tài khoản)"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    checkoutStep === "cart"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  1. Giỏ hàng ({items.length})
                </button>
                <span className="text-outline">➔</span>
                <button
                  disabled={items.length === 0}
                  onClick={() => setCheckoutStep("checkout")}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    checkoutStep === "checkout"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                  }`}
                >
                  2. Điền thông tin giao hàng
                </button>
              </div>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Cart Items or Checkout Form */}
                <div className="lg:col-span-7 space-y-6">
                  {checkoutStep === "cart" ? (
                    /* Cart Table View */
                    <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm">
                      <div className="p-4 border-b border-outline-variant bg-surface-container-low/50 flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase text-outline">Danh sách thiết bị</span>
                        <button
                          onClick={clearCart}
                          className="text-xs text-error hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                          Xóa toàn bộ
                        </button>
                      </div>
                      <div className="divide-y divide-outline-variant">
                        {items.map(({ product, quantity }) => (
                          <div key={product.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-surface-container-low/30 transition-colors">
                            <img
                              src={(product as any).images?.[0] || product.image || 'https://via.placeholder.com/150'}
                              alt={product.name}
                              className="w-20 h-20 object-contain rounded-lg border border-outline-variant bg-white p-1 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-on-surface text-sm line-clamp-1 font-headline">
                                {product.name}
                              </h3>
                              <p className="text-xs text-outline font-mono mt-0.5">SKU: {product.sku}</p>
                              <div className="text-sm font-bold text-primary font-headline mt-1">
                                {formatCurrency(product.numericPrice || Number(product.price) || 0)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-surface rounded text-on-surface font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-surface rounded text-on-surface font-bold"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(product.id, product.name)}
                              className="p-2 text-outline hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Checkout Form View (Supports Guest Checkout) */
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                      {/* Customer Option Selector */}
                      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                          <h2 className="text-base font-bold text-on-surface font-headline">Hình thức đặt hàng</h2>
                          <Link href="/login" className="text-xs font-medium text-primary hover:underline">
                            Bạn đã có tài khoản? Đăng nhập ➔
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setIsGuest(true)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              isGuest
                                ? "border-primary bg-primary/5 text-primary font-semibold"
                                : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                            }`}
                          >
                            <span className="block text-xs font-bold uppercase">Mua hàng không đăng nhập</span>
                            <span className="text-[11px] text-outline">Chỉ cần điền thông tin nhận hàng</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsGuest(false)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              !isGuest
                                ? "border-primary bg-primary/5 text-primary font-semibold"
                                : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                            }`}
                          >
                            <span className="block text-xs font-bold uppercase">Tôi là Thành viên</span>
                            <span className="text-[11px] text-outline">Tự động tải địa chỉ đã lưu</span>
                          </button>
                        </div>
                      </div>

                      {/* Guest Information Inputs */}
                      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 font-headline">
                          Thông tin giao hàng (Bắt buộc)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-on-surface mb-1">Họ và tên người nhận *</label>
                            <input
                              type="text"
                              required
                              placeholder="VD: Nguyễn Văn An"
                              value={customerInfo.fullName}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-on-surface mb-1">Số điện thoại *</label>
                            <input
                              type="tel"
                              required
                              placeholder="VD: 0908 123 456"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-on-surface mb-1">Email nhận thông báo đơn hàng</label>
                            <input
                              type="email"
                              placeholder="VD: nguyenvanan@gmail.com"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-on-surface mb-1">Tỉnh / Thành phố *</label>
                            <select
                              required
                              value={customerInfo.provinceCode}
                              onChange={(e) => {
                                const option = provinces.find((item) => String(item.code) === e.target.value);
                                setDistricts([]);
                                setWards([]);
                                setCustomerInfo({ ...customerInfo, provinceCode: e.target.value, province: option?.name || "", districtCode: "", district: "", wardCode: "", ward: "" });
                              }}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="">Chọn tỉnh / thành phố</option>
                              {provinces.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-on-surface mb-1">Quận / Huyện *</label>
                            <select
                              required
                              value={customerInfo.districtCode}
                              disabled={!customerInfo.provinceCode}
                              onChange={(e) => {
                                const option = districts.find((item) => String(item.code) === e.target.value);
                                setWards([]);
                                setCustomerInfo({ ...customerInfo, districtCode: e.target.value, district: option?.name || "", wardCode: "", ward: "" });
                              }}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">Chọn quận / huyện</option>
                              {districts.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-on-surface mb-1">Phường / Xã *</label>
                            <select
                              required
                              value={customerInfo.wardCode}
                              disabled={!customerInfo.districtCode}
                              onChange={(e) => {
                                const option = wards.find((item) => String(item.code) === e.target.value);
                                setCustomerInfo({ ...customerInfo, wardCode: e.target.value, ward: option?.name || "" });
                              }}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">Chọn phường / xã</option>
                              {wards.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-on-surface mb-1">Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
                            <input
                              type="text"
                              required
                              placeholder="VD: Số 123 Đường Nguyễn Văn Cừ"
                              value={customerInfo.addressDetail}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, addressDetail: e.target.value })}
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 font-headline">
                          Phương thức thanh toán
                        </h2>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={customerInfo.paymentMethod === "cod"}
                              onChange={() => setCustomerInfo({ ...customerInfo, paymentMethod: "cod" })}
                              className="text-primary focus:ring-primary"
                            />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">Thanh toán khi nhận hàng (COD)</p>
                              <p className="text-xs text-outline">Thanh toán tiền mặt cho nhân viên giao hàng hoặc kỹ sư lắp đặt.</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-4 border border-outline-variant rounded-xl cursor-not-allowed opacity-60">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="qr"
                              disabled
                              className="text-primary focus:ring-primary"
                            />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">Chuyển khoản QR Bank (chưa tích hợp)</p>
                              <p className="text-xs text-outline">Tạm thời chưa khả dụng. Vui lòng chọn thanh toán khi nhận hàng.</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right Column: Order Summary Card */}
                <div className="lg:col-span-5">
                  <div className="bg-surface rounded-2xl p-6 sm:p-7 sticky top-24 border border-primary/15 shadow-lg shadow-primary/10 space-y-5">
                    <h2 className="text-lg font-semibold tracking-tight font-headline border-b border-outline-variant pb-3 text-on-surface">
                      Tổng đơn hàng
                    </h2>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-outline uppercase tracking-wide">
                        Mã khuyến mãi
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setAppliedPromo(null);
                            setPromoMsg(null);
                          }}
                          placeholder="Nhập mã..."
                          className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary font-mono uppercase"
                        />
                        <button
                          type="button"
                          onClick={applyPromoCode}
                          disabled={validatingPromo || !promoCode.trim()}
                          className="px-3.5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 shrink-0"
                        >
                          {validatingPromo ? "..." : "Áp dụng"}
                        </button>
                      </div>
                      {promoMsg && (
                        <p className={`text-xs ${appliedPromo ? "text-emerald-600" : "text-red-600"}`}>
                          {promoMsg}
                        </p>
                      )}
                      {appliedPromo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode("");
                            setPromoMsg(null);
                          }}
                          className="text-[11px] text-outline underline hover:text-primary"
                        >
                          Bỏ mã khuyến mãi
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm border-b border-outline-variant pb-5 text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Tạm tính ({items.length} món):</span>
                        <span className="font-medium text-on-surface">{formatCurrency(subtotal)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Giảm giá ({appliedPromo?.code}):</span>
                          <span className="font-medium">−{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{checkoutSettings.taxName} ({checkoutSettings.pricesIncludeTax ? "đã gồm trong giá" : `${checkoutSettings.taxRate}%`}):</span>
                        <span className="font-medium text-on-surface">{formatCurrency(vat)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí tư vấn kỹ thuật:</span>
                        <span className="text-primary font-medium">Miễn phí</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-xs uppercase tracking-wider text-outline font-headline">
                        Tổng cộng
                      </span>
                      <span className="text-2xl font-bold text-primary font-headline">
                        {formatCurrency(total)}
                      </span>
                    </div>

                    {checkoutStep === "cart" ? (
                      <button
                        onClick={() => setCheckoutStep("checkout")}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        Tiến hành điền thông tin giao hàng
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={isProcessingPayment}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isProcessingPayment ? (
                          <span>Đang xử lý đơn hàng...</span>
                        ) : (
                          <>
                            <span>Xác nhận đặt hàng</span>
                            <span className="material-symbols-outlined text-lg">check</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface rounded-3xl p-12 text-center border border-outline-variant shadow-sm max-w-lg mx-auto space-y-4">
                <span className="material-symbols-outlined text-6xl text-outline">shopping_bag</span>
                <h2 className="text-2xl font-bold text-on-surface font-headline">Giỏ hàng trống</h2>
                <p className="text-xs text-on-surface-variant">Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
                >
                  Khám phá Sản Phẩm
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
