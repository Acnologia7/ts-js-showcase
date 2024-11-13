import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const prisma = new PrismaClient();
const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID) || 1;
const UPLOAD_DIRECTORY = path.join(
  __dirname,
  process.env.UPLOAD_DIRECTORY || "../../../uploaded_files"
);

async function main() {
  if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
  }
  const userExists = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!userExists) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        username: "default_user",
      },
    });
    console.log("Default user created");
  } else {
    console.log("Default user already exists");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
