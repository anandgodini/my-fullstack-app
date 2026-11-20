import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const settings = await prisma.siteSetting.findMany();
  const grouped: Record<string, Record<string, string>> = {};

  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {};
    grouped[s.group][s.key] = s.value;
  }

  return NextResponse.json({ success: true, data: grouped });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json(); // e.g. { group: "general", settings: { site_name: "My Site" } }
    const { group, settings } = body;

    if (!group || !settings) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value ?? ""), group },
        create: { key, value: String(value ?? ""), group },
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
