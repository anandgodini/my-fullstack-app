import React from "react";
import { prisma } from "@/src/prisma";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import { Users, Mail, Phone, Sparkles } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/src/components/ui/SocialIcons";

export const metadata = {
  title: "Our Team | Antigravity Platform",
  description: "Meet the talented professionals, engineers, and leadership behind our platform.",
};

export default async function PublicTeamPage() {
  let members: any[] = [];
  let departments: any[] = [];

  try {
    const data = await Promise.all([
      prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: { department: true },
      }),
      prisma.teamDepartment.findMany({
        where: { status: "active" },
        orderBy: { displayOrder: "asc" },
        include: { _count: { select: { members: true } } },
      }),
    ]);
    members = data[0];
    departments = data[1];
  } catch (e) {
    console.warn("PublicTeamPage: Failed to load from database", e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Our People
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Meet the Team
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Crafting world-class experiences with a multidisciplinary collective of creators and strategists.
          </p>
        </div>

        {/* Departments Bar */}
        {departments.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
              All Members ({members.length})
            </span>
            {departments.map((d) => (
              <span
                key={d.id}
                className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
              >
                {d.name} ({d._count.members})
              </span>
            ))}
          </div>
        )}

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Users className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
            <p className="text-sm font-semibold">No team members listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 text-center shadow-sm flex flex-col items-center justify-between hover:shadow-xl transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 ring-4 ring-indigo-500/10">
                    {m.profilePhoto ? (
                      <img src={m.profilePhoto} alt={m.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-zinc-400">
                        {m.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {m.fullName}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    {m.designation}
                  </p>
                  {m.department && (
                    <span className="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                      {m.department.name}
                    </span>
                  )}
                  {m.bio && (
                    <p className="text-xs text-zinc-500 mt-4 line-clamp-3 leading-relaxed">
                      {m.bio}
                    </p>
                  )}
                </div>

                {/* Social icons */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 text-zinc-400">
                  {m.email && (
                    <a href={`mailto:${m.email}`} title={m.email} className="hover:text-indigo-600">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {m.linkedinUrl && (
                    <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {m.facebookUrl && (
                    <a href={m.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                      <FacebookIcon className="w-4 h-4" />
                    </a>
                  )}
                  {m.instagramUrl && (
                    <a href={m.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
