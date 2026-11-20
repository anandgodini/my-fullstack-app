import React from "react";
import { prisma } from "@/src/prisma";
import { notFound } from "next/navigation";
import PageBuilderForm from "@/src/components/forms/PageBuilderForm";

export default async function EditCMSPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.cMSPage.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return <PageBuilderForm initialData={page} isEdit />;
}
