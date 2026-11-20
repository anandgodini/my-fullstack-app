#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "../src/prisma.js";

// Initialize MCP Server
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

// Define tool list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_dashboard_stats",
        description: "Fetch live summary statistics of blogs, gallery images, team members, pages, and enquiries from the PostgreSQL database.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_blogs",
        description: "List blogs with status, author, and categories.",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Optional filter by status ('draft' | 'published' | 'scheduled')",
            },
            limit: {
              type: "number",
              description: "Maximum number of blogs to return (default 10)",
            },
          },
        },
      },
      {
        name: "create_blog",
        description: "Create a new blog article in the database.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Title of the blog post" },
            slug: { type: "string", description: "Unique URL slug" },
            content: { type: "string", description: "HTML or markdown content" },
            shortDescription: { type: "string", description: "Brief excerpt or summary" },
            authorName: { type: "string", description: "Author name (defaults to 'Admin')" },
            status: { type: "string", description: "'draft' or 'published' (default 'draft')" },
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
            status: {
              type: "string",
              description: "Optional status filter ('new' | 'in_progress' | 'resolved')",
            },
            limit: {
              type: "number",
              description: "Maximum number of enquiries to return (default 10)",
            },
          },
        },
      },
      {
        name: "update_enquiry_status",
        description: "Update the status of a customer contact enquiry.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "The UUID of the enquiry" },
            status: {
              type: "string",
              description: "New status ('new' | 'in_progress' | 'resolved')",
            },
          },
          required: ["id", "status"],
        },
      },
      {
        name: "get_site_settings",
        description: "Fetch all stored site settings (general, header, footer, SEO, social).",
        inputSchema: {
          type: "object",
          properties: {
            group: {
              type: "string",
              description: "Optional setting group ('general' | 'header' | 'footer' | 'seo' | 'social')",
            },
          },
        },
      },
      {
        name: "update_site_setting",
        description: "Update or insert a key-value site setting.",
        inputSchema: {
          type: "object",
          properties: {
            group: { type: "string", description: "Setting group" },
            key: { type: "string", description: "Unique setting key" },
            value: { type: "string", description: "Setting string value" },
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
            status: {
              type: "string",
              description: "Optional status filter ('draft' | 'published')",
            },
          },
        },
      },
    ],
  };
});

// Tool invocation handlers
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
          content: [
            {
              type: "text",
              text: JSON.stringify(blogs, null, 2),
            },
          ],
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
              text: `Blog created successfully with ID: ${blog.id} (slug: /blogs/${blog.slug})`,
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
          content: [
            {
              type: "text",
              text: JSON.stringify(enquiries, null, 2),
            },
          ],
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
              text: `Enquiry from ${updated.name} updated to status: '${updated.status}'`,
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
          content: [
            {
              type: "text",
              text: JSON.stringify(settings, null, 2),
            },
          ],
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
              text: `Setting '${setting.key}' saved successfully: "${setting.value}"`,
            },
          ],
        };
      }

      case "list_cms_pages": {
        const status = args.status as string | undefined;

        const pages = await prisma.cMSPage.findMany({
          where: status ? { status } : undefined,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            updatedAt: true,
            sections: true,
          },
        });

        const formatted = pages.map((p) => ({
          id: p.id,
          title: p.title,
          slug: `/${p.slug}`,
          status: p.status,
          sectionCount: Array.isArray(p.sections) ? p.sections.length : 0,
          updatedAt: p.updatedAt,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start Stdio Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP Server fatal error:", err);
  process.exit(1);
});
