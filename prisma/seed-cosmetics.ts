import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COSMETICS = [
  // --- Avatars ---
  {
    name: "Nano Banana",
    description: "A cute banana friend. Free for everyone!",
    type: "AVATAR",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/avatars/nano_banana_free.png"
  },
  {
    name: "Cool Monkey",
    description: "Just chilling. Free avatar.",
    type: "AVATAR",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/avatars/cool_monkey_free.png"
  },
  {
    name: "Pixel Smile",
    description: "Retro vibes. Free avatar.",
    type: "AVATAR",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/avatars/pixel_smile_free.png"
  },
  {
    name: "Cyborg Banana",
    description: "The future is potassium.",
    type: "AVATAR",
    rarity: "EPIC",
    price: 500,
    imageUrl: "/cosmetics/avatars/cyborg_banana_premium.png"
  },
  {
    name: "Golden King",
    description: "For the royalty.",
    type: "AVATAR",
    rarity: "LEGENDARY",
    price: 1000,
    imageUrl: "/cosmetics/avatars/golden_king_premium.png"
  },
  {
    name: "Neon Ninja",
    description: "Silent but peeling.",
    type: "AVATAR",
    rarity: "RARE",
    price: 250,
    imageUrl: "/cosmetics/avatars/neon_ninja_premium.png"
  },
  
  // --- Frames ---
  {
    name: "Simple Circle",
    description: "Classic look.",
    type: "FRAME",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/frames/simple_circle_free.png"
  },
  {
    name: "Square",
    description: "It's hip to be square.",
    type: "FRAME",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/frames/square_free.png"
  },
  {
    name: "Hexagon",
    description: "Six sides of fun.",
    type: "FRAME",
    rarity: "COMMON",
    price: 0,
    imageUrl: "/cosmetics/frames/hexagon_free.png"
  },
  {
    name: "Gold Aura",
    description: "Radiate power.",
    type: "FRAME",
    rarity: "LEGENDARY",
    price: 1000,
    imageUrl: "/cosmetics/frames/gold_aura_premium.png"
  },
  {
    name: "Neon Pulse",
    description: "Electric vibes.",
    type: "FRAME",
    rarity: "EPIC",
    price: 500,
    imageUrl: "/cosmetics/frames/neon_pulse_premium.png"
  },
  {
    name: "Silver Edge",
    description: "Sleek and shiny.",
    type: "FRAME",
    rarity: "RARE",
    price: 250,
    imageUrl: "/cosmetics/frames/silver_edge_premium.png"
  }
];

async function main() {
  console.log('Start seeding cosmetics...');

  for (const item of COSMETICS) {
    const created = await prisma.cosmeticItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, '_') }, // Use name-based ID for consistency or just let it generate? 
      // Actually, upsert needs a unique field. ID is default(cuid).
      // We don't have a unique name field. 
      // Let's check for existing by name first?
      create: item,
      update: item,
    }).catch(async () => {
       // If upsert fails (e.g. ID issue), try findFirst
       const existing = await prisma.cosmeticItem.findFirst({ where: { name: item.name }});
       if (existing) {
         return prisma.cosmeticItem.update({
           where: { id: existing.id },
           data: item
         });
       } else {
         return prisma.cosmeticItem.create({ data: item });
       }
    });
    
    console.log(`Upserted cosmetic: ${item.name}`);
  }

  console.log('Seeding cosmetics finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
