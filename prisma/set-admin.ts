import { prisma } from '@/lib/prisma';

async function setAdminByEmail() {
  const email = 'dev.hussain.iq@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found with email:', email);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log('✅ Successfully set user as admin!');
  console.log('User:', {
    email: updatedUser.email,
    name: updatedUser.name,
    isAdmin: updatedUser.isAdmin,
  });
}

setAdminByEmail()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
