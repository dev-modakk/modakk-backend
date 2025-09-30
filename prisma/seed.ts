import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.configCarousel.create({
    data: {
      slides: [
        {
          image: "https://example.com/img/hero-1.jpg",
          title: "Welcome to Modakk Kids",
          description: "Handpicked boxes that make kids smile."
        },
        {
          image: "https://example.com/img/hero-2.jpg",
          title: "New Arrivals",
          description: "Fresh, fun, and thoughtfully curated."
        }
      ]
    }
  });
}

main()
  .then(() => console.log("Seeded"))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
