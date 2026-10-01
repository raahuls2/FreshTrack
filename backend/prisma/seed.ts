import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getDaysDate(offsetDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export async function seedDatabase() {
  console.log('🌱 Seeding FreshTrack database...');

  // Clean existing data
  await prisma.foodWaste.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();
  await prisma.recipe.deleteMany();

  // 1. Create Demo User & Household
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'demo@freshtrack.com',
      passwordHash,
    }
  });

  const household = await prisma.household.create({
    data: {
      name: "Jenkins Family Kitchen",
      ownerId: demoUser.id
    }
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (Password: password123)`);

  // 2. Food Items (with required demo items)
  const today = getDaysDate(0);
  const tomorrow = getDaysDate(1);
  const in2Days = getDaysDate(2);
  const in3Days = getDaysDate(3);
  const in6Days = getDaysDate(6);
  const in15Days = getDaysDate(15);
  const expired2DaysAgo = getDaysDate(-2);
  const expired5DaysAgo = getDaysDate(-5);

  const foodItems = [
    {
      userId: demoUser.id,
      name: 'Spinach',
      category: 'Vegetables',
      quantity: 250,
      unit: 'g',
      expiryDate: today,
      storageLocation: 'Crisper Drawer',
      status: 'EXPIRING_SOON',
      notes: 'Use for salad or omelette today'
    },
    {
      userId: demoUser.id,
      name: 'Tomatoes',
      category: 'Vegetables',
      quantity: 750,
      unit: 'g',
      expiryDate: tomorrow,
      storageLocation: 'Fridge',
      status: 'EXPIRING_SOON',
      notes: 'Vine ripe tomatoes'
    },
    {
      userId: demoUser.id,
      name: 'Bananas',
      category: 'Fruits',
      quantity: 6,
      unit: 'pcs',
      expiryDate: in2Days,
      storageLocation: 'Countertop',
      status: 'EXPIRING_SOON',
      notes: 'Great for smoothies'
    },
    {
      userId: demoUser.id,
      name: 'Milk',
      category: 'Dairy',
      quantity: 1,
      unit: 'L',
      expiryDate: in3Days,
      storageLocation: 'Fridge Door',
      status: 'EXPIRING_SOON',
      notes: 'Whole milk'
    },
    {
      userId: demoUser.id,
      name: 'Apples',
      category: 'Fruits',
      quantity: 1,
      unit: 'kg',
      expiryDate: in6Days,
      storageLocation: 'Fridge',
      status: 'FRESH',
      notes: 'Honeycrisp apples'
    },
    {
      userId: demoUser.id,
      name: 'Potatoes',
      category: 'Vegetables',
      quantity: 2,
      unit: 'kg',
      expiryDate: in15Days,
      storageLocation: 'Pantry',
      status: 'FRESH',
      notes: 'Yukon Gold potatoes'
    },
    {
      userId: demoUser.id,
      name: 'Greek Yogurt',
      category: 'Dairy',
      quantity: 1,
      unit: 'tub',
      expiryDate: expired2DaysAgo,
      storageLocation: 'Fridge',
      status: 'EXPIRED',
      notes: 'Vanilla flavor'
    },
    {
      userId: demoUser.id,
      name: 'Cheddar Cheese',
      category: 'Dairy',
      quantity: 200,
      unit: 'g',
      expiryDate: in6Days,
      storageLocation: 'Fridge',
      status: 'FRESH',
      notes: 'Aged sharp cheddar'
    }
  ];

  for (const item of foodItems) {
    await prisma.foodItem.create({ data: item });
  }

  // 3. Shopping List Items
  const shoppingItems = [
    { userId: demoUser.id, name: 'Eggs', quantity: 12, unit: 'pcs', purchased: false },
    { userId: demoUser.id, name: 'Whole Wheat Bread', quantity: 1, unit: 'loaf', purchased: false },
    { userId: demoUser.id, name: 'Butter', quantity: 250, unit: 'g', purchased: true },
    { userId: demoUser.id, name: 'Extra Virgin Olive Oil', quantity: 500, unit: 'ml', purchased: false },
    { userId: demoUser.id, name: 'Oatmeal', quantity: 1, unit: 'box', purchased: true }
  ];

  for (const shopItem of shoppingItems) {
    await prisma.shoppingItem.create({ data: shopItem });
  }

  // 4. Waste Log Data
  const wasteItems = [
    { userId: demoUser.id, name: 'Avocados', quantity: 2, unit: 'pcs', reason: 'Expired', date: getDaysDate(-4) },
    { userId: demoUser.id, name: 'Strawberries', quantity: 1, unit: 'punnet', reason: 'Spoiled/Moldy', date: getDaysDate(-8) },
    { userId: demoUser.id, name: 'Sourdough Bread', quantity: 0.5, unit: 'loaf', reason: 'Stale', date: getDaysDate(-12) }
  ];

  for (const waste of wasteItems) {
    await prisma.foodWaste.create({ data: waste });
  }

  // 5. Recipes for Ingredient Matching
  const recipes = [
    {
      name: 'Tomato & Spinach Omelette',
      category: 'Breakfast',
      ingredients: JSON.stringify(['Tomatoes', 'Spinach', 'Eggs', 'Butter']),
      instructions: '1. Whisk eggs in a bowl with a pinch of salt.\n2. Sauté chopped spinach and tomatoes in butter for 2 mins.\n3. Pour eggs over veggies and cook on medium heat until set.\n4. Fold in half and serve warm.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Creamy Potato & Milk Soup',
      category: 'Soup',
      ingredients: JSON.stringify(['Potatoes', 'Milk', 'Butter', 'Cheddar Cheese']),
      instructions: '1. Peel and dice Yukon Gold potatoes.\n2. Boil potatoes in salted water until tender.\n3. Mash coarsely, stir in warm milk and butter.\n4. Top with shredded cheddar cheese and serve.',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Banana Apple Protein Smoothie',
      category: 'Drinks',
      ingredients: JSON.stringify(['Bananas', 'Apples', 'Milk', 'Greek Yogurt']),
      instructions: '1. Slice ripe bananas and apples.\n2. Add to blender with 1 cup of cold milk and a spoon of yogurt.\n3. Blend on high speed for 45 seconds until silky smooth.\n4. Pour into tall glasses and enjoy!',
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Fresh Spinach Tomato Salad',
      category: 'Salad',
      ingredients: JSON.stringify(['Spinach', 'Tomatoes', 'Cheddar Cheese', 'Olive Oil']),
      instructions: '1. Wash fresh spinach leaves and pat dry.\n2. Halve vine tomatoes and slice cheddar into cubes.\n3. Toss in a large salad bowl with drizzled olive oil.\n4. Serve fresh immediately.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
    }
  ];

  for (const recipe of recipes) {
    await prisma.recipe.create({ data: recipe });
  }

  console.log('✅ FreshTrack Database successfully seeded!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
