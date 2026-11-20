import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const deptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  displayOrder: z.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET() {
  const depts = await prisma.teamDepartment.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { members: true } } },
  });
  return NextResponse.json({ success: true, data: depts });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = deptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const dept = await prisma.teamDepartment.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: dept });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
