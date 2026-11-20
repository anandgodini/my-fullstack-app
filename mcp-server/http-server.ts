import express from "express";
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "../src/prisma.js";

const app = express();
app.use(express.json());

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3100;

function createMcpServer() {
  const server = new Server(
    {
      name: "fullstack-cms-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
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
              limit: { type: "number", description: "Limit results" },
            },
          },
        },
        {
          name: "create_blog",
          description: "Create a new blog article in the database.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              content: { type: "string" },
              shortDescription: { type: "string" },
              authorName: { type: "string" },
              status: { type: "string" },
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
              status: { type: "string" },
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
          description: "List custom dynamic CMS pages and section counts.",
          inputSchema: {
            type: "object",
            properties: {
              status: { type: "string" },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    try {
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
          return {
            content: [{ type: "text", text: JSON.stringify(blogs, null, 2) }],
          };
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
          return {
            content: [{ type: "text", text: JSON.stringify(enquiries, null, 2) }],
          };
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
          return {
            content: [{ type: "text", text: JSON.stringify(settings, null, 2) }],
          };
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
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  });

  return server;
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", name: "fullstack-cms-mcp-server", version: "1.0.0" });
});

// Streamable HTTP endpoint for MCP clients
app.all("/mcp", async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => `session-${Date.now()}`,
  });
  await server.connect(transport);
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`[MCP Server] Running on Streamable HTTP link: http://localhost:${PORT}/mcp`);
  console.log(`[MCP Health] http://localhost:${PORT}/health`);
});
