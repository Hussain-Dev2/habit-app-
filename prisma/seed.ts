import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      { title: "1x Multiplier", description: "Earn 2x points per click", costPoints: 100, stock: 10 },
      { title: "Auto Clicker (5s)", description: "Auto-click every 5 seconds", costPoints: 500, stock: 5 },
      { title: "Double Points", description: "2x points for 1 minute", costPoints: 1000, stock: 3 },
    ],
  });
  console.log("✅ Seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());