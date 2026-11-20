import { prisma } from "@/src/prisma";

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return {};
  }
}

export async function getHeaderNavigation() {
  try {
    const menu = await prisma.menu.findUnique({
      where: { location: "header" },
      include: {
        items: {
          where: { parentId: null, isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });
    return menu?.items || [];
  } catch (error) {
    console.error("Error fetching header nav:", error);
    return [];
  }
}

export async function getFooterNavigation() {
  try {
    const menu = await prisma.menu.findUnique({
      where: { location: "footer" },
      include: {
        items: {
          where: { parentId: null, isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
    return menu?.items || [];
  } catch (error) {
    console.error("Error fetching footer nav:", error);
    return [];
  }
}
