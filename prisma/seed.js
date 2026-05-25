const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SEED_QUOTES = [
  {
    text: "Music no need permission to enter your spirit.",
    author: "Mohbad",
    category: "music",
    theme: "cinematic",
    alignment: "center",
    featured: true,
    likesCount: 284,
  },
  {
    text: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius",
    category: "wisdom",
    theme: "dark",
    alignment: "left",
    featured: true,
    likesCount: 412,
  },
  {
    text: "We accept the love we think we deserve.",
    author: "Stephen Chbosky",
    category: "love",
    theme: "beige",
    alignment: "center",
    featured: true,
    likesCount: 891,
  },
  {
    text: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien",
    category: "poetry",
    theme: "minimal",
    alignment: "center",
    featured: false,
    likesCount: 567,
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "life",
    theme: "cinematic",
    alignment: "left",
    featured: false,
    likesCount: 723,
  },
  {
    text: "Where words fail, music speaks.",
    author: "Hans Christian Andersen",
    category: "music",
    theme: "dark",
    alignment: "right",
    featured: false,
    likesCount: 445,
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "wisdom",
    theme: "minimal",
    alignment: "center",
    featured: false,
    likesCount: 334,
  },
];

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
