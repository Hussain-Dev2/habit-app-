import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      { title: "Streak Freeze", description: "Missed a day? Keep your streak alive!", costPoints: 500, stock: null, category: "Power-ups", region: "Global" },
      { title: "Streak Recovery", description: "Restore a streak you lost in the last 48 hours.", costPoints: 1000, stock: null, category: "Power-ups", region: "Global" },
      { title: "7-Day VIP", description: "Double XP and special themes for a week.", costPoints: 2500, stock: null, category: "Premium", region: "Global" },
      { title: "Charity Donation", description: "Donate 1000 points to plant a real tree.", costPoints: 1000, stock: null, category: "Charity", region: "Global" },
    ],
  });

  // Seed Cosmetics
  const COSMETICS = [
    // --- Avatars (New Premium PNGs) ---
    { name: "Nano Banana", description: "A cute banana friend. Free for everyone!", type: "AVATAR", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/avatars/Nano Banana.png" },
    { name: "Cool Monkey", description: "Just chilling. Free avatar.", type: "AVATAR", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/avatars/Cool Monkey.png" },
    { name: "Pixel Smile", description: "Retro vibes. Free avatar.", type: "AVATAR", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/avatars/Pixel Smile.png" },
    { name: "Cyborg Banana", description: "The future is potassium.", type: "AVATAR", rarity: "EPIC", price: 500, imageUrl: "/cosmetics/avatars/Cyborg Banana.png" },
    { name: "Pixel Knight", description: "Guardian of the pixels.", type: "AVATAR", rarity: "COMMON", price: 100, imageUrl: "/cosmetics/avatars/Pixel Knight.png" },
    { name: "Wizard Hat", description: "Magical aura included.", type: "AVATAR", rarity: "RARE", price: 250, imageUrl: "/cosmetics/avatars/Wizard Hat.png" },
    { name: "Glitch Face", description: "System error... or art?", type: "AVATAR", rarity: "EPIC", price: 750, imageUrl: "/cosmetics/avatars/Glitch Face.png" },
    { name: "Mecha Head", description: "Heavy metal dominance.", type: "AVATAR", rarity: "LEGENDARY", price: 1000, imageUrl: "/cosmetics/avatars/Mecha Head.png" },
    { name: "Dragon Eye", description: "See through the fire.", type: "AVATAR", rarity: "LEGENDARY", price: 1200, imageUrl: "/cosmetics/avatars/Dragon Eye.png" },
    
    // --- Avatars (Legacy SVGs) ---
    { name: "Golden King", description: "For the royalty.", type: "AVATAR", rarity: "LEGENDARY", price: 1000, imageUrl: "/cosmetics/avatars/golden_king_premium.svg" },
    { name: "Neon Ninja", description: "Silent but peeling.", type: "AVATAR", rarity: "RARE", price: 250, imageUrl: "/cosmetics/avatars/neon_ninja_premium.svg" },

    // --- Frames (New Premium PNGs) ---
    { name: "Simple Circle", description: "Classic look.", type: "FRAME", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/frames/Simple Circle.png" },
    { name: "Square", description: "It's hip to be square.", type: "FRAME", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/frames/Square.png" },
    { name: "Gold Aura", description: "Radiate power.", type: "FRAME", rarity: "LEGENDARY", price: 1000, imageUrl: "/cosmetics/frames/Gold Aura.png" },
    { name: "Neon Pulse", description: "Electric vibes.", type: "FRAME", rarity: "EPIC", price: 500, imageUrl: "/cosmetics/frames/Neon Pulse.png" },

    // --- Frames (Legacy SVGs) ---
    { name: "Hexagon", description: "Six sides of fun.", type: "FRAME", rarity: "COMMON", price: 0, imageUrl: "/cosmetics/frames/hexagon_free.svg" },
    { name: "Silver Edge", description: "Sleek and shiny.", type: "FRAME", rarity: "RARE", price: 250, imageUrl: "/cosmetics/frames/silver_edge_premium.svg" }
  ];

  console.log('Seeding cosmetics...');
  for (const item of COSMETICS) {
    // Generate an ID based on name for consistency (optional, but helps avoid duplicates if logic changes)
    // Actually prisma upsert is easiest if we have a unique field. We don't.
    // We'll use findFirst + update or create.
    const existing = await prisma.cosmeticItem.findFirst({ where: { name: item.name }});
    if (existing) {
      await prisma.cosmeticItem.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.cosmeticItem.create({ data: item });
    }
  }

  console.log("✅ Seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());