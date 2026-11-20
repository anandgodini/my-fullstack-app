import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! We will be in touch shortly.",
      data: enquiry,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
