import React from "react";
import { getCurrentAdmin } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/src/components/layout/AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  return (
    <AdminLayoutShell adminUser={{ name: admin.name, email: admin.email }}>
      {children}
    </AdminLayoutShell>
  );
}
