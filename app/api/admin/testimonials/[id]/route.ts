import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const testimonialSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  designation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().int().min(1).max(5).default(5),
  displayOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
