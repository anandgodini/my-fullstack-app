import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma";

export async function GET() {
  try {
    // Run a lightweight probe query through Prisma using the configured PG adapter
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        success: true,
        database: "connected",
        message: "PostgreSQL connection successful",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 503 }
    );
  }
}
