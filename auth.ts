import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import postgres from "postgres";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function getUser(email: string): Promise<User | undefined> {
  // Watching in DB if have an User with especified email
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {

        // Zod Validation
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        // Validation Logic
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
});
