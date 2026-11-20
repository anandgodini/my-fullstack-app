import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/prisma";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Simple safeguard key
    const expectedSecret = process.env.SESSION_SECRET || "setup-admin-secret-key";
    if (key !== expectedSecret) {
      return NextResponse.json({ success: false, message: "Unauthorized key" }, { status: 401 });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePassword123!";
    const adminName = process.env.ADMIN_NAME || "System Administrator";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        password: hashedPassword,
      },
      create: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
      },
    });

    // Also ensure initial site settings exist
    const settingsCount = await prisma.siteSetting.count();
    if (settingsCount === 0) {
      await prisma.siteSetting.createMany({
        data: [
          { group: "general", key: "site_name", value: "Antigravity Dynamic CMS" },
          { group: "general", key: "site_description", value: "A high-performance modern CMS powered by Next.js and PostgreSQL." },
          { group: "general", key: "contact_email", value: adminEmail },
          { group: "header", key: "cta_text", value: "Get in Touch" },
          { group: "header", key: "cta_url", value: "/contact" },
          { group: "footer", key: "copyright_text", value: `© ${new Date().getFullYear()} Antigravity CMS. All rights reserved.` },
          { group: "seo", key: "meta_title", value: "Antigravity CMS | Modern Dynamic Website" },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Admin account and basic settings successfully created in production database!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
