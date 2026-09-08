const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const p = await prisma.product.findFirst({
      where: {
        OR: [
          { id: 'ls-contactor-mc18b' },
          { slug: 'ls-contactor-mc18b' },
          { sku: 'ls-contactor-mc18b' }
        ]
      }
    });
    console.log(p);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
