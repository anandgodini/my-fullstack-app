import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  avatar: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: admin.userId },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });

  return NextResponse.json({ success: true, user });
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, avatar, currentPassword, newPassword } = parsed.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const updateData: { name: string; email: string; avatar?: string | null; password?: string } = {
      name,
      email: email.toLowerCase(),
      avatar: avatar ?? null,
    };

    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to change password" },
          { status: 400 }
        );
      }
      const match = await bcrypt.compare(currentPassword, currentUser.password);
      if (!match) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: admin.userId },
      data: updateData,
      select: { id: true, name: true, email: true, avatar: true },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update profile" }, { status: 500 });
  }
}
