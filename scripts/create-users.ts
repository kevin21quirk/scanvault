import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await hash("a15Dz6fl!", 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "kevin@scanvault.co.uk" },
    update: {},
    create: {
      email: "kevin@scanvault.co.uk",
      name: "Kevin Quirk",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create client user
  const client = await prisma.user.upsert({
    where: { email: "kevin.s.quirk@gmail.com" },
    update: {},
    create: {
      email: "kevin.s.quirk@gmail.com",
      name: "Kevin Quirk",
      password: hashedPassword,
      role: "CLIENT",
    },
  });

  console.log("✅ Client user created:", client.email);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
