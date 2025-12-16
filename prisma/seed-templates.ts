import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('🌱 Seeding habit templates...');

  const templates = [
    {
      name: '💪 Health & Fitness Pack',
      description: 'Essential habits for a healthy lifestyle. Perfect for beginners looking to improve their physical well-being.',
      category: 'health',
      icon: '💪',
      color: '#10B981',
      featured: true,
      habits: [
        {
          name: '💧 Drink 8 Glasses of Water',
          description: 'Stay hydrated throughout the day for better health and energy',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🚶 Walk 30 Minutes',
          description: 'Daily walk to improve cardiovascular health and mood',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '😴 Sleep 8 Hours',
          description: 'Get quality sleep for better recovery and mental clarity',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🥗 Eat Healthy Meal',
          description: 'Choose nutritious meals to fuel your body properly',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🧘 Stretch 10 Minutes',
          description: 'Daily stretching to improve flexibility and reduce stress',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        }
      ]
    },
    {
      name: '💻 Developer Productivity Pack',
      description: 'Essential habits for software developers. Stay sharp and keep learning!',
      category: 'productivity',
      icon: '💻',
      color: '#6366F1',
      featured: true,
      habits: [
        {
          name: '📝 Commit on GitHub',
          description: 'Make at least one meaningful contribution to your projects',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '📚 Read Tech Article',
          description: 'Stay updated with latest technology trends and best practices',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🧩 Solve LeetCode Problem',
          description: 'Practice algorithms and problem-solving skills',
          difficulty: 'hard',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '📖 Learn New Concept',
          description: 'Dedicate time to learning something new in your field',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5, 6]
        },
        {
          name: '🔍 Code Review',
          description: 'Review code or refactor existing code for improvement',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        }
      ]
    },
    {
      name: '🎯 Student Success Pack',
      description: 'Build effective study habits and ace your academic goals',
      category: 'learning',
      icon: '🎯',
      color: '#F59E0B',
      featured: true,
      habits: [
        {
          name: '📝 Study 2 Hours',
          description: 'Dedicated focused study time for your subjects',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5, 6]
        },
        {
          name: '📖 Review Notes',
          description: 'Review and organize your class notes daily',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '✍️ Complete Assignment',
          description: 'Work on and complete your assignments on time',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5, 6]
        },
        {
          name: '🧠 Practice Problems',
          description: 'Solve practice problems to reinforce learning',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '👥 Group Study',
          description: 'Collaborate with peers to enhance understanding',
          difficulty: 'easy',
          targetDays: [2, 4, 6]
        }
      ]
    },
    {
      name: '🧘‍♀️ Mindfulness & Mental Health Pack',
      description: 'Cultivate peace of mind and emotional well-being',
      category: 'mindfulness',
      icon: '🧘‍♀️',
      color: '#8B5CF6',
      featured: false,
      habits: [
        {
          name: '🧘 Meditate 10 Minutes',
          description: 'Practice mindfulness meditation for mental clarity',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '📔 Gratitude Journal',
          description: 'Write down 3 things you are grateful for',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🌅 Morning Affirmations',
          description: 'Start your day with positive affirmations',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '📵 Digital Detox Hour',
          description: 'Spend an hour away from screens and devices',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🌳 Nature Time',
          description: 'Spend time outdoors connecting with nature',
          difficulty: 'easy',
          targetDays: [0, 6]
        }
      ]
    },
    {
      name: '🏋️ Gym Beast Pack',
      description: 'Serious fitness habits for dedicated gym-goers',
      category: 'fitness',
      icon: '🏋️',
      color: '#EF4444',
      featured: false,
      habits: [
        {
          name: '🏋️ Gym Workout',
          description: 'Complete your scheduled gym training session',
          difficulty: 'hard',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '🍗 Protein Intake',
          description: 'Meet your daily protein goals for muscle growth',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '📊 Track Calories',
          description: 'Log your meals and track caloric intake',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '💊 Supplements',
          description: 'Take your daily vitamins and supplements',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '😴 Rest Day Recovery',
          description: 'Active recovery or complete rest for muscle repair',
          difficulty: 'easy',
          targetDays: [0, 6]
        }
      ]
    },
    {
      name: '🎨 Creative Artist Pack',
      description: 'Nurture your creativity and artistic skills daily',
      category: 'productivity',
      icon: '🎨',
      color: '#EC4899',
      featured: false,
      habits: [
        {
          name: '🎨 Create Art',
          description: 'Spend time on your creative projects',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '📸 Visual Inspiration',
          description: 'Collect and study inspiring artwork',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '✏️ Sketch Practice',
          description: 'Daily sketching to improve your skills',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '🎥 Tutorial Learning',
          description: 'Watch and learn from art tutorials',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '🌐 Share Your Work',
          description: 'Post your creations online for feedback',
          difficulty: 'medium',
          targetDays: [2, 5]
        }
      ]
    },
    {
      name: '📈 Entrepreneur Hustle Pack',
      description: 'Build your business with consistent daily actions',
      category: 'productivity',
      icon: '📈',
      color: '#14B8A6',
      featured: false,
      habits: [
        {
          name: '💼 Work on Business',
          description: 'Dedicate focused time to your business goals',
          difficulty: 'hard',
          targetDays: [1, 2, 3, 4, 5, 6]
        },
        {
          name: '📞 Network & Connect',
          description: 'Reach out to potential clients or partners',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '📊 Review Metrics',
          description: 'Track and analyze your business KPIs',
          difficulty: 'easy',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '📝 Content Creation',
          description: 'Create content for marketing and brand building',
          difficulty: 'medium',
          targetDays: [1, 2, 3, 4, 5]
        },
        {
          name: '📚 Learn Business Skills',
          description: 'Study marketing, sales, or other business skills',
          difficulty: 'medium',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        }
      ]
    },
    {
      name: '🌟 Quick Start Pack',
      description: 'Simple habits to get started on your journey. Perfect for absolute beginners!',
      category: 'productivity',
      icon: '🌟',
      color: '#3B82F6',
      featured: true,
      habits: [
        {
          name: '✅ Make Your Bed',
          description: 'Start your day with a small win',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '💧 Drink Water in Morning',
          description: 'Hydrate right after waking up',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        },
        {
          name: '📝 Write 1 Task for Today',
          description: 'Plan your most important task of the day',
          difficulty: 'easy',
          targetDays: [0, 1, 2, 3, 4, 5, 6]
        }
      ]
    }
  ];

  // Clear existing templates (optional - remove this if you want to keep existing ones)
  console.log('Clearing existing templates...');
  await prisma.habitTemplate.deleteMany({});

  // Create all templates
  console.log('Creating templates...');
  for (const template of templates) {
    await prisma.habitTemplate.create({
      data: template
    });
    console.log(`✅ Created template: ${template.name}`);
  }

  console.log('✨ Template seeding completed!');
}

seedTemplates()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
