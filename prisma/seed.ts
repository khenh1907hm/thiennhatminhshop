import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { products } from '../src/data/products'

const connectionString = `${process.env.DIRECT_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Insert categories first to establish relationships
  const uniqueCategories = [...new Set(products.map(p => p.category))]
  
  for (const catName of uniqueCategories) {
    const slug = catName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
    await prisma.category.upsert({
      where: { slug: slug },
      update: {},
      create: {
        name: catName,
        slug: slug,
      }
    })
  }

  const allCategories = await prisma.category.findMany()

  // Insert products
  for (const prod of products) {
    const slug = prod.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')
    const category = allCategories.find(c => c.name === prod.category)

    if (!category) {
      console.warn(`Category not found for product ${prod.name}`)
      continue
    }

    const images = [prod.image]
    if (prod.detailImages && prod.detailImages.length > 0) {
      images.push(...prod.detailImages)
    }

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        slug: slug,
        sku: prod.sku,
        brand: prod.brand,
        description: prod.description,
        price: prod.numericPrice,
        originalPrice: prod.originalPrice ? Number(prod.originalPrice.replace(/[^0-9]/g, '')) : null,
        discount: prod.discount,
        stock: prod.inStock ? 100 : 0,
        images: images,
        specs: prod.specs as any,
        documents: prod.documents as any,
        categoryId: category.id,
      }
    })
  }

  const author = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  })

  if (!author) {
    throw new Error('Cannot seed news posts because no ADMIN user exists.')
  }

  const newsCategory = await prisma.postCategory.upsert({
    where: { slug: 'thiet-bi-dien-cong-nghiep' },
    update: { name: 'Thiết bị điện công nghiệp' },
    create: {
      name: 'Thiết bị điện công nghiệp',
      slug: 'thiet-bi-dien-cong-nghiep',
      description: 'Kiến thức và hướng dẫn lựa chọn thiết bị điện công nghiệp.',
    },
  })

  const newsTags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'bien-tan' },
      update: { name: 'Biến tần' },
      create: { name: 'Biến tần', slug: 'bien-tan' },
    }),
    prisma.tag.upsert({
      where: { slug: 'contactor' },
      update: { name: 'Contactor' },
      create: { name: 'Contactor', slug: 'contactor' },
    }),
    prisma.tag.upsert({
      where: { slug: 'chong-set' },
      update: { name: 'Chống sét' },
      create: { name: 'Chống sét', slug: 'chong-set' },
    }),
  ])

  const newsPosts = [
    {
      title: 'Cách chọn biến tần phù hợp cho động cơ và dây chuyền sản xuất',
      slug: 'cach-chon-bien-tan-phu-hop-cho-dong-co',
      summary: 'Biến tần giúp điều khiển tốc độ động cơ, tiết kiệm điện và vận hành ổn định hơn. Đây là những tiêu chí cần kiểm tra trước khi lựa chọn.',
      content: `<h2>Vì sao nên dùng biến tần?</h2><p>Biến tần điều chỉnh tần số và điện áp cấp cho động cơ, từ đó kiểm soát tốc độ theo nhu cầu thực tế của máy. Với bơm, quạt, băng tải hoặc máy gia công, giải pháp này giúp giảm dòng khởi động, hạn chế va đập cơ khí và tối ưu điện năng.</p><h2>Ba thông số cần kiểm tra</h2><p>Trước tiên, hãy đối chiếu công suất và dòng định mức của biến tần với động cơ. Tiếp theo, xác định tải của máy là tải mô-men không đổi hay mô-men biến thiên để chọn đúng chế độ điều khiển. Cuối cùng, cần kiểm tra điện áp nguồn, số pha, cấp bảo vệ và điều kiện nhiệt độ tại tủ điện.</p><h2>Lưu ý khi lắp đặt</h2><p>Tủ điện cần có khoảng cách tản nhiệt phù hợp, dây động lực và dây tín hiệu nên được đi tách biệt. Việc cài đặt thời gian tăng giảm tốc, bảo vệ quá dòng và giới hạn tần số cũng cần bám sát đặc tính của máy. Khi chưa chắc về cấu hình, nên cung cấp thông tin động cơ và sơ đồ tải để được tư vấn chính xác.</p>`,
      tags: [newsTags[0]],
      coverImage: '/images/main-bg.jpg',
      focusKeyword: 'cách chọn biến tần',
    },
    {
      title: 'Contactor là gì? Hướng dẫn chọn khởi động từ cho tủ điện',
      slug: 'contactor-la-gi-huong-dan-chon-khoi-dong-tu',
      summary: 'Contactor là thiết bị đóng cắt mạch động lực bằng điều khiển điện từ, thường xuất hiện trong tủ bơm, tủ máy và hệ thống điều hòa.',
      content: `<h2>Contactor hoạt động như thế nào?</h2><p>Khi cuộn hút nhận điện, nam châm điện kéo hệ thống tiếp điểm đóng lại để cấp nguồn cho tải. Khi mất điện điều khiển, lò xo đưa tiếp điểm về trạng thái mở. Nhờ đó người vận hành có thể điều khiển động cơ từ nút nhấn, rơ-le hoặc bộ điều khiển tự động.</p><h2>Chọn contactor theo tải</h2><p>Thông số quan trọng nhất là dòng làm việc và cấp sử dụng. Tải động cơ thường cần contactor cấp AC-3, trong khi tải điện trở có thể dùng cấp AC-1. Không nên chỉ nhìn vào công suất trên nhãn; hãy đối chiếu điện áp động cơ, dòng định mức và tần suất đóng cắt thực tế.</p><h2>Phối hợp bảo vệ</h2><p>Contactor không thay thế thiết bị bảo vệ quá tải và ngắn mạch. Một bộ khởi động cơ bản thường gồm aptomat hoặc cầu chì, contactor và rơ-le nhiệt. Việc phối hợp đúng giúp giảm nguy cơ cháy tiếp điểm, bảo vệ động cơ và thuận tiện cho công tác bảo trì.</p>`,
      tags: [newsTags[1]],
      coverImage: '/images/header-bg.jpg',
      focusKeyword: 'contactor là gì',
    },
    {
      title: 'Thiết bị chống sét lan truyền cho tủ điện: Khi nào cần lắp đặt?',
      slug: 'thiet-bi-chong-set-lan-truyen-cho-tu-dien',
      summary: 'Thiết bị chống sét lan truyền SPD giúp hạn chế xung điện nguy hiểm truyền theo đường nguồn và bảo vệ thiết bị điện tử trong công trình.',
      content: `<h2>Xung điện lan truyền gây hại ra sao?</h2><p>Sét đánh gần đường dây hoặc thao tác đóng cắt tải lớn có thể tạo ra xung điện tăng rất nhanh. Xung này truyền vào tủ điện, làm hỏng nguồn, bộ điều khiển, camera, thiết bị mạng và các mạch điện tử nhạy cảm dù công trình không bị sét đánh trực tiếp.</p><h2>Chọn SPD theo hệ thống điện</h2><p>SPD Type 1 thường dùng tại đầu vào công trình có hệ thống chống sét trực tiếp, Type 2 phổ biến trong tủ phân phối và Type 3 dùng gần thiết bị cần bảo vệ. Cần xác định hệ thống một pha hay ba pha, điện áp làm việc liên tục, dòng xả và sơ đồ nối đất trước khi chọn model.</p><h2>Lắp đặt để đạt hiệu quả</h2><p>Dây nối SPD cần ngắn, thẳng và có tiết diện phù hợp để giảm điện cảm khi xả xung. Thiết bị cũng nên có bảo vệ dự phòng, chỉ thị trạng thái và được kiểm tra định kỳ. Một hệ thống chống sét hiệu quả cần kết hợp SPD, tiếp địa tốt và quy trình bảo trì rõ ràng.</p>`,
      tags: [newsTags[2]],
      coverImage: '/images/main-bg.jpg',
      focusKeyword: 'thiết bị chống sét lan truyền',
    },
  ]

  for (const [index, post] of newsPosts.entries()) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        categoryId: newsCategory.id,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        metaTitle: post.title,
        metaDesc: post.summary,
        focusKeyword: post.focusKeyword,
        tags: { set: post.tags.map((tag) => ({ id: tag.id })) },
      },
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        categoryId: newsCategory.id,
        authorId: author.id,
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        metaTitle: post.title,
        metaDesc: post.summary,
        focusKeyword: post.focusKeyword,
        tags: { connect: post.tags.map((tag) => ({ id: tag.id })) },
      },
    })
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
