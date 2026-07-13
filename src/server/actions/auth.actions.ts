"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  normalizeRnc,
  registerCompanySchema,
  type LoginInput,
  type RegisterCompanyInput,
} from "@/lib/validations/auth.schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa el correo y la contraseña." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function registerCompanyAction(
  input: RegisterCompanyInput
): Promise<ActionResult> {
  const parsed = registerCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const rnc = normalizeRnc(data.rnc);

  const [existingUser, existingCompany] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.company.findUnique({ where: { rnc } }),
  ]);
  if (existingUser) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }
  if (existingCompany) {
    return { ok: false, error: "Ya existe una empresa registrada con ese RNC." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "COMPANY",
      company: {
        create: {
          legalName: data.legalName,
          rnc,
          contactName: data.contactName,
          email,
          phone: data.phone,
        },
      },
    },
  });

  // Inicia sesión de inmediato con las credenciales recién creadas.
  try {
    await signIn("credentials", {
      email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // La cuenta se creó bien; que inicie sesión manualmente.
      return { ok: true };
    }
    throw error;
  }

  return { ok: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
