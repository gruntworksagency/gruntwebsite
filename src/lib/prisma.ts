import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws as any;
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
export const prisma = new PrismaClient({ adapter });
