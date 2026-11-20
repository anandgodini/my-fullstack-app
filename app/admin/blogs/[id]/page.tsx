import React from "react";
import { prisma } from "@/src/prisma";
import { notFound } from "next/navigation";
import BlogEditorForm from "@/src/components/forms/BlogEditorForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!blog) {
    notFound();
  }

  return <BlogEditorForm initialData={blog} isEdit />;
}
