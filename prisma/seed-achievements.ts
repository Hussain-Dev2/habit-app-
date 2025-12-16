import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  {
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🌱',
    requirement: 'habit_count_1',
    reward: 50,
  },
  {
    name: 'Habit Builder',
    description: 'Complete 10 habits',
    icon: '🔨',
    requirement: 'habit_count_10',
    reward: 200,
  },
  {
    name: 'Habit Master',
    description: 'Complete 100 habits',
    icon: '👑',
    requirement: 'habit_count_100',
    reward: 1000,
  },
  {
    name: 'Week Warrior',
    description: 'Reach a 7-day streak',
    icon: '🔥',
    requirement: 'streak_7',
    reward: 500,
  },
  {
    name: 'Monthly Master',
    description: 'Reach a 30-day streak',
    icon: '📅',
    requirement: 'streak_30',
    reward: 2000,
  },
];

async function main() {
  console.log('Seeding achievements...');

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Achievements seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
