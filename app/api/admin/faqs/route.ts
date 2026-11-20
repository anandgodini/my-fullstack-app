import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().default("General"),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const faqs = await prisma.fAQ.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ success: true, data: faqs });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const item = await prisma.fAQ.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
