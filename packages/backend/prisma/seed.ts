import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TravelHub database...');

  await prisma.property.create({
    data: {
      title: 'Luxury Oceanfront Villa with Private Infinity Pool',
      location: 'Maui, Hawaii',
      pricePerNight: 450.00,
      rating: 4.95,
    },
  });

  console.log('Seeding complete for TravelHub.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
