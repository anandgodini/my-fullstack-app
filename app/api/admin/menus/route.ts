import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const menuItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  target: z.string().default("_self"),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  children: z.array(z.any()).optional().default([]),
});

const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  location: z.string().min(1, "Location is required"),
  items: z.array(menuItemSchema).optional().default([]),
});

export async function GET() {
  const menus = await prisma.menu.findMany({
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ success: true, data: menus });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = menuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, location, items } = parsed.data;

    const menu = await prisma.menu.upsert({
      where: { location },
      update: { name },
      create: { name, location },
    });

    // Replace items
    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parent = await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          url: item.url,
          target: item.target,
          displayOrder: item.displayOrder ?? i + 1,
          isActive: item.isActive ?? true,
        },
      });

      if (item.children && Array.isArray(item.children)) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          await prisma.menuItem.create({
            data: {
              menuId: menu.id,
              parentId: parent.id,
              label: child.label,
              url: child.url,
              target: child.target || "_self",
              displayOrder: child.displayOrder ?? j + 1,
              isActive: child.isActive ?? true,
            },
          });
        }
      }
    }

    const result = await prisma.menu.findUnique({
      where: { id: menu.id },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { displayOrder: "asc" },
          include: {
            children: { orderBy: { displayOrder: "asc" } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
