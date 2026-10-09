import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DuwaTa database...\n");

  // ============================
  // 1. Create Admin User
  // ============================
  const adminEmail = process.env.ADMIN_EMAIL || "admin@duwata.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  console.log(` Admin user created: ${admin.email}`);

  // ============================
  // 2. Create Sample Teams
  // ============================
  const teamData = [
    {
      email: "duwata@example.com",
      password: "password123",
      teamName: "DuwaTa Team",
      managerName: "Juan Dela Cruz",
      phone: "+639171234567",
      location: "Dapitan City",
      players: [
        { firstName: "Juan", lastName: "Dela Cruz", gender: "MALE" as const, birthDate: new Date("1990-05-15") },
        { firstName: "Pedro", lastName: "Santos", gender: "MALE" as const, birthDate: new Date("1992-08-22") },
        { firstName: "Mark", lastName: "Reyes", gender: "MALE" as const, birthDate: new Date("1988-03-10") },
        { firstName: "Carlo", lastName: "Garcia", gender: "MALE" as const, birthDate: new Date("1995-11-30") },
      ],
    },
    {
      email: "smash@example.com",
      password: "password123",
      teamName: "Smash Brothers",
      managerName: "Mike Johnson",
      phone: "+639179876543",
      location: "Dipolog City",
      players: [
        { firstName: "Mike", lastName: "Johnson", gender: "MALE" as const, birthDate: new Date("1991-07-20") },
        { firstName: "Chris", lastName: "Lee", gender: "MALE" as const, birthDate: new Date("1993-01-14") },
        { firstName: "Tom", lastName: "Wilson", gender: "MALE" as const, birthDate: new Date("1989-09-05") },
        { firstName: "Jake", lastName: "Brown", gender: "MALE" as const, birthDate: new Date("1994-04-18") },
      ],
    },
    {
      email: "netwarriors@example.com",
      password: "password123",
      teamName: "Net Warriors",
      managerName: "Sarah Chen",
      phone: "+639175551234",
      location: "Zamboanga City",
      players: [
        { firstName: "Sarah", lastName: "Chen", gender: "FEMALE" as const, birthDate: new Date("1992-12-01") },
        { firstName: "Lisa", lastName: "Park", gender: "FEMALE" as const, birthDate: new Date("1990-06-25") },
        { firstName: "Anna", lastName: "Kim", gender: "FEMALE" as const, birthDate: new Date("1993-02-14") },
        { firstName: "Maya", lastName: "Lopez", gender: "FEMALE" as const, birthDate: new Date("1991-10-08") },
      ],
    },
    {
      email: "picklekings@example.com",
      password: "password123",
      teamName: "Pickle Kings",
      managerName: "David Tan",
      phone: "+639178889999",
      location: "Cagayan de Oro",
      players: [
        { firstName: "David", lastName: "Tan", gender: "MALE" as const, birthDate: new Date("1988-11-15") },
        { firstName: "Ryan", lastName: "Cruz", gender: "MALE" as const, birthDate: new Date("1990-03-20") },
        { firstName: "Alex", lastName: "Rivera", gender: "MALE" as const, birthDate: new Date("1992-07-12") },
        { firstName: "James", lastName: "Santos", gender: "MALE" as const, birthDate: new Date("1994-09-28") },
      ],
    },
  ];

  for (const data of teamData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: hashedPassword,
        role: Role.TEAM,
      },
    });

    const team = await prisma.team.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        teamName: data.teamName,
        managerName: data.managerName,
        phone: data.phone,
        location: data.location,
      },
    });

    // Create players
    for (const player of data.players) {
      const playerId = `${team.id}-${player.firstName}-${player.lastName}`;
      await prisma.player.upsert({
        where: {
          id: playerId,
        },
        update: {},
        create: {
          id: playerId,
          teamId: team.id,
          firstName: player.firstName,
          lastName: player.lastName,
          gender: player.gender,
          birthDate: player.birthDate,
        },
      });
    }

    console.log(` Team created: ${data.teamName} (${data.players.length} players)`);
  }

  // ============================
  // 3. Create Sample Tournament
  // ============================
  const tournament = await prisma.tournament.upsert({
    where: { id: "sample-tournament-1" },
    update: {},
    create: {
      id: "sample-tournament-1",
      name: "Dapitan Pickleball Open 2026",
      description: "The biggest pickleball tournament in Zamboanga del Norte! Open to all teams in the region.",
      location: "Dapitan City Sports Complex",
      startDate: new Date("2026-11-15"),
      endDate: new Date("2026-11-17"),
      registrationDeadline: new Date("2026-11-01"),
      status: "OPEN",
    },
  });

  // Create categories
  const categories = ["Men's Doubles", "Women's Doubles", "Mixed Doubles"];
  for (const catName of categories) {
    const existing = await prisma.category.findFirst({
      where: { tournamentId: tournament.id, name: catName },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          tournamentId: tournament.id,
          name: catName,
        },
      });
    }
  }

  console.log(` Tournament created: ${tournament.name}`);
  console.log(`   Categories: ${categories.join(",")}`);

  console.log("\n Seeding complete!\n");
  console.log("Login Credentials:");
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
  console.log("Teams: [email]@example.com / password123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
