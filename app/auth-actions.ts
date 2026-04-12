"use server";

import { compare, hash } from "bcryptjs";
import AuthError from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import prisma from "@/lib/prisma";

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const name = getStringValue(formData.get("name"));
  const email = getStringValue(formData.get("email")).toLowerCase();
  const password = getStringValue(formData.get("password"));

  if (!email || !password) {
    redirect("/register?error=missing_fields");
  }

  if (password.length < 8) {
    redirect("/register?error=password_too_short");
  }

  const passwordHash = await hash(password, 12);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser?.passwordHash) {
    redirect("/register?error=email_exists");
  }

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: existingUser.name ?? (name || null),
        passwordHash,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
      },
    });
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });
}

export async function loginAction(formData: FormData) {
  const email = getStringValue(formData.get("email")).toLowerCase();
  const password = getStringValue(formData.get("password"));

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid_credentials");
    }
    throw error;
  }
}

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = getStringValue(formData.get("currentPassword"));
  const newPassword = getStringValue(formData.get("newPassword"));
  const confirmPassword = getStringValue(formData.get("confirmPassword"));

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/profile?error=missing_fields");
  }

  if (newPassword.length < 8) {
    redirect("/profile?error=password_too_short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/profile?error=password_mismatch");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "google" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    redirect("/profile?error=user_not_found");
  }

  const hasGoogleAccount = user.accounts.length > 0;
  if (hasGoogleAccount || !user.passwordHash) {
    redirect("/profile?error=google_account");
  }

  const isCurrentPasswordValid = await compare(currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    redirect("/profile?error=invalid_current_password");
  }

  const newPasswordHash = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  redirect("/profile?success=password_updated");
}
