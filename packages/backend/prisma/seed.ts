import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TravelHub database...');

  const host = await prisma.user.upsert({
    where: { email: 'host@travelhub.dev' },
    update: {},
    create: {
      email: 'host@travelhub.dev',
      password: 'hashed_placeholder',
      firstName: 'Demo',
      lastName: 'Host',
      role: 'HOST',
    },
  });

  await prisma.property.create({
    data: {
      name: 'Luxury Oceanfront Villa with Private Infinity Pool',
      description: 'Beautiful oceanfront villa with stunning views and a private infinity pool.',
      address: '123 Ocean Drive',
      city: 'Maui',
      state: 'Hawaii',
      country: 'US',
      zipCode: '96761',
      type: 'vacation_rental',
      basePrice: 450.00,
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      rating: 4.95,
      hostId: host.id,
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
