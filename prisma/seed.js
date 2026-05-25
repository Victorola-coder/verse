const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SEED_QUOTES = [
  {
    text: "Music no need permission to enter your spirit.",
    author: "mohbad",
    category: "music",
    theme: "cinematic",
    alignment: "center",
    featured: true,
    likesCount: 109,
  },
  {
    text: "pattern recognition is the highest form of intelligence.",
    author: "vickyJay",
    category: "music",
    theme: "cinematic",
    alignment: "center",
    featured: true,
    likesCount: 7,
  },
  {
    text:"you can plan a pretty picnic, but you can’t predict the weather.",
    author: "alusi",
    category: "life",
    theme: "cinematic",
    alignment: "center",
    featured: true,
    likesCount: 284,
  },
]

async function main() {
  const count = await prisma.quote.count();
  if (count > 0) {
    console.log("Quotes already seeded, skipping.");
    return;
  }

  for (const quote of SEED_QUOTES) {
    await prisma.quote.create({ data: quote });
  }

  console.log(`Seeded ${SEED_QUOTES.length} quotes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
