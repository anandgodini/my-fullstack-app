import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Mail,
  Sparkles,
  Phone,
  MapPin,
} from "lucide-react";

interface SectionRendererProps {
  sections: any[];
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <div className="space-y-16 py-8">
      {sections.map((sec: any, idx: number) => {
        switch (sec.type) {
          case "hero":
            return (
              <section
                key={sec.id || idx}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-900 to-black text-white p-8 sm:p-16 my-4 shadow-xl border border-zinc-800"
              >
                {sec.bgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
                    style={{ backgroundImage: `url(${sec.bgImage})` }}
                  />
                )}
                <div className="relative max-w-2xl space-y-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold ring-1 ring-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Featured Dynamic Page
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    {sec.title}
                  </h1>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    {sec.subtitle}
                  </p>
                  {sec.buttonText && (
                    <div className="pt-2">
                      <Link
                        href={sec.buttonUrl || "/contact"}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                      >
                        <span>{sec.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );

          case "about":
            return (
              <section key={sec.id || idx} className="py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {sec.title}
                    </h2>
                    {sec.subtitle && (
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {sec.subtitle}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {sec.content}
                    </p>

                    {sec.stats && Array.isArray(sec.stats) && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {sec.stats.map((st: any, i: number) => (
                          <div key={i}>
                            <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                              {st.value}
                            </div>
                            <div className="text-[11px] text-zinc-500">{st.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {sec.image && (
                    <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
                      <img src={sec.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </section>
            );

          case "stats":
            return (
              <section
                key={sec.id || idx}
                className="bg-indigo-50/70 dark:bg-indigo-950/20 rounded-3xl p-8 sm:p-12 border border-indigo-100 dark:border-indigo-900/50"
              >
                <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{sec.title}</h3>
                  {sec.subtitle && <p className="text-xs text-zinc-500">{sec.subtitle}</p>}
                </div>
                {sec.stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    {sec.stats.map((st: any, i: number) => (
                      <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                        <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          {st.value}
                        </div>
                        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );

          case "cta":
            return (
              <section
                key={sec.id || idx}
                className="bg-zinc-900 dark:bg-zinc-900 text-white rounded-3xl p-8 sm:p-12 text-center border border-zinc-800 shadow-xl space-y-6"
              >
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{sec.title}</h3>
                {sec.subtitle && (
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    {sec.subtitle}
                  </p>
                )}
                {sec.buttonText && (
                  <Link
                    href={sec.buttonUrl || "/contact"}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-transform hover:scale-105"
                  >
                    <span>{sec.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </section>
            );

          case "text":
            return (
              <section key={sec.id || idx} className="max-w-3xl mx-auto space-y-4">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{sec.title}</h3>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </div>
              </section>
            );

          case "services":
            return (
              <section key={sec.id || idx} className="space-y-8">
                <div className="text-center max-w-lg mx-auto space-y-2">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{sec.title}</h3>
                  {sec.subtitle && <p className="text-xs text-zinc-500">{sec.subtitle}</p>}
                </div>
                {sec.items && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {sec.items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2"
                      >
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );

          default:
            return (
              <section key={sec.id || idx} className="py-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  {sec.title}
                </h3>
                {sec.subtitle && <p className="text-xs text-zinc-500">{sec.subtitle}</p>}
              </section>
            );
        }
      })}
    </div>
  );
}
