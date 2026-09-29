"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

const BCRYPT_ROUNDS = 12;

export type AuthFormState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<"name" | "email" | "password", string[]>>;
      values?: { name?: string; email?: string };
    }
  | { status: "success"; redirectTo: string };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = {
    name: getString(formData, "name"),
    email: getString(formData, "email"),
  };
  const parsed = registerSchema.safeParse({
    ...values,
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { name, email, password } = parsed.data;
  const emailTaken: AuthFormState = {
    status: "error",
    message: "An account with this email already exists.",
    fieldErrors: { email: ["An account with this email already exists."] },
    values,
  };

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return emailTaken;

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    // Nested create runs in a single transaction: the user and their
    // default categories are created together or not at all.
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        categories: { createMany: { data: DEFAULT_CATEGORIES } },
      },
    });
  } catch (error) {
    // Another request registered the same email between the check and insert.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return emailTaken;
    }
    throw error;
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account exists, only the automatic sign-in failed.
      return { status: "success", redirectTo: "/login" };
    }
    throw error;
  }

  return { status: "success", redirectTo: "/app" };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const values = { email: getString(formData, "email") };
  const parsed = loginSchema.safeParse({
    ...values,
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Something went wrong. Please try again.",
        values,
      };
    }
    throw error;
  }

  return {
    status: "success",
    redirectTo: getSafeRedirect(formData.get("callbackUrl")),
  };
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
