import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const adminUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: "connected",
      userCount,
      adminConfigured: !!adminUser,
      adminEmail: adminUser?.email || null,
      databaseUrlPrefix: (process.env.DATABASE_URL || "").split("@")[1] || "unknown",
      hasSessionSecret: !!process.env.SESSION_SECRET,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
