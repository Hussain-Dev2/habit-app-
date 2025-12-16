import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    console.log('Checking templates in database...');
    
    const templates = await prisma.habitTemplate.findMany();
    
    console.log(`Found ${templates.length} templates:`);
    templates.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (${t.category}) - Featured: ${t.featured}`);
    });

    if (templates.length === 0) {
      console.log('\n❌ No templates found! Run: npx tsx prisma/seed-templates.ts');
    } else {
      console.log('\n✅ Templates exist in database!');
    }
  } catch (error) {
    console.error('Error checking templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
