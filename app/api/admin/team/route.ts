import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const teamMemberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  profilePhoto: z.string().optional().nullable(),
  designation: z.string().min(1, "Designation is required"),
  departmentId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  bio: z.string().optional().nullable(),
  email: z.string().email("Valid email required").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId") || "";
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
    ];
  }

  const members = await prisma.teamMember.findMany({
    where,
    orderBy: { displayOrder: "asc" },
    include: { department: true },
  });

  return NextResponse.json({ success: true, data: members });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: parsed.data,
      include: { department: true },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
