export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  image: string;
  price: string;
  numericPrice: number;
  inStock: boolean;
  description: string;
  category: string;
  originalPrice?: string;
  discount?: string;
  specs?: {
    category1: string;
    specs1: { label: string; value: string }[];
    category2: string;
    specs2: { label: string; value: string }[];
    category3: string;
    specs3: { label: string; value: string }[];
  };
  detailImages?: string[];
  documents?: { title: string; type: "pdf" | "setting"; href: string }[];
}

export const products: Product[] = [
  {
    id: "siemens-10kva",
    name: "Máy Biến Áp Cách Ly 3 Pha 10kVA",
    sku: "SM-TX-45091",
    brand: "SIEMENS",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdtq7NQBQ1zhiDFwfHALQC1wFgUP9Ud5lSlwSXeqyWLUm0A8yyPapTvEHI_TcZ-4F78KruJ5KzVrkRLHLGUGHuuuA09UEP3nDvIUGQejMawyAO_kGslElsdHKYQgkK2nG_9RneKK7QmrItT-7sQH0c7kBduP-0HY3ZPxmm-H5_xJyumiivP1PsHAc379SJVwp0SQ4CFXQawpr1Y5J9K8-5Yiuff-paqcEBnah-eztQnmCspqGVx6QgVXi9FM3B19i8NdqiJu291pIa",
    price: "24.500.000 ₫",
    originalPrice: "28.000.000 ₫",
    discount: "-12%",
    numericPrice: 24500000,
    inStock: true,
    category: "SIEMENS",
    description: "Máy biến áp cách ly 3 pha 10kVA SIEMENS được thiết kế cho các hệ thống yêu cầu độ an toàn điện cực cao và khả năng chống nhiễu vượt trội. Sản phẩm đạt chuẩn công nghiệp IEC-60076, bảo vệ thiết bị nhạy cảm khỏi các xung điện áp và nhiễu từ lưới điện.",
    detailImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkR9v-cy8uANyer9mqpgDSqCR4u8eiXc8-IKJMZzHdsIaYsQmxkLhdMO9sVteTo2uWkfJlw4pZMi_gzbSJUYAMM3nnQs_KB5aJaXAEoDfEdSTi4s6jrvPIx96jpHquOJ3T4DCukYQFagZVRRXig35rb1aJouhMZi1D2kftVyxEmAp8tnOHoGefPIqPyvSY4Ebu_QdIcEZiG_n75oUV7XojTt94agNeNx5-B4SVnWIcQ6pRIFpOPP26acfo-FuHa0Fmh2rnXX_ZaiZ7",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKxxRpiUFrbSHxIlEzgx09A8pXjHDwfP6sUq-yH710AGLj6ZQtW1Fs40gsIMmQROYiwZ8mtgOJoWT7oAhs1FtIm-VD_KoBcX_RGQROgvsivtOcYkbXfGnjTJGpuzNoB29vqB5rhmc-AXbPcARXmFPtAtvG49D0BOnQYWNbEkOGYJX6jwtH-cdlw8AJ2bipmymfWK2Cngnq4ULFpLAsV2bw7oZPst8FEaELkdfvf_D8At8Nzh7maxvHT0YamG6T0mZHPGVAFXicpNfa",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ1Mj1UJH_TGuZKiJZdpJbJBec6cgWXEQ0Ur_ce7tcbqW04vnH0FNk8aBcJMFa918Ow0jmonSzJZykIod65HQbQZ6RsHmJ67F80DU4krNfP_HnIKlXuQRdaS9Fo8r8EVRtbTAfJTmQ1N7p3HGpQfSFX9Dw9plOn6Kp8uT5EfQMbLcAd8Z0KDxP9xpZgyPyAnsdH45-Vs4hVqu8h0jQty1Nf9ba7Shpo5jXjnBq5mQ9yemoUSH28lT-BVxbYUzmyYqdFwry5tiULjyU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO8ZMCE4TZZT2npvjE-D0dXT0glz39rZs3UGhHOu09MNL-qSu9PIo1ve60Q6yxmOpNL6bJ4H9yWcLP1KLew0ZD2bPfbz8PQr94UIUGAo14pSeTqEAYzXre35uUt5B52BHaEv-DxUkt0iFVR-GilFRFO5Fjj32-9mvPDK5RohHevC1ImEWUhqT2pGwhYchQNGhMoBzYt8ftOZGlu0gB7hXctgrGXi9MzilmT_MyqEpehjoNqlj9rLl5C54IAwjUI_7qecFHjJcNvq4a"
    ],
    documents: [
      { title: "Datasheet (Tiếng Anh)", type: "pdf", href: "#" },
      { title: "Hướng dẫn lắp đặt", type: "setting", href: "#" }
    ],
    specs: {
      category1: "Cường độ / Điện áp",
      specs1: [
        { label: "Điện áp vào (Input)", value: "380V (3 Pha)" },
        { label: "Điện áp ra (Output)", value: "220V - 200V (3 Pha)" },
        { label: "Tần số (Frequency)", value: "50Hz / 60Hz" }
      ],
      category2: "Hiệu suất / Cách điện",
      specs2: [
        { label: "Hiệu suất (Efficiency)", value: "≥ 98%" },
        { label: "Độ bền cách điện", value: "2000VAC / 1 Phút" },
        { label: "Nhiệt độ hoạt động", value: "-5°C ~ +40°C" }
      ],
      category3: "Vật lý / Kích thước",
      specs3: [
        { label: "Kích thước (DxRxC)", value: "450 x 380 x 520 mm" },
        { label: "Trọng lượng", value: "82 kg" },
        { label: "Kiểu làm mát", value: "Air Natural (Tự nhiên)" }
      ]
    }
  },
  {
    id: "schneider-mcb-2p",
    name: "Aptomat MCB 2P 16A 6kA iK60N",
    sku: "SCH-MCB-002",
    brand: "SCHNEIDER",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSKPfO4UUE37zkr7wO1V9dXFg8L-W6fYylC1OdzV_Kt1OZeLCtJWxtxeCQWe-GBo6ClRgS706WRwz8rzI3zxncjorKS6e0aIuhHJ7vHD7YNBWp9Kbnw-Eik0ZxJCeDRq59nrGMHxeu7lTh86fFbAYBeGto-JW4HoWo-mFfzYLoY_kmqGk7o3ZH55aUVEHmmOJsKXpKI9hp3quz6gFERqgiI3otqtPBTbh1ORaB6xZzXiP8RApHHgrsd16fHTCsN-OzepiKpmMy9E2X",
    price: "155.000 đ",
    numericPrice: 155000,
    inStock: true,
    category: "SCHNEIDER CHÍNH HÃNG GIÁ RẺ",
    description: "Cầu dao tự động MCB bảo vệ ngắn mạch và quá tải chất lượng cao từ Schneider. Thích hợp cho mạng lưới điện dân dụng và công nghiệp.",
  },
  {
    id: "cadivi-cv-10",
    name: "Dây cáp điện CV-10mm2 (Đen)",
    sku: "CDV-CV10-B",
    brand: "CADIVI",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcvZhIqULChXAW8QaVTF76SjfHToRzGbFj5PNn8tYoI0q_h-w6C-RYNSd6QiGEdK1lNvBBNxXAUVl_EK9MB5idHrOdsc3wuYRuWptOMJU2JTBvRYHQyh9cO5w_bjAggEr6Si3Uq0ic8ZZ-ItA11SAvSVRinM9QR2e1HtrrBOcUf5lt3vDz9jzhxNvCvDtQC4-3aVuAKGXukBbK3bxcriXLYADAlNxAGweGZOOlAD29R3RGsSpv10qCKfiH7R-Og1kRJRMbzH6xzmNv",
    price: "24.500 đ/m",
    numericPrice: 24500,
    inStock: true,
    category: "DÂY ĐIỆN - CÁP ĐIỆN",
    description: "Cáp điện lực hạ thế CV Cadivi ruột đồng tinh chất, bọc cách điện PVC chất lượng cao, truyền tải dòng điện ổn định, an toàn tuyệt đối.",
  },
  {
    id: "panasonic-led-600",
    name: "Đèn LED Panel 600x600 48W",
    sku: "PAN-LED-P48",
    brand: "PANASONIC",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOULoWqlE6GY8jv9V2XoLTQFNK8_1cWHrLklODIkifOV5UWgFfUd_safcqVeTtxckbdTeiseJQKFG-sFImnhGio7iVkD-naHk2G1i5uc_wfyD3fcFlOd5morlpWBPr_v-R8jVJOhM8GGjeWZ9nXwvaSEr1BozG3Vf7QG1HiuR6AZWFxRYHm9PFO933ItNJVg_56P0xDHFaip0-1A4FFyhzx0IhRsVP0iOo_p1KPK2OW5ATQ-21Iv2uceEiT_NFBtOac2BZdJh0ubVu",
    price: "680.000 đ",
    numericPrice: 680000,
    inStock: true,
    category: "ĐÈN LED",
    description: "Đèn LED Panel 600x600 48W thương hiệu Panasonic cho ánh sáng dịu mắt, hiệu suất phát quang cao, tiết kiệm điện năng và tuổi thọ cực cao.",
  },
  {
    id: "omron-e2e-x5",
    name: "Cảm Biến Tiệm Cận M12 E2E",
    sku: "OMR-E2E-X5",
    brand: "OMRON",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeJrm4cPqE77XIAvHek_KiTKCv5sT9l2n26Gz3MLdLG7fcYhZnUkxm1cvK2SGnlzfUv3LpueTu4ur7-UlefAOc5bXL2zxmvpNH861tqmXPopx6hUfLCSb9CDriZl5JTOEwfQQeZ5yzMTh-1flbu-bHV0SrriNqPqTueztzZB3AF-0w53mbkjYvfqsp7cytDPoDo6OQCyvf4m0zr1D4AAdy8qKr9B0NZL94C3_Vzfib0SmDF1Lr7xfThPSVr-zfzF4nLUpuEOdTZNry",
    price: "420.000 đ",
    numericPrice: 420000,
    inStock: true,
    category: "OMRON",
    description: "Cảm biến tiệm cận Omron dòng E2E vỏ kim loại M12 đạt độ bền cao, hoạt động chính xác trong môi trường công nghiệp khắc nghiệt.",
  },
  {
    id: "ls-contactor-mc18b",
    name: "Khởi động từ (Contactor) MC-18b",
    sku: "LS-MC18B-220",
    brand: "LS ELECTRIC",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOwUOsU9OI6nQvK_QDMVOWiOAleU-GZ2bFePhu3htatniMJ6ibuFWAFt3MNyve8DrIADy_ggxVBViclgBZvyWm92qinL_5_JV-_EOCocgw5mnddiVAUeZyrsbgl3oDDLukmyWuT1ixNJp2bn8CIv9c-hboXSyOcXvMmojXgmSLgebr6JkH46NV7jBnjpJ4HWFL6MQ8ezg_06vtM7vUg7eiDbRitRxmxI34ELd82XzoKRQULB1-Wh6OYod0451hjSmCyipapDxx6XHa",
    price: "315.000 đ",
    numericPrice: 315000,
    inStock: true,
    category: "CONTACTOR KHỞI ĐỘNG TỪ",
    description: "Khởi động từ MC-18b LS dùng để đóng ngắt điều khiển động cơ và các phụ tải điện 3 pha công suất vừa và nhỏ.",
  }
];
