import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BANNERS = [
  {
    title: "👨‍💻 Campus Hackathon '26",
    description: [
      "⏱️ 48 Hours of Coding.",
      "🏆 Win ₹50,000 Prizes.",
      "🍕 Free Food & Swag."
    ],
    buttonText: "Register Now",
    bgClass: "bg-[var(--color-primary-dark)]",
    textClass: "text-[var(--color-text-inverse)]",
    btnClass: "bg-[var(--color-accent-light)] text-[var(--color-primary-dark)] hover:opacity-90 shadow-sm",
    link: "/events/hackathon"
  },
  {
    title: "🏭 Tech Innovation Expo",
    description: [
      "Showcase your best Maker projects",
      "to industry leaders and investors."
    ],
    buttonText: "Book a Stall",
    bgClass: "bg-[var(--color-primary-dark)]",
    textClass: "text-[var(--color-text-inverse)]",
    btnClass: "bg-[var(--color-accent-light)] text-[var(--color-primary-dark)] hover:opacity-90 shadow-sm",
    link: "/events/expo"
  },
  {
    title: "🤖 Robotics Workshop",
    description: [
      "Learn to build autonomous robots.",
      "No prior experience required!"
    ],
    buttonText: "Join Workshop",
    bgClass: "bg-[var(--color-primary-dark)]",
    textClass: "text-[var(--color-text-inverse)]",
    btnClass: "bg-[var(--color-accent-light)] text-[var(--color-primary-dark)] hover:opacity-90 shadow-sm",
    link: "/events/workshop"
  },
  {
    title: "🎉 Campus Events",
    description: [
      "Join guest lectures & seminars.",
      "Stay updated with all campus activities."
    ],
    buttonText: "View Calendar",
    bgClass: "bg-[var(--color-primary-dark)]",
    textClass: "text-[var(--color-text-inverse)]",
    btnClass: "bg-[var(--color-accent-light)] text-[var(--color-primary-dark)] hover:opacity-90 shadow-sm font-bold",
    link: "/events/campus"
  }
];

async function main() {
  console.log("Seeding events...");
  
  // Optional: clear existing events to avoid duplicates
  await prisma.event.deleteMany({});
  
  for (const banner of BANNERS) {
    await prisma.event.create({
      data: banner
    });
  }
  
  console.log("Seeding complete! Check your database.");
}

main()
  .catch(e => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
