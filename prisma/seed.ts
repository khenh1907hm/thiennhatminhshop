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
