const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
console.log("Testing basic Prisma...");
prisma
  .$connect()
  .then(() => console.log("✅ Connected"))
  .catch((err) => console.error("❌ Failed:", err.message))
  .finally(() => process.exit());
