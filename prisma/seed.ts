import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma";

async function main() {
  console.log("Seeding initial CMS data...");

  // 1. Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePassword123!";
  const adminName = process.env.ADMIN_NAME || "System Administrator";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // 2. Settings
  const initialSettings = [
    { group: "general", key: "site_name", value: "Antigravity Dynamic CMS" },
    { group: "general", key: "site_description", value: "A high-performance modern CMS powered by Next.js and PostgreSQL." },
    { group: "general", key: "contact_email", value: "info@example.com" },
    { group: "general", key: "contact_phone", value: "+1 (555) 019-2834" },
    { group: "general", key: "contact_address", value: "100 Innovation Way, Silicon Valley, CA 94025" },
    { group: "general", key: "timezone", value: "UTC" },
    { group: "general", key: "site_logo", value: "" },
    { group: "general", key: "site_favicon", value: "" },

    { group: "header", key: "header_layout", value: "standard" },
    { group: "header", key: "sticky_header", value: "true" },
    { group: "header", key: "cta_text", value: "Get in Touch" },
    { group: "header", key: "cta_url", value: "/contact" },

    { group: "footer", key: "copyright_text", value: `© ${new Date().getFullYear()} Antigravity CMS. All rights reserved.` },
    { group: "footer", key: "footer_description", value: "Empowering next-generation digital experiences with headless flexibility and visual control." },

    { group: "seo", key: "meta_title", value: "Antigravity CMS | Modern High-Performance Dynamic Website" },
    { group: "seo", key: "meta_description", value: "Discover modern dynamic content management built on Next.js, React 19, and PostgreSQL." },
    { group: "seo", key: "robots_index", value: "true" },
    { group: "seo", key: "google_verification", value: "" },

    { group: "social", key: "facebook", value: "https://facebook.com" },
    { group: "social", key: "instagram", value: "https://instagram.com" },
    { group: "social", key: "linkedin", value: "https://linkedin.com" },
    { group: "social", key: "x_twitter", value: "https://x.com" },
    { group: "social", key: "youtube", value: "https://youtube.com" },
  ];

  for (const s of initialSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log("✓ Initial site settings seeded");

  // 3. Menus
  const headerMenu = await prisma.menu.upsert({
    where: { location: "header" },
    update: { name: "Header Navigation" },
    create: {
      name: "Header Navigation",
      location: "header",
    },
  });

  const footerMenu = await prisma.menu.upsert({
    where: { location: "footer" },
    update: { name: "Footer Quick Links" },
    create: {
      name: "Footer Quick Links",
      location: "footer",
    },
  });

  // Ensure header menu items
  const headerCount = await prisma.menuItem.count({ where: { menuId: headerMenu.id } });
  if (headerCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        { menuId: headerMenu.id, label: "Home", url: "/", displayOrder: 1, isActive: true },
        { menuId: headerMenu.id, label: "About", url: "/about", displayOrder: 2, isActive: true },
        { menuId: headerMenu.id, label: "Blogs", url: "/blogs", displayOrder: 3, isActive: true },
        { menuId: headerMenu.id, label: "Gallery", url: "/gallery", displayOrder: 4, isActive: true },
        { menuId: headerMenu.id, label: "Team", url: "/team", displayOrder: 5, isActive: true },
        { menuId: headerMenu.id, label: "Contact", url: "/contact", displayOrder: 6, isActive: true },
      ],
    });
  }

  const footerCount = await prisma.menuItem.count({ where: { menuId: footerMenu.id } });
  if (footerCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        { menuId: footerMenu.id, label: "About Us", url: "/about", displayOrder: 1, isActive: true },
        { menuId: footerMenu.id, label: "Latest Blogs", url: "/blogs", displayOrder: 2, isActive: true },
        { menuId: footerMenu.id, label: "Photo Gallery", url: "/gallery", displayOrder: 3, isActive: true },
        { menuId: footerMenu.id, label: "Contact Support", url: "/contact", displayOrder: 4, isActive: true },
      ],
    });
  }
  console.log("✓ Default menus initialized");

  // 4. Blog Category & Sample Blog
  const category = await prisma.blogCategory.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      name: "Technology",
      slug: "technology",
      description: "Insights and innovations across modern software and design.",
      status: "active",
    },
  });

  const blogCount = await prisma.blog.count();
  if (blogCount === 0) {
    await prisma.blog.create({
      data: {
        title: "Welcome to Our New Dynamic Web Presence",
        slug: "welcome-to-our-new-dynamic-web-presence",
        shortDescription: "Discover how we engineered this seamless platform combining Next.js with PostgreSQL.",
        content: `<h2>A New Era of Web Management</h2><p>We are delighted to introduce our dynamic web platform, custom-built for high performance, intuitive authoring, and seamless user interaction.</p><h3>Key Features</h3><ul><li>Instant publishing with database persistence</li><li>Visual section builder for custom pages</li><li>Integrated media library and gallery collections</li></ul><p>Explore the dashboard to update settings, manage stories, and review inquiries in real time.</p>`,
        featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        categoryId: category.id,
        status: "published",
        isFeatured: true,
        publishedAt: new Date(),
        seoTitle: "Welcome to Our New Dynamic Web Presence",
        seoDescription: "Discover how we engineered this seamless platform combining Next.js with PostgreSQL.",
      },
    });
  }
  console.log("✓ Blog categories and sample blog seeded");

  // 5. Team Department and Member
  const dept = await prisma.teamDepartment.upsert({
    where: { slug: "leadership" },
    update: {},
    create: {
      name: "Leadership",
      slug: "leadership",
      displayOrder: 1,
      status: "active",
    },
  });

  const memberCount = await prisma.teamMember.count();
  if (memberCount === 0) {
    await prisma.teamMember.create({
      data: {
        fullName: "Sarah Jenkins",
        designation: "Chief Executive Officer & Founder",
        departmentId: dept.id,
        bio: "With over 15 years in enterprise technology, Sarah leads our vision for customer-centric digital products.",
        email: "sarah.jenkins@example.com",
        phone: "+1 (555) 432-8765",
        linkedinUrl: "https://linkedin.com",
        profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
        displayOrder: 1,
        isActive: true,
      },
    });
  }
  console.log("✓ Team departments and sample members seeded");

  // 6. FAQs & Testimonials
  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          question: "How do I update website content without technical knowledge?",
          answer: "The CMS Admin Dashboard allows you to edit blogs, pages, media, and navigation in real-time without touching a line of code.",
          category: "General",
          displayOrder: 1,
          isPublished: true,
        },
        {
          question: "Is content immediately reflected on the live site?",
          answer: "Yes, once you publish a blog post, gallery image, or page section, it is immediately queryable and displayed on the public site.",
          category: "General",
          displayOrder: 2,
          isPublished: true,
        },
      ],
    });
  }

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.create({
      data: {
        customerName: "David Vance",
        designation: "VP of Product",
        company: "Apex Innovations",
        content: "The dynamic CMS dashboard transformed how quickly our marketing team can ship pages and tell our story.",
        rating: 5,
        displayOrder: 1,
        isPublished: true,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
    });
  }
  console.log("✓ Sample FAQs and Testimonials seeded");

  // 7. Dynamic About CMS Page with Section Builder Data
  const aboutPage = await prisma.cMSPage.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "About Our Company",
      slug: "about",
      shortDescription: "Learn more about our mission, vision, and the values that drive our team.",
      status: "published",
      publishedAt: new Date(),
      seoTitle: "About Us | Antigravity Platform",
      seoDescription: "Learn more about our mission, vision, and the values that drive our team.",
      sections: [
        {
          id: "section-1",
          type: "hero",
          title: "Building the Future of Digital Experiences",
          subtitle: "We combine craftsmanship with cutting-edge engineering to empower builders worldwide.",
          ctaText: "Discover Our Work",
          ctaUrl: "/gallery",
          bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        },
        {
          id: "section-2",
          type: "about",
          title: "Our Mission & Story",
          content: "Founded with a mission to simplify digital publishing, our platform empowers teams to craft engaging web narratives effortlessly.",
          image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
          stats: [
            { label: "Satisfied Clients", value: "500+" },
            { label: "Uptime Reliability", value: "99.9%" },
            { label: "Global Locations", value: "12" }
          ]
        },
        {
          id: "section-3",
          type: "cta",
          title: "Ready to partner with us?",
          subtitle: "Reach out to our specialists today and let's craft something remarkable together.",
          buttonText: "Contact Us Now",
          buttonUrl: "/contact"
        }
      ],
    },
  });
  console.log(`✓ Sample dynamic CMS Page '${aboutPage.title}' created`);

  console.log("\n🚀 All seed data successfully populated!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
