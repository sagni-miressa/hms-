import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: npx ts-node scripts/promote-to-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const currentRoles = user.roles;

    if (currentRoles.includes(Role.SYSTEM_ADMIN)) {
      console.log(`User ${email} is already a SYSTEM_ADMIN.`);
      return;
    }

    const newRoles = [...currentRoles, Role.SYSTEM_ADMIN];

    await prisma.user.update({
      where: { email },
      data: {
        roles: newRoles,
      },
    });

    console.log(`✅ User ${email} has been successfully promoted to SYSTEM_ADMIN.`);
    console.log(`Current roles: ${newRoles.join(', ')}`);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
