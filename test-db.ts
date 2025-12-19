import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);

    console.log('Testing Notification fetch...');
    const notificationCount = await prisma.notification.count();
    console.log(`Notification count: ${notificationCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Prisma Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
