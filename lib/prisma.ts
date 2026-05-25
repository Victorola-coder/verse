import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (
    databaseUrl &&
    !databaseUrl.includes("pgbouncer=true") &&
    !databaseUrl.includes(":6543")
  ) {
    console.warn(
      "DATABASE_URL may not use Supabase session pooler. Prefer port 6543 with ?pgbouncer=true."
    );
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  prisma = globalForPrisma.prisma;

  const clientAny = prisma as unknown as Record<string, unknown>;
  const modelsToCheck = ["quote", "quoteLike", "quoteDraft"];
  const missingModel = modelsToCheck.find(
    (model) => typeof clientAny[model] === "undefined"
  );

  if (missingModel) {
    console.warn(
      `${missingModel} missing from Prisma client. Recreating client...`
    );
    void prisma.$disconnect().catch(() => undefined);
    prisma = createPrismaClient();
    globalForPrisma.prisma = prisma;
  }
}

if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export { prisma };
