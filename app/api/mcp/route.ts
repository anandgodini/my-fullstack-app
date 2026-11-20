import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma";

// List of supported MCP tools and their JSON schemas
const TOOLS = [
  {
    name: "get_dashboard_stats",
    description: "Fetch live summary statistics of blogs, gallery images, team members, pages, and enquiries from PostgreSQL.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_blogs",
    description: "List blogs with status, author, and categories.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status ('draft' | 'published' | 'scheduled')" },
        limit: { type: "number", description: "Limit results (default 10)" },
      },
    },
  },
  {
    name: "create_blog",
    description: "Create a new blog article directly in the production database.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        content: { type: "string" },
        shortDescription: { type: "string" },
        authorName: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
      },
      required: ["title", "slug", "content"],
    },
  },
  {
    name: "list_enquiries",
    description: "List contact inquiries submitted through the website.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "'new' | 'in_progress' | 'resolved'" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "update_enquiry_status",
    description: "Update the status of a customer contact enquiry.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["new", "in_progress", "resolved"] },
      },
      required: ["id", "status"],
    },
  },
  {
    name: "get_site_settings",
    description: "Fetch all stored site settings.",
    inputSchema: {
      type: "object",
      properties: {
        group: { type: "string" },
      },
    },
  },
  {
    name: "update_site_setting",
    description: "Update or insert a key-value site setting.",
    inputSchema: {
      type: "object",
      properties: {
        group: { type: "string" },
        key: { type: "string" },
        value: { type: "string" },
      },
      required: ["group", "key", "value"],
    },
  },
  {
    name: "list_cms_pages",
    description: "List all dynamic CMS landing pages.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "'draft' | 'published'" },
      },
    },
  },
];

// Tool execution logic
async function executeTool(name: string, args: Record<string, any> = {}) {
  switch (name) {
    case "get_dashboard_stats": {
      const [
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalGalleryImages,
        totalTeamMembers,
        totalCMSPages,
        totalContactEnquiries,
        pendingEnquiries,
      ] = await Promise.all([
        prisma.blog.count(),
        prisma.blog.count({ where: { status: "published" } }),
        prisma.blog.count({ where: { status: "draft" } }),
        prisma.galleryImage.count(),
        prisma.teamMember.count(),
        prisma.cMSPage.count(),
        prisma.contactEnquiry.count(),
        prisma.contactEnquiry.count({ where: { status: "new" } }),
      ]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                totalBlogs,
                publishedBlogs,
                draftBlogs,
                totalGalleryImages,
                totalTeamMembers,
                totalCMSPages,
                totalContactEnquiries,
                pendingEnquiries,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "list_blogs": {
      const status = args.status as string | undefined;
      const limit = typeof args.limit === "number" ? args.limit : 10;
      const blogs = await prisma.blog.findMany({
        where: status ? { status } : undefined,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          authorName: true,
          shortDescription: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(blogs, null, 2) }] };
    }

    case "create_blog": {
      const title = String(args.title);
      const slug = String(args.slug);
      const content = String(args.content);
      const shortDescription = args.shortDescription ? String(args.shortDescription) : null;
      const authorName = args.authorName ? String(args.authorName) : "Admin";
      const status = args.status === "published" ? "published" : "draft";

      const blog = await prisma.blog.create({
        data: {
          title,
          slug,
          content,
          shortDescription,
          authorName,
          status,
          publishedAt: status === "published" ? new Date() : null,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `Blog created with ID: ${blog.id} (slug: /blogs/${blog.slug})`,
          },
        ],
      };
    }

    case "list_enquiries": {
      const status = args.status as string | undefined;
      const limit = typeof args.limit === "number" ? args.limit : 10;
      const enquiries = await prisma.contactEnquiry.findMany({
        where: status ? { status } : undefined,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return { content: [{ type: "text", text: JSON.stringify(enquiries, null, 2) }] };
    }

    case "update_enquiry_status": {
      const id = String(args.id);
      const status = String(args.status);
      const updated = await prisma.contactEnquiry.update({
        where: { id },
        data: { status },
      });
      return {
        content: [
          {
            type: "text",
            text: `Enquiry from ${updated.name} updated to: '${updated.status}'`,
          },
        ],
      };
    }

    case "get_site_settings": {
      const group = args.group as string | undefined;
      const settings = await prisma.siteSetting.findMany({
        where: group ? { group } : undefined,
        orderBy: { key: "asc" },
      });
      return { content: [{ type: "text", text: JSON.stringify(settings, null, 2) }] };
    }

    case "update_site_setting": {
      const group = String(args.group);
      const key = String(args.key);
      const value = String(args.value);
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value, group },
        create: { group, key, value },
      });
      return {
        content: [
          {
            type: "text",
            text: `Setting '${setting.key}' saved: "${setting.value}"`,
          },
        ],
      };
    }

    case "list_cms_pages": {
      const status = args.status as string | undefined;
      const pages = await prisma.cMSPage.findMany({
        where: status ? { status } : undefined,
        orderBy: { updatedAt: "desc" },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              pages.map((p) => ({
                id: p.id,
                title: p.title,
                slug: `/${p.slug}`,
                status: p.status,
                sectionCount: Array.isArray(p.sections) ? p.sections.length : 0,
              })),
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Handle single JSON-RPC message
async function handleJsonRpcRequest(rpc: any) {
  const { id, method, params } = rpc;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: "fullstack-cms-mcp-server",
          version: "1.0.0",
        },
      },
    };
  }

  if (method === "notifications/initialized") {
    return null; // Notifications don't require response
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: TOOLS,
      },
    };
  }

  if (method === "tools/call") {
    try {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const result = await executeTool(toolName, toolArgs);
      return {
        jsonrpc: "2.0",
        id,
        result,
      };
    } catch (err: any) {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        },
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  };
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      status: "online",
      name: "fullstack-cms-mcp-server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      endpoint: "https://my-fullstack-app-tawny.vercel.app/api/mcp",
      capabilities: {
        tools: TOOLS.map((t) => t.name),
      },
      tools: TOOLS,
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map((req) => handleJsonRpcRequest(req)));
      const filtered = responses.filter((r) => r !== null);
      return NextResponse.json(filtered, { headers: CORS_HEADERS });
    }

    const response = await handleJsonRpcRequest(body);
    if (!response) {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: `Parse error: ${err.message}`,
        },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
